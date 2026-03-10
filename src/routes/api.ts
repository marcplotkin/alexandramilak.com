import { Hono } from 'hono';
import { escapeHtml } from '../lib/utils';
import type { Env } from '../index';
import { createMagicLink } from '../lib/auth';
import { sendWelcomeEmail } from '../lib/email';
import { layout } from '../pages/layout';

export const apiRoutes = new Hono<Env>();

function resultPage(title: string, message: string, success: boolean): string {
  const icon = success ? '&#10003;' : '&#10007;';
  const iconColor = success ? '#6aba6a' : '#e6a09a';
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  const content = `
    <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 500; color: var(--cream);">Sunday Sauce</span>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px; color: ${iconColor};">${icon}</div>
        <h2 style="font-size: 24px; margin-bottom: 12px;">${safeTitle}</h2>
        <p style="color: rgba(255,248,240,0.6); font-size: 15px; line-height: 1.6;">${safeMessage}</p>
      </div>
    </div>
  `;
  return layout(title, content);
}

// Approve member via email link
apiRoutes.get('/approve/:token', async (c) => {
  const token = c.req.param('token');
  const confirm = c.req.query('confirm');

  const approvalToken = await c.env.DB.prepare(
    "SELECT at.*, m.name, m.email FROM approval_tokens at JOIN members m ON at.member_id = m.id WHERE at.token = ? AND at.action = 'approve' AND at.used = 0"
  )
    .bind(token)
    .first();

  if (!approvalToken) {
    return c.html(resultPage(
      'Invalid Link',
      'This approval link has already been used or is invalid.',
      false
    ));
  }

  if (confirm !== 'yes') {
    const confirmContent = `
      <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
          <div style="margin-bottom: 24px;">
            <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 500; color: var(--cream);">Sunday Sauce</span>
          </div>
          <h2 style="font-size: 24px; margin-bottom: 12px;">Approve Member?</h2>
          <p style="color: rgba(255,248,240,0.6); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Approve <strong>${escapeHtml(approvalToken.name as string)}</strong> (${escapeHtml(approvalToken.email as string)})?
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <a href="/api/approve/${encodeURIComponent(token)}?confirm=yes" style="display: inline-block; background: #6aba6a; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Yes, Approve</a>
          </div>
        </div>
      </div>
    `;
    return c.html(layout('Approve Member', confirmContent));
  }

  // Mark token as used
  await c.env.DB.prepare('UPDATE approval_tokens SET used = 1 WHERE token = ?')
    .bind(token)
    .run();

  // Activate member
  const memberId = approvalToken.member_id as number;
  await c.env.DB.prepare(
    "UPDATE members SET status = 'active', approved_at = datetime('now') WHERE id = ?"
  )
    .bind(memberId)
    .run();

  // Ensure they have a referral code and unsubscribe token
  await ensureReferralCode(c.env.DB, memberId);
  const unsubToken = await c.env.DB.prepare('SELECT unsubscribe_token FROM members WHERE id = ?').bind(memberId).first();
  if (!unsubToken?.unsubscribe_token) {
    await c.env.DB.prepare('UPDATE members SET unsubscribe_token = ? WHERE id = ?')
      .bind(crypto.randomUUID(), memberId).run();
  }

  // Get member info
  const member = await c.env.DB.prepare('SELECT * FROM members WHERE id = ?')
    .bind(memberId)
    .first();

  if (member) {
    // Create magic link and send welcome email
    const magicToken = await createMagicLink(c.env.DB, member.email as string);
    const baseUrl = new URL(c.req.url).origin;
    await sendWelcomeEmail(
      c.env,
      { email: member.email as string, name: member.name as string },
      magicToken,
      baseUrl
    );
  }

  return c.html(resultPage(
    'Member Approved',
    `${member ? member.name : 'The member'} has been approved and a welcome email has been sent.`,
    true
  ));
});

// Generate referral code for member on approval if they don't have one
async function ensureReferralCode(db: D1Database, memberId: number): Promise<void> {
  const member = await db.prepare('SELECT referral_code FROM members WHERE id = ?').bind(memberId).first();
  if (!member?.referral_code) {
    const code = crypto.randomUUID().substring(0, 8);
    await db.prepare('UPDATE members SET referral_code = ? WHERE id = ?').bind(code, memberId).run();
  }
}

// Deny member via email link
apiRoutes.get('/deny/:token', async (c) => {
  const token = c.req.param('token');
  const confirm = c.req.query('confirm');

  const approvalToken = await c.env.DB.prepare(
    "SELECT at.*, m.name, m.email FROM approval_tokens at JOIN members m ON at.member_id = m.id WHERE at.token = ? AND at.action = 'deny' AND at.used = 0"
  )
    .bind(token)
    .first();

  if (!approvalToken) {
    return c.html(resultPage(
      'Invalid Link',
      'This denial link has already been used or is invalid.',
      false
    ));
  }

  if (confirm !== 'yes') {
    const confirmContent = `
      <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
          <div style="margin-bottom: 24px;">
            <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 500; color: var(--cream);">Sunday Sauce</span>
          </div>
          <h2 style="font-size: 24px; margin-bottom: 12px;">Deny Member?</h2>
          <p style="color: rgba(255,248,240,0.6); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Deny <strong>${escapeHtml(approvalToken.name as string)}</strong> (${escapeHtml(approvalToken.email as string)})?
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <a href="/api/deny/${encodeURIComponent(token)}?confirm=yes" style="display: inline-block; background: #C0392B; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Yes, Deny</a>
          </div>
        </div>
      </div>
    `;
    return c.html(layout('Deny Member', confirmContent));
  }

  // Mark token as used
  await c.env.DB.prepare('UPDATE approval_tokens SET used = 1 WHERE token = ?')
    .bind(token)
    .run();

  // Update member status
  const memberId = approvalToken.member_id as number;
  await c.env.DB.prepare(
    "UPDATE members SET status = 'removed' WHERE id = ?"
  )
    .bind(memberId)
    .run();

  return c.html(resultPage(
    'Request Denied',
    'The membership request has been denied.',
    true
  ));
});

// Unsubscribe from emails (token-based, no login required)
apiRoutes.get('/unsubscribe', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.html(resultPage('Invalid Link', 'This unsubscribe link is invalid.', false));
  }

  const member = await c.env.DB.prepare(
    "SELECT * FROM members WHERE unsubscribe_token = ? AND status = 'active'"
  ).bind(token).first();

  if (!member) {
    return c.html(resultPage('Invalid Link', 'This unsubscribe link is invalid or expired.', false));
  }

  await c.env.DB.prepare('UPDATE members SET email_notifications = 0 WHERE id = ?')
    .bind(member.id).run();

  return c.html(resultPage(
    'Unsubscribed',
    'You\'ve been unsubscribed from Sunday Sauce emails. You can still log in and read posts anytime.',
    true
  ));
});

// Leave Sunday Sauce entirely (token-based, no login required)
apiRoutes.get('/leave', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.html(resultPage('Invalid Link', 'This link is invalid.', false));
  }

  const member = await c.env.DB.prepare(
    "SELECT * FROM members WHERE unsubscribe_token = ? AND status = 'active'"
  ).bind(token).first();

  if (!member) {
    return c.html(resultPage('Invalid Link', 'This link is invalid or expired.', false));
  }

  // Show confirmation page
  const confirmParam = c.req.query('confirm');
  if (confirmParam !== 'yes') {
    const content = `
      <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
          <div style="margin-bottom: 24px;">
            <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 500; color: var(--cream);">Sunday Sauce</span>
          </div>
          <h2 style="font-size: 24px; margin-bottom: 12px;">Leave Sunday Sauce?</h2>
          <p style="color: rgba(255,248,240,0.6); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            This will remove your membership. You won't be able to access posts or comments anymore.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <a href="/api/leave?token=${encodeURIComponent(token)}&confirm=yes" style="display: inline-block; background: #C0392B; color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Yes, Leave</a>
            <a href="/" style="display: inline-block; background: rgba(255,248,240,0.1); color: #FFF8F0; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Cancel</a>
          </div>
        </div>
      </div>
    `;
    return c.html(layout('Leave Sunday Sauce', content));
  }

  // Actually remove the member
  await c.env.DB.prepare(
    "UPDATE members SET status = 'removed', removed_at = datetime('now') WHERE id = ?"
  ).bind(member.id).run();

  await c.env.DB.prepare('DELETE FROM sessions WHERE member_id = ?')
    .bind(member.id).run();

  return c.html(resultPage(
    'Membership Removed',
    'Your Sunday Sauce membership has been removed. We\'re sorry to see you go.',
    true
  ));
});
