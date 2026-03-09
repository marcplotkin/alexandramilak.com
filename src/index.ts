import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { blogRoutes } from './routes/blog';
import { adminRoutes } from './routes/admin';
import { apiRoutes } from './routes/api';
import { homePage } from './pages/home';
import { getSession } from './lib/auth';

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
    APPLE_CLIENT_ID: string;
    APPLE_CLIENT_SECRET: string;
    APPLE_TEAM_ID: string;
    APPLE_KEY_ID: string;
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
  published: number;
  emailed: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
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

export default app;
