import { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env, Member } from '../index';

export function generateToken(): string {
  return crypto.randomUUID();
}

export async function hashToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(token));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSession(
  db: D1Database,
  memberId: number,
  secret: string
): Promise<string> {
  const sessionId = generateToken();
  const hashedId = await hashToken(sessionId, secret);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare('INSERT INTO sessions (id, member_id, expires_at) VALUES (?, ?, ?)')
    .bind(hashedId, memberId, expiresAt)
    .run();

  return sessionId;
}

export async function getSession(
  c: Context<Env>
): Promise<Member | null> {
  const sessionId = getCookie(c, 'session');
  if (!sessionId) return null;

  const hashedId = await hashToken(sessionId, c.env.AUTH_SECRET);

  const session = await c.env.DB.prepare(
    'SELECT s.*, m.id as member_id, m.email, m.name, m.status, m.created_at as member_created_at, m.approved_at, m.removed_at, m.avatar_url, m.referral_code, m.referred_by, m.email_notifications, m.unsubscribe_token FROM sessions s JOIN members m ON s.member_id = m.id WHERE s.id = ? AND s.expires_at > datetime(\'now\') AND m.status = \'active\''
  )
    .bind(hashedId)
    .first();

  if (!session) return null;

  // Refresh session expiry if more than 1 day old (avoids updating on every request)
  const expiresAt = new Date(session.expires_at as string);
  const refreshThreshold = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000); // Refresh when < 25 days left
  if (expiresAt < refreshThreshold) {
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await c.env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE id = ?')
      .bind(newExpiry, hashedId)
      .run();
  }

  return {
    id: session.member_id as number,
    email: session.email as string,
    name: session.name as string,
    status: session.status as string,
    created_at: session.member_created_at as string,
    approved_at: session.approved_at as string | null,
    removed_at: session.removed_at as string | null,
    avatar_url: session.avatar_url as string | null,
    referral_code: session.referral_code as string | null,
    referred_by: session.referred_by as number | null,
    email_notifications: (session.email_notifications as number) ?? 1,
    unsubscribe_token: session.unsubscribe_token as string | null,
  };
}

export async function createMagicLink(
  db: D1Database,
  email: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await db
    .prepare('INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)')
    .bind(token, email, expiresAt)
    .run();

  return token;
}

export async function validateMagicLink(
  db: D1Database,
  token: string
): Promise<string | null> {
  const link = await db
    .prepare(
      'SELECT * FROM magic_links WHERE token = ? AND used = 0 AND expires_at > datetime(\'now\')'
    )
    .bind(token)
    .first();

  if (!link) return null;

  await db
    .prepare('UPDATE magic_links SET used = 1 WHERE token = ?')
    .bind(token)
    .run();

  return link.email as string;
}

function mapMember(row: Record<string, unknown>, fallbackAvatar?: string | null): Member {
  return {
    id: row.id as number,
    email: row.email as string,
    name: row.name as string,
    status: row.status as string,
    created_at: row.created_at as string,
    approved_at: row.approved_at as string | null,
    removed_at: row.removed_at as string | null,
    avatar_url: (row.avatar_url as string | null) || fallbackAvatar || null,
    referral_code: row.referral_code as string | null,
    referred_by: row.referred_by as number | null,
    email_notifications: (row.email_notifications as number) ?? 1,
    unsubscribe_token: row.unsubscribe_token as string | null,
  };
}

export function isAdmin(email: string, adminEmail: string): boolean {
  return email.toLowerCase() === adminEmail.toLowerCase();
}

/**
 * Find or create a member for social login.
 * - If active member exists, returns { member, status: 'active' }
 * - If pending member exists, returns { member: null, status: 'pending' }
 * - If no member exists, creates as pending and returns { member: null, status: 'created_pending' }
 * - Admin email is always auto-approved
 */
export async function findOrCreateMember(
  db: D1Database,
  email: string,
  name: string,
  provider: string,
  providerId: string,
  adminEmail: string,
  avatarUrl?: string | null
): Promise<{ member: Member | null; status: 'active' | 'pending' | 'created_pending' }> {
  const existing = await db
    .prepare('SELECT * FROM members WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    // Update provider info and avatar if not set
    if (!existing.provider_id || (avatarUrl && !existing.avatar_url)) {
      await db
        .prepare('UPDATE members SET auth_provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?')
        .bind(provider, providerId, avatarUrl || null, existing.id)
        .run();
    }

    if (existing.status === 'active') {
      return {
        member: mapMember(existing, avatarUrl),
        status: 'active',
      };
    }

    if (existing.status === 'pending') {
      if (isAdmin(email, adminEmail)) {
        await db
          .prepare(
            "UPDATE members SET status = 'active', approved_at = datetime('now'), auth_provider = ?, provider_id = ? WHERE email = ?"
          )
          .bind(provider, providerId, email)
          .run();
        const updated = await db.prepare('SELECT * FROM members WHERE email = ?').bind(email).first();
        return {
          member: mapMember(updated!, avatarUrl),
          status: 'active',
        };
      }
      return { member: null, status: 'pending' };
    }

    // If removed, re-request
    if (isAdmin(email, adminEmail)) {
      await db
        .prepare(
          "UPDATE members SET status = 'active', name = ?, removed_at = NULL, approved_at = datetime('now'), auth_provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE email = ?"
        )
        .bind(name, provider, providerId, avatarUrl || null, email)
        .run();
      const updated = await db.prepare('SELECT * FROM members WHERE email = ?').bind(email).first();
      return {
        member: mapMember(updated!, avatarUrl),
        status: 'active',
      };
    }

    await db
      .prepare(
        "UPDATE members SET status = 'pending', name = ?, removed_at = NULL, auth_provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE email = ?"
      )
      .bind(name, provider, providerId, avatarUrl || null, email)
      .run();
    return { member: null, status: 'created_pending' };
  }

  // No existing member — auto-approve admin, otherwise pending
  if (isAdmin(email, adminEmail)) {
    const result = await db
      .prepare(
        "INSERT INTO members (email, name, status, auth_provider, provider_id, approved_at, avatar_url) VALUES (?, ?, 'active', ?, ?, datetime('now'), ?)"
      )
      .bind(email, name, provider, providerId, avatarUrl || null)
      .run();
    return {
      member: {
        id: result.meta.last_row_id as number,
        email,
        name,
        status: 'active',
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        removed_at: null,
        avatar_url: avatarUrl || null,
        referral_code: null,
        referred_by: null,
        email_notifications: 1,
        unsubscribe_token: null,
      },
      status: 'active',
    };
  }

  await db
    .prepare(
      "INSERT INTO members (email, name, status, auth_provider, provider_id, avatar_url) VALUES (?, ?, 'pending', ?, ?, ?)"
    )
    .bind(email, name, provider, providerId, avatarUrl || null)
    .run();
  return { member: null, status: 'created_pending' };
}

export function setSessionCookie(c: Context<Env>, sessionId: string): void {
  setCookie(c, 'session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearSessionCookie(c: Context<Env>): void {
  deleteCookie(c, 'session', { path: '/' });
}
