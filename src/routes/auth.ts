import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { Env } from '../index';
import {
  createMagicLink,
  validateMagicLink,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  generateToken,
  findOrCreateMember,
} from '../lib/auth';
import { sendMagicLinkEmail, sendApprovalEmail } from '../lib/email';
import { loginPage, checkEmailPage, pendingApprovalPage } from '../pages/login';
import { requestMembershipPage, requestSentPage } from '../pages/request-membership';
import {
  getGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
} from '../lib/oauth';

export const authRoutes = new Hono<Env>();

// Login page
authRoutes.get('/login', async (c) => {
  const session = await getSession(c);
  if (session) return c.redirect('/feed');
  return c.html(loginPage());
});

// Handle login form
authRoutes.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const email = (body['email'] as string || '').trim().toLowerCase();

  if (!email) {
    return c.html(loginPage('Please enter your email address.'));
  }

  // Check if member exists and is active
  let member = await c.env.DB.prepare(
    "SELECT * FROM members WHERE email = ?"
  )
    .bind(email)
    .first();

  // Auto-create or auto-approve admin email
  if (email === c.env.ADMIN_EMAIL?.toLowerCase()) {
    if (!member) {
      await c.env.DB.prepare(
        "INSERT INTO members (email, name, status, approved_at) VALUES (?, 'Alexandra Milak', 'active', datetime('now'))"
      ).bind(email).run();
      member = await c.env.DB.prepare("SELECT * FROM members WHERE email = ?").bind(email).first();
    } else if (member.status !== 'active') {
      await c.env.DB.prepare(
        "UPDATE members SET status = 'active', approved_at = datetime('now'), removed_at = NULL WHERE email = ?"
      ).bind(email).run();
      member = await c.env.DB.prepare("SELECT * FROM members WHERE email = ?").bind(email).first();
    }
  } else if (!member || member.status !== 'active') {
    return c.html(
      loginPage('No active membership found for this email. You may need to request membership first.')
    );
  }

  // Create magic link and send email
  const token = await createMagicLink(c.env.DB, email);
  const baseUrl = new URL(c.req.url).origin;
  await sendMagicLinkEmail(c.env, email, token, baseUrl);

  return c.html(checkEmailPage());
});

// Verify magic link
authRoutes.get('/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.html(loginPage('Invalid or missing token.'));
  }

  const email = await validateMagicLink(c.env.DB, token);
  if (!email) {
    return c.html(loginPage('This link has expired or already been used. Please request a new one.'));
  }

  // Find member
  const member = await c.env.DB.prepare(
    "SELECT * FROM members WHERE email = ? AND status = 'active'"
  )
    .bind(email)
    .first();

  if (!member) {
    return c.html(loginPage('No active membership found for this email.'));
  }

  // Create session
  const sessionId = await createSession(c.env.DB, member.id as number, c.env.AUTH_SECRET);
  setSessionCookie(c, sessionId);

  return c.redirect('/feed');
});

// Logout
authRoutes.get('/logout', async (c) => {
  clearSessionCookie(c);
  return c.redirect('/');
});

// Request membership page
authRoutes.get('/request', async (c) => {
  const ref = c.req.query('ref') || '';
  return c.html(requestMembershipPage(undefined, ref));
});

// Handle membership request
authRoutes.post('/request', async (c) => {
  const body = await c.req.parseBody();
  const name = (body['name'] as string || '').trim();
  const email = (body['email'] as string || '').trim().toLowerCase();
  const referredByName = (body['referred_by'] as string || '').trim();
  const refCode = (body['ref_code'] as string || '').trim();

  if (!name || !email) {
    return c.html(requestMembershipPage('Please fill in all fields.'));
  }

  // Look up referrer by code or by name
  let referrerId: number | null = null;
  let referrerName: string | undefined;

  if (refCode) {
    const referrer = await c.env.DB.prepare(
      "SELECT id, name FROM members WHERE referral_code = ? AND status = 'active'"
    ).bind(refCode).first();
    if (referrer) {
      referrerId = referrer.id as number;
      referrerName = referrer.name as string;
    }
  }

  if (!referrerId && referredByName) {
    const referrer = await c.env.DB.prepare(
      "SELECT id, name FROM members WHERE LOWER(name) LIKE ? AND status = 'active' LIMIT 1"
    ).bind('%' + referredByName.toLowerCase() + '%').first();
    if (referrer) {
      referrerId = referrer.id as number;
      referrerName = referrer.name as string;
    } else {
      // Still pass the name even if we can't match it
      referrerName = referredByName;
    }
  }

  // Check if already exists
  const existing = await c.env.DB.prepare('SELECT * FROM members WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    if (existing.status === 'active') {
      return c.html(requestMembershipPage('This email already has an active membership. Try logging in.'));
    }
    if (existing.status === 'pending') {
      return c.html(requestMembershipPage('A request for this email is already pending.'));
    }
    // If removed, allow re-request by updating status
    await c.env.DB.prepare(
      "UPDATE members SET status = 'pending', name = ?, referred_by = ?, removed_at = NULL WHERE email = ?"
    )
      .bind(name, referrerId, email)
      .run();

    const member = await c.env.DB.prepare('SELECT * FROM members WHERE email = ?')
      .bind(email)
      .first();

    const baseUrl = new URL(c.req.url).origin;
    await sendApprovalEmail(c.env, {
      id: member!.id as number,
      name,
      email,
      referrerName,
    }, baseUrl);

    return c.html(requestSentPage());
  }

  // Generate unsubscribe token and referral code for new member
  const unsubscribeToken = generateToken();
  const referralCode = generateToken().substring(0, 8);

  // Create new pending member
  const result = await c.env.DB.prepare(
    'INSERT INTO members (email, name, status, referred_by, unsubscribe_token, referral_code) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(email, name, 'pending', referrerId, unsubscribeToken, referralCode)
    .run();

  const memberId = result.meta.last_row_id;

  // Send approval email to admin
  const baseUrl = new URL(c.req.url).origin;
  await sendApprovalEmail(c.env, { id: memberId as number, name, email, referrerName }, baseUrl);

  return c.html(requestSentPage());
});

// ─── Google OAuth ───

authRoutes.get('/google', async (c) => {
  const state = generateToken();
  const baseUrl = new URL(c.req.url).origin;
  const redirectUri = `${baseUrl}/auth/google/callback`;

  // Store state in cookie for CSRF validation
  setCookie(c, 'oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 600, // 10 minutes
  });

  const authUrl = getGoogleAuthUrl(c.env.GOOGLE_CLIENT_ID, redirectUri, state);
  return c.redirect(authUrl);
});

authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const storedState = getCookie(c, 'oauth_state');
  const error = c.req.query('error');

  if (error) {
    return c.html(loginPage('Google sign-in was cancelled or failed. Please try again.'));
  }

  if (!code || !state || !storedState || state !== storedState) {
    return c.html(loginPage('Invalid OAuth state. Please try again.'));
  }

  try {
    const baseUrl = new URL(c.req.url).origin;
    const redirectUri = `${baseUrl}/auth/google/callback`;
    const tokens = await exchangeGoogleCode(
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      code,
      redirectUri
    );

    const userInfo = await getGoogleUserInfo(tokens.access_token);

    if (!userInfo.email) {
      return c.html(loginPage('Could not retrieve email from Google. Please try again.'));
    }

    const result = await findOrCreateMember(
      c.env.DB,
      userInfo.email.toLowerCase(),
      userInfo.name || userInfo.email.split('@')[0],
      'google',
      userInfo.id,
      c.env.ADMIN_EMAIL,
      userInfo.picture || null
    );

    if (result.status === 'active' && result.member) {
      const sessionId = await createSession(c.env.DB, result.member.id, c.env.AUTH_SECRET);
      setSessionCookie(c, sessionId);
      return c.redirect('/feed');
    }

    if (result.status === 'pending') {
      return c.html(pendingApprovalPage());
    }

    // created_pending — send approval email to admin
    const newMember = await c.env.DB.prepare('SELECT * FROM members WHERE email = ?')
      .bind(userInfo.email.toLowerCase())
      .first();

    if (newMember) {
      await sendApprovalEmail(c.env, {
        id: newMember.id as number,
        name: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email.toLowerCase(),
      }, baseUrl);
    }

    return c.html(pendingApprovalPage());
  } catch (err) {
    console.error('Google OAuth error:', err);
    return c.html(loginPage('Something went wrong with Google sign-in. Please try again.'));
  }
});

