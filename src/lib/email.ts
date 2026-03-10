import type { Env, Member, Post } from '../index';
import { generateToken } from './auth';
import { escapeHtml } from './utils';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// ─── Send via Resend (primary) or Gmail (fallback) ───

async function sendViaResend(apiKey: string, fromEmail: string, params: EmailParams): Promise<boolean> {
  try {
    const body: any = {
      from: `Sunday Sauce <${fromEmail}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    };
    if (params.replyTo) {
      body.reply_to = params.replyTo;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend send failed:', errorText);
    }
    return response.ok;
  } catch (err) {
    console.error('Resend send error:', err);
    return false;
  }
}

async function getGmailAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail token refresh failed: ${errorText}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

function buildRawEmail(from: string, to: string, subject: string, html: string): string {
  const boundary = 'boundary_' + Date.now();
  const lines = [
    `From: Sunday Sauce <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(html))),
    `--${boundary}--`,
  ];
  return lines.join('\r\n');
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendViaGmail(env: Env['Bindings'], params: EmailParams): Promise<boolean> {
  try {
    const accessToken = await getGmailAccessToken(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GMAIL_REFRESH_TOKEN
    );

    const rawEmail = buildRawEmail(env.ADMIN_EMAIL, params.to, params.subject, params.html);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: base64UrlEncode(rawEmail) }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gmail send failed:', errorText);
    }
    return response.ok;
  } catch (err) {
    console.error('Gmail send error:', err);
    return false;
  }
}

export async function sendEmail(
  env: Env['Bindings'],
  params: EmailParams
): Promise<boolean> {
  // Use Resend with noreply@alexandramilak.com, reply-to alex.milak@gmail.com
  if (env.RESEND_API_KEY) {
    const sent = await sendViaResend(
      env.RESEND_API_KEY,
      'noreply@alexandramilak.com',
      { ...params, replyTo: params.replyTo || env.ADMIN_EMAIL }
    );
    if (sent) return true;
    console.error('Resend failed, falling back to Gmail');
  }

  // Fallback to Gmail
  if (env.GMAIL_REFRESH_TOKEN) {
    return sendViaGmail(env, params);
  }

  console.error('No email provider configured');
  return false;
}

// ─── Email Footer ───

function emailFooter(baseUrl: string, unsubscribeToken?: string): string {
  const unsubLink = unsubscribeToken
    ? `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`
    : null;
  const leaveLink = unsubscribeToken
    ? `${baseUrl}/api/leave?token=${unsubscribeToken}`
    : null;

  return `
    <div style="border-top: 1px solid #e8e0d8; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 12px; color: #7A6B63;">
      <p style="margin: 0 0 8px;">You're receiving this because you're a member of Sunday Sauce by Alexandra Milak.</p>
      <p style="margin: 0;">
        ${unsubLink ? `<a href="${unsubLink}" style="color: #7A6B63; text-decoration: underline;">Unsubscribe from emails</a>` : ''}
        ${unsubLink && leaveLink ? ' &middot; ' : ''}
        ${leaveLink ? `<a href="${leaveLink}" style="color: #7A6B63; text-decoration: underline;">Leave Sunday Sauce</a>` : ''}
      </p>
    </div>
  `;
}

// ─── Email Templates ───

export async function sendApprovalEmail(
  env: Env['Bindings'],
  member: { id: number; name: string; email: string; referrerName?: string },
  baseUrl?: string
): Promise<void> {
  const approveToken = generateToken();
  const denyToken = generateToken();

  await env.DB.prepare(
    'INSERT INTO approval_tokens (token, member_id, action) VALUES (?, ?, ?)'
  ).bind(approveToken, member.id, 'approve').run();

  await env.DB.prepare(
    'INSERT INTO approval_tokens (token, member_id, action) VALUES (?, ?, ?)'
  ).bind(denyToken, member.id, 'deny').run();

  const siteUrl = baseUrl || env.SITE_URL;
  const approveUrl = `${siteUrl}/api/approve/${approveToken}`;
  const denyUrl = `${siteUrl}/api/deny/${denyToken}`;

  const referralInfo = member.referrerName
    ? `<p style="margin: 0 0 8px; color: #2C1810;"><strong>Referred by:</strong> ${escapeHtml(member.referrerName)}</p>`
    : '';

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 8px;">New Membership Request</h1>
      <p style="color: #7A6B63; font-size: 14px; margin-bottom: 32px;">Sunday Sauce</p>
      <div style="background: #FFF8F0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <p style="margin: 0 0 8px; color: #2C1810;"><strong>Name:</strong> ${escapeHtml(member.name)}</p>
        <p style="margin: 0 0 8px; color: #2C1810;"><strong>Email:</strong> ${escapeHtml(member.email)}</p>
        ${referralInfo}
      </div>
      <div style="text-align: center;">
        <a href="${approveUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; margin-right: 12px;">Approve</a>
        <a href="${denyUrl}" style="display: inline-block; background: #e8e0d8; color: #2C1810; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Deny</a>
      </div>
    </div>
  `;

  await sendEmail(env, {
    to: env.ADMIN_EMAIL,
    subject: `New membership request from ${member.name}${member.referrerName ? ` (referred by ${member.referrerName})` : ''}`,
    html,
  });
}

export async function sendWelcomeEmail(
  env: Env['Bindings'],
  member: { email: string; name: string },
  magicLinkToken: string,
  baseUrl?: string
): Promise<void> {
  const loginUrl = `${baseUrl || env.SITE_URL}/auth/verify?token=${magicLinkToken}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 8px;">Welcome to Sunday Sauce!</h1>
      <p style="color: #7A6B63; font-size: 14px; margin-bottom: 32px;">You're in.</p>
      <p style="color: #2C1810; line-height: 1.6;">Hi ${escapeHtml(member.name)},</p>
      <p style="color: #2C1810; line-height: 1.6;">Your membership has been approved! Click the button below to access Sunday Sauce.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Enter Sunday Sauce</a>
      </div>
      <p style="color: #7A6B63; font-size: 13px;">This link expires in 15 minutes. You can always request a new one from the login page.</p>
    </div>
  `;

  await sendEmail(env, {
    to: member.email,
    subject: 'Welcome to Sunday Sauce!',
    html,
  });
}

export async function sendMagicLinkEmail(
  env: Env['Bindings'],
  email: string,
  token: string,
  baseUrl?: string
): Promise<void> {
  const loginUrl = `${baseUrl || env.SITE_URL}/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 8px;">Log in to Sunday Sauce</h1>
      <p style="color: #2C1810; line-height: 1.6;">Click the button below to log in. No password needed.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Log In</a>
      </div>
      <p style="color: #7A6B63; font-size: 13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail(env, {
    to: email,
    subject: 'Your Sunday Sauce login link',
    html,
  });
}

export async function sendNewPostEmail(
  env: Env['Bindings'],
  post: Post,
  members: Member[],
  baseUrl?: string
): Promise<void> {
  const siteUrl = baseUrl || env.SITE_URL;
  const postUrl = `${siteUrl}/feed/${post.slug}`;

  // Send emails in batches of 10 to avoid hitting limits
  const batchSize = 10;
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    await Promise.all(batch.map(member => {
      const shareUrl = member.referral_code
        ? `${siteUrl}/?ref=${member.referral_code}`
        : siteUrl;

      const html = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <p style="color: #7A6B63; font-size: 14px; margin-bottom: 8px;">Sunday Sauce</p>
          <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 16px;">${escapeHtml(post.title)}</h1>
          ${post.excerpt ? `<p style="color: #2C1810; line-height: 1.6; margin-bottom: 24px;">${escapeHtml(post.excerpt)}</p>` : ''}
          <div style="text-align: center; margin: 32px 0;">
            <a href="${postUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Read Post</a>
          </div>
          <div style="text-align: center; margin: 16px 0;">
            <p style="color: #7A6B63; font-size: 13px;">Know someone who'd enjoy this? <a href="${shareUrl}" style="color: #722F37;">Invite them to Sunday Sauce</a></p>
          </div>
          ${emailFooter(siteUrl, member.unsubscribe_token || undefined)}
        </div>
      `;

      return sendEmail(env, {
        to: member.email,
        subject: `New post: ${post.title}`,
        html,
      });
    }));
  }
}

export async function sendCommentNotificationEmail(
  env: Env['Bindings'],
  commenter: { name: string },
  postTitle: string,
  postSlug: string,
  commentText: string,
  baseUrl?: string
): Promise<void> {
  const postUrl = `${baseUrl || env.SITE_URL}/feed/${postSlug}#comments`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="color: #7A6B63; font-size: 14px; margin-bottom: 8px;">Sunday Sauce</p>
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 24px; margin-bottom: 16px;">New Comment on "${escapeHtml(postTitle)}"</h1>
      <div style="background: #FFF8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #2C1810;"><strong>${escapeHtml(commenter.name)}</strong> wrote:</p>
        <p style="margin: 0; color: #2C1810; white-space: pre-wrap;">${escapeHtml(commentText)}</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${postUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">View Comment</a>
      </div>
    </div>
  `;

  await sendEmail(env, {
    to: env.ADMIN_EMAIL,
    subject: `New comment from ${commenter.name} on "${postTitle}"`,
    html,
  });
}

export async function sendReplyNotificationEmail(
  env: Env['Bindings'],
  recipientEmail: string,
  recipientName: string,
  replierName: string,
  postTitle: string,
  postSlug: string,
  replyText: string,
  recipientUnsubscribeToken?: string,
  baseUrl?: string
): Promise<void> {
  const siteUrl = baseUrl || env.SITE_URL;
  const postUrl = `${siteUrl}/feed/${postSlug}#comments`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="color: #7A6B63; font-size: 14px; margin-bottom: 8px;">Sunday Sauce</p>
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 24px; margin-bottom: 16px;">${escapeHtml(replierName)} replied to your comment</h1>
      <p style="color: #2C1810; margin-bottom: 16px;">On "${escapeHtml(postTitle)}":</p>
      <div style="background: #FFF8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; color: #2C1810; white-space: pre-wrap;">${escapeHtml(replyText)}</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${postUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">View Reply</a>
      </div>
      ${emailFooter(siteUrl, recipientUnsubscribeToken)}
    </div>
  `;

  await sendEmail(env, {
    to: recipientEmail,
    subject: `${replierName} replied to your comment on Sunday Sauce`,
    html,
  });
}
