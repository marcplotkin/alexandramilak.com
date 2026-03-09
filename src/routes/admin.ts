import { Hono } from 'hono';
import type { Env, Post, Member } from '../index';
import { getSession, isAdmin, createMagicLink } from '../lib/auth';
import { sendWelcomeEmail, sendNewPostEmail } from '../lib/email';
import {
  adminDashboard,
  adminMembersPage,
  adminRequestsPage,
  adminPostsPage,
  adminPostFormPage,
  adminActionResultPage,
} from '../pages/admin';

export const adminRoutes = new Hono<Env>();

// Auth + admin middleware
adminRoutes.use('*', async (c, next) => {
  const member = await getSession(c);
  if (!member) {
    return c.redirect('/auth/login');
  }
  if (!isAdmin(member.email, c.env.ADMIN_EMAIL)) {
    return c.text('Unauthorized', 403);
  }
  c.set('member' as never, member as never);
  await next();
});

// Dashboard
adminRoutes.get('/', async (c) => {
  const totalMembers = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM members WHERE status = 'active'"
  ).first();
  const pendingRequests = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM members WHERE status = 'pending'"
  ).first();
  const publishedPosts = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM posts WHERE published = 1'
  ).first();

  return c.html(
    adminDashboard({
      totalMembers: (totalMembers?.count as number) || 0,
      pendingRequests: (pendingRequests?.count as number) || 0,
      publishedPosts: (publishedPosts?.count as number) || 0,
    })
  );
});

// Members list
adminRoutes.get('/members', async (c) => {
  const members = await c.env.DB.prepare(
    "SELECT * FROM members WHERE status = 'active' ORDER BY name ASC"
  ).all();

  return c.html(adminMembersPage((members.results || []) as unknown as Member[]));
});

// Add member directly
adminRoutes.post('/members/add', async (c) => {
  const body = await c.req.parseBody();
  const name = (body['name'] as string || '').trim();
  const email = (body['email'] as string || '').trim().toLowerCase();

  if (!name || !email) {
    return c.redirect('/admin/members');
  }

  // Check if already exists
  const existing = await c.env.DB.prepare('SELECT * FROM members WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    if (existing.status === 'active') {
      return c.redirect('/admin/members');
    }
    // Reactivate
    await c.env.DB.prepare(
      "UPDATE members SET status = 'active', name = ?, approved_at = datetime('now'), removed_at = NULL WHERE email = ?"
    )
      .bind(name, email)
      .run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO members (email, name, status, approved_at) VALUES (?, ?, 'active', datetime('now'))"
    )
      .bind(email, name)
      .run();
  }

  // Send welcome email with magic link
  const token = await createMagicLink(c.env.DB, email);
  await sendWelcomeEmail(c.env, { email, name }, token);

  return c.redirect('/admin/members');
});

// Remove member
adminRoutes.post('/members/:id/remove', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare(
    "UPDATE members SET status = 'removed', removed_at = datetime('now') WHERE id = ?"
  )
    .bind(id)
    .run();

  // Clean up sessions for this member
  await c.env.DB.prepare('DELETE FROM sessions WHERE member_id = ?')
    .bind(id)
    .run();

  return c.redirect('/admin/members');
});

// Pending requests
adminRoutes.get('/requests', async (c) => {
  const requests = await c.env.DB.prepare(
    "SELECT * FROM members WHERE status = 'pending' ORDER BY created_at DESC"
  ).all();

  return c.html(adminRequestsPage((requests.results || []) as unknown as Member[]));
});

// Approve request
adminRoutes.post('/requests/:id/approve', async (c) => {
  const id = c.req.param('id');

  await c.env.DB.prepare(
    "UPDATE members SET status = 'active', approved_at = datetime('now') WHERE id = ? AND status = 'pending'"
  )
    .bind(id)
    .run();

  const member = await c.env.DB.prepare('SELECT * FROM members WHERE id = ?')
    .bind(id)
    .first();

  if (member) {
    const token = await createMagicLink(c.env.DB, member.email as string);
    await sendWelcomeEmail(
      c.env,
      { email: member.email as string, name: member.name as string },
      token
    );
  }

  return c.redirect('/admin/requests');
});

// Deny request
adminRoutes.post('/requests/:id/deny', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare(
    "UPDATE members SET status = 'removed' WHERE id = ? AND status = 'pending'"
  )
    .bind(id)
    .run();

  return c.redirect('/admin/requests');
});

// All posts
adminRoutes.get('/posts', async (c) => {
  const posts = await c.env.DB.prepare(
    'SELECT * FROM posts ORDER BY updated_at DESC'
  ).all();

  return c.html(adminPostsPage((posts.results || []) as unknown as Post[]));
});

// New post form
adminRoutes.get('/posts/new', async (c) => {
  return c.html(adminPostFormPage());
});

// Create post
adminRoutes.post('/posts', async (c) => {
  const body = await c.req.parseBody();
  const title = (body['title'] as string || '').trim();
  const content = (body['content'] as string || '').trim();
  const excerpt = (body['excerpt'] as string || '').trim() || null;
  const published = body['published'] === '1' ? 1 : 0;
  const emailMembers = body['email_members'] === '1';

  if (!title || !content) {
    return c.redirect('/admin/posts/new');
  }

  const slug = generateSlug(title);
  const publishedAt = published ? new Date().toISOString() : null;

  const result = await c.env.DB.prepare(
    'INSERT INTO posts (title, slug, content, excerpt, published, published_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(title, slug, content, excerpt, published, publishedAt)
    .run();

  // Email members if requested and post is published
  if (emailMembers && published) {
    const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    const members = await c.env.DB.prepare(
      "SELECT * FROM members WHERE status = 'active'"
    ).all();

    if (post && members.results && members.results.length > 0) {
      await sendNewPostEmail(
        c.env,
        post as unknown as Post,
        members.results as unknown as Member[]
      );

      await c.env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?')
        .bind(result.meta.last_row_id)
        .run();
    }
  }

  return c.redirect('/admin/posts');
});

// Edit post form
adminRoutes.get('/posts/:id/edit', async (c) => {
  const id = c.req.param('id');
  const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(id)
    .first();

  if (!post) {
    return c.text('Post not found', 404);
  }

  return c.html(adminPostFormPage(post as unknown as Post));
});

// Update post
adminRoutes.post('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody();
  const title = (body['title'] as string || '').trim();
  const content = (body['content'] as string || '').trim();
  const excerpt = (body['excerpt'] as string || '').trim() || null;
  const published = body['published'] === '1' ? 1 : 0;
  const emailMembers = body['email_members'] === '1';

  if (!title || !content) {
    return c.redirect(`/admin/posts/${id}/edit`);
  }

  // Get existing post to check if newly publishing
  const existing = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(id)
    .first();

  const publishedAt =
    published && existing && !existing.published
      ? new Date().toISOString()
      : existing?.published_at || null;

  await c.env.DB.prepare(
    "UPDATE posts SET title = ?, content = ?, excerpt = ?, published = ?, published_at = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(title, content, excerpt, published, publishedAt, id)
    .run();

  // Email members if requested and post is published
  if (emailMembers && published) {
    const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
      .bind(id)
      .first();

    const members = await c.env.DB.prepare(
      "SELECT * FROM members WHERE status = 'active'"
    ).all();

    if (post && members.results && members.results.length > 0) {
      await sendNewPostEmail(
        c.env,
        post as unknown as Post,
        members.results as unknown as Member[]
      );

      await c.env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?')
        .bind(id)
        .run();
    }
  }

  return c.redirect('/admin/posts');
});

// Delete post
adminRoutes.post('/posts/:id/delete', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  return c.redirect('/admin/posts');
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}
