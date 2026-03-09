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
    AUTH_SECRET: string;
    RESEND_API_KEY: string;
    ADMIN_EMAIL: string;
    SITE_URL: string;
    SITE_NAME: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
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
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: string;
  emailed: number;
  email_subscribers: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  scheduled_at: string | null;
};

const app = new Hono<Env>();

// Public homepage
app.get('/', async (c) => {
  const session = await getSession(c);
  if (session) {
    return c.redirect('/feed');
  }
  return c.html(homePage());
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
          "SELECT * FROM members WHERE status = 'active'"
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
              members.results as unknown as Member[]
            );

            await env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?')
              .bind(post.id)
              .run();
          }
        }
      }
    }
  },
};
