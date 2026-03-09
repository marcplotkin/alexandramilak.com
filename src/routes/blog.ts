import { Hono } from 'hono';
import type { Env, Post, Member } from '../index';
import { getSession, isAdmin } from '../lib/auth';
import { feedPage } from '../pages/feed';
import { postPage } from '../pages/post';

export const blogRoutes = new Hono<Env>();

// Auth middleware for all blog routes
blogRoutes.use('*', async (c, next) => {
  const member = await getSession(c);
  if (!member) {
    return c.redirect('/auth/login');
  }
  c.set('member' as never, member as never);
  await next();
});

// Feed page
blogRoutes.get('/', async (c) => {
  const member = (c as any).get('member') as Member;

  const posts = await c.env.DB.prepare(
    "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC, created_at DESC"
  ).all();

  return c.html(
    feedPage(
      (posts.results || []) as unknown as Post[],
      member,
      isAdmin(member.email, c.env.ADMIN_EMAIL)
    )
  );
});

// Single post page
blogRoutes.get('/:slug', async (c) => {
  const member = (c as any).get('member') as Member;
  const slug = c.req.param('slug');

  const post = await c.env.DB.prepare(
    "SELECT * FROM posts WHERE slug = ? AND status = 'published'"
  )
    .bind(slug)
    .first();

  if (!post) {
    return c.text('Post not found', 404);
  }

  return c.html(
    postPage(
      post as unknown as Post,
      member,
      isAdmin(member.email, c.env.ADMIN_EMAIL)
    )
  );
});
