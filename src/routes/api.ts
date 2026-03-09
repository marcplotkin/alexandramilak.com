import { Hono } from 'hono';
import type { Env } from '../index';
import { createMagicLink } from '../lib/auth';
import { sendWelcomeEmail } from '../lib/email';
import { layout } from '../pages/layout';

export const apiRoutes = new Hono<Env>();

function resultPage(title: string, message: string, success: boolean): string {
  const icon = success ? '&#10003;' : '&#10007;';
  const iconColor = success ? '#2d6a2d' : '#C0392B';

  const content = `
    <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: var(--burgundy);">Sunday Sauce</span>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px; color: ${iconColor};">${icon}</div>
        <h2 style="font-size: 22px; margin-bottom: 12px; color: var(--text-dark);">${title}</h2>
        <p style="color: var(--text-muted); font-size: 15px; line-height: 1.6;">${message}</p>
      </div>
    </div>
  `;
  return layout(title, content);
}

// Approve member via email link
apiRoutes.get('/approve/:token', async (c) => {
  const token = c.req.param('token');

  const approvalToken = await c.env.DB.prepare(
    "SELECT * FROM approval_tokens WHERE token = ? AND action = 'approve' AND used = 0"
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

  // Get member info
  const member = await c.env.DB.prepare('SELECT * FROM members WHERE id = ?')
    .bind(memberId)
    .first();

  if (member) {
    // Create magic link and send welcome email
    const magicToken = await createMagicLink(c.env.DB, member.email as string);
    await sendWelcomeEmail(
      c.env,
      { email: member.email as string, name: member.name as string },
      magicToken
    );
  }

  return c.html(resultPage(
    'Member Approved',
    `${member ? member.name : 'The member'} has been approved and a welcome email has been sent.`,
    true
  ));
});

// Deny member via email link
apiRoutes.get('/deny/:token', async (c) => {
  const token = c.req.param('token');

  const approvalToken = await c.env.DB.prepare(
    "SELECT * FROM approval_tokens WHERE token = ? AND action = 'deny' AND used = 0"
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
