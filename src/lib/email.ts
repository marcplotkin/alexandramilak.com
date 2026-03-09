import type { Env, Member, Post } from '../index';
import { generateToken } from './auth';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sunday Sauce <sundaysauce@nyu.marcplotkin.com>',
        reply_to: 'alex.milak@gmail.com',
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendApprovalEmail(
  env: Env['Bindings'],
  member: { id: number; name: string; email: string },
  baseUrl?: string
): Promise<void> {
  const approveToken = generateToken();
  const denyToken = generateToken();

  await env.DB.prepare(
    'INSERT INTO approval_tokens (token, member_id, action) VALUES (?, ?, ?)'
  )
    .bind(approveToken, member.id, 'approve')
    .run();

  await env.DB.prepare(
    'INSERT INTO approval_tokens (token, member_id, action) VALUES (?, ?, ?)'
  )
    .bind(denyToken, member.id, 'deny')
    .run();

  const siteUrl = baseUrl || env.SITE_URL;
  const approveUrl = `${siteUrl}/api/approve/${approveToken}`;
  const denyUrl = `${siteUrl}/api/deny/${denyToken}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 8px;">New Membership Request</h1>
      <p style="color: #7A6B63; font-size: 14px; margin-bottom: 32px;">Sunday Sauce</p>
      <div style="background: #FFF8F0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <p style="margin: 0 0 8px; color: #2C1810;"><strong>Name:</strong> ${escapeHtml(member.name)}</p>
        <p style="margin: 0; color: #2C1810;"><strong>Email:</strong> ${escapeHtml(member.email)}</p>
      </div>
      <div style="text-align: center;">
        <a href="${approveUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; margin-right: 12px;">Approve</a>
        <a href="${denyUrl}" style="display: inline-block; background: #e8e0d8; color: #2C1810; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Deny</a>
      </div>
    </div>
  `;

  await sendEmail(env.RESEND_API_KEY, {
    to: env.ADMIN_EMAIL,
    subject: `New membership request from ${member.name}`,
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

  await sendEmail(env.RESEND_API_KEY, {
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

  await sendEmail(env.RESEND_API_KEY, {
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
  const postUrl = `${baseUrl || env.SITE_URL}/feed/${post.slug}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="color: #7A6B63; font-size: 14px; margin-bottom: 8px;">Sunday Sauce</p>
      <h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 16px;">${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p style="color: #2C1810; line-height: 1.6; margin-bottom: 24px;">${escapeHtml(post.excerpt)}</p>` : ''}
      <div style="text-align: center; margin: 32px 0;">
        <a href="${postUrl}" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Read Post</a>
      </div>
      <p style="color: #7A6B63; font-size: 13px; border-top: 1px solid #e8e0d8; padding-top: 20px;">You're receiving this because you're a member of Sunday Sauce by Alexandra Milak.</p>
    </div>
  `;

  for (const member of members) {
    await sendEmail(env.RESEND_API_KEY, {
      to: member.email,
      subject: `New post: ${post.title}`,
      html,
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
