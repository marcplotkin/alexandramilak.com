import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { blogRoutes } from './routes/blog';
import { adminRoutes } from './routes/admin';
import { apiRoutes } from './routes/api';
import { homePage } from './pages/home';
import { getSession } from './lib/auth';
import { sendNewPostEmail } from './lib/email';

export type Env = {
  Bindings: {
    DB: D1Database;
    MEDIA_BUCKET: R2Bucket;
    AUTH_SECRET: string;
    RESEND_API_KEY: string;
    ADMIN_EMAIL: string;
    SITE_URL: string;
    SITE_NAME: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GMAIL_REFRESH_TOKEN: string;
  };
};

export type Member = {
  id: number;
  email: string;
  name: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  removed_at: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: number | null;
  email_notifications: number;
  unsubscribe_token: string | null;
};

export type Comment = {
  id: number;
  post_id: number;
  member_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  member_name?: string;
  member_avatar_url?: string | null;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_caption: string | null;
  status: string;
  emailed: number;
  email_subscribers: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  scheduled_at: string | null;
};

const app = new Hono<Env>();

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err.message, err.stack);
  return c.text('An unexpected error occurred. Please try again later.', 500);
});

// Security headers and block search engine crawling
app.use('*', async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'");
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Vary', 'Cookie');
});

// Public homepage
app.get('/', async (c) => {
  const session = await getSession(c);
  if (session) {
    return c.redirect('/feed');
  }
  // If referral code in URL, redirect to request page with it
  const ref = c.req.query('ref');
  if (ref) {
    return c.redirect(`/auth/request?ref=${encodeURIComponent(ref)}`);
  }
  const response = c.html(homePage());
  response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  return response;
});

// Serve media from R2
app.get('/media/*', async (c) => {
  const key = c.req.path.replace(/^\//, '');
  const object = await c.env.MEDIA_BUCKET.get(key);

  if (!object) {
    return c.text('Not found', 404);
  }

  const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  // Force download for non-image types and SVGs to prevent XSS
  if (!contentType.startsWith('image/') || contentType === 'image/svg+xml') {
    headers.set('Content-Disposition', 'attachment');
  }

  return new Response(object.body, { headers });
});

// Mount routes
app.route('/auth', authRoutes);
app.route('/feed', blogRoutes);
app.route('/admin', adminRoutes);
app.route('/api', apiRoutes);

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env['Bindings'], ctx: ExecutionContext) {
    // Publish any posts whose scheduled_at has passed
    const due = await env.DB.prepare(
      "SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_at <= datetime('now')"
    ).all();

    if (!due.results || due.results.length === 0) return;

    for (const row of due.results) {
      const post = row as unknown as Post;

      await env.DB.prepare(
        "UPDATE posts SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
      )
        .bind(post.id)
        .run();

      // Email subscribers if requested
      if (post.email_subscribers && !post.emailed) {
        const members = await env.DB.prepare(
          "SELECT * FROM members WHERE status = 'active' AND email_notifications = 1"
        ).all();

        if (members.results && members.results.length > 0) {
          // Re-fetch post with updated status for email
          const updated = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
            .bind(post.id)
            .first();

          if (updated) {
            await sendNewPostEmail(
              env,
              updated as unknown as Post,
              members.results as unknown as Member[],
              env.SITE_URL
            );

            await env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?')
              .bind(post.id)
              .run();
          }
        }
      }
    }

    // Clean up expired sessions
    await env.DB.prepare(
      "DELETE FROM sessions WHERE expires_at < datetime('now')"
    ).run();

    // Clean up used/expired magic links older than 1 day
    await env.DB.prepare(
      "DELETE FROM magic_links WHERE (used = 1 OR expires_at < datetime('now')) AND created_at < datetime('now', '-1 day')"
    ).run();

    // Clean up used approval tokens older than 7 days
    await env.DB.prepare(
      "DELETE FROM approval_tokens WHERE used = 1 AND created_at < datetime('now', '-7 days')"
    ).run();
  },
};
