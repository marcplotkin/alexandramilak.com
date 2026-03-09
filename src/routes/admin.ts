import { Hono } from 'hono';
import type { Env, Post, Member } from '../index';
import { getSession, isAdmin, createMagicLink } from '../lib/auth';
import { sendWelcomeEmail, sendNewPostEmail } from '../lib/email';
import {
  adminDashboard,
  adminMembersPage,
  adminRequestsPage,
  adminPostsPage,
  adminActionResultPage,
} from '../pages/admin';
import { editorPage } from '../pages/editor';

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
    "SELECT COUNT(*) as count FROM posts WHERE status = 'published'"
  ).first();
  const draftPosts = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE status = 'draft'"
  ).first();
  const scheduledPosts = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE status = 'scheduled'"
  ).first();

  return c.html(
    adminDashboard({
      totalMembers: (totalMembers?.count as number) || 0,
      pendingRequests: (pendingRequests?.count as number) || 0,
      publishedPosts: (publishedPosts?.count as number) || 0,
      draftPosts: (draftPosts?.count as number) || 0,
      scheduledPosts: (scheduledPosts?.count as number) || 0,
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

  const existing = await c.env.DB.prepare('SELECT * FROM members WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    if (existing.status === 'active') {
      return c.redirect('/admin/members');
    }
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

// All posts (with optional filter)
adminRoutes.get('/posts', async (c) => {
  const posts = await c.env.DB.prepare(
    'SELECT * FROM posts ORDER BY updated_at DESC'
  ).all();

  const filter = c.req.query('filter') || undefined;

  return c.html(adminPostsPage((posts.results || []) as unknown as Post[], filter));
});

// New post — editor
adminRoutes.get('/posts/new', async (c) => {
  return c.html(editorPage(null, true));
});

// Edit post — editor
adminRoutes.get('/posts/:id/edit', async (c) => {
  const id = c.req.param('id');
  const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(id)
    .first();

  if (!post) {
    return c.text('Post not found', 404);
  }

  return c.html(editorPage(post as unknown as Post, false));
});

// Create post (JSON from editor)
adminRoutes.post('/posts', async (c) => {
  const contentType = c.req.header('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await c.req.json();
    const title = (body.title || '').trim();
    const content = (body.content || '').trim();
    const excerpt = (body.excerpt || '').trim() || null;
    const coverImageUrl = (body.cover_image_url || '').trim() || null;
    const emailSubscribers = body.email_subscribers ? 1 : 0;
    const status = body.status || 'draft';
    const scheduledAt = body.scheduled_at || null;

    if (!title) {
      return c.json({ success: false, error: 'Title is required' });
    }

    let slug = (body.slug || '').trim();
    if (!slug) {
      slug = generateSlug(title);
    }
    slug = await ensureUniqueSlug(c.env.DB, slug, null);

    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = await c.env.DB.prepare(
      'INSERT INTO posts (title, slug, content, excerpt, cover_image_url, status, email_subscribers, published_at, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(title, slug, content, excerpt, coverImageUrl, status, emailSubscribers, publishedAt, scheduledAt)
      .run();

    return c.json({ success: true, id: result.meta.last_row_id, slug });
  }

  // Fallback: form submission (legacy)
  const body = await c.req.parseBody();
  const title = (body['title'] as string || '').trim();
  const content = (body['content'] as string || '').trim();
  const excerpt = (body['excerpt'] as string || '').trim() || null;

  if (!title) {
    return c.redirect('/admin/posts/new');
  }

  const slug = await ensureUniqueSlug(c.env.DB, generateSlug(title), null);

  await c.env.DB.prepare(
    "INSERT INTO posts (title, slug, content, excerpt, status) VALUES (?, ?, ?, ?, 'draft')"
  )
    .bind(title, slug, content || '', excerpt)
    .run();

  return c.redirect('/admin/posts');
});

// Autosave post (JSON)
adminRoutes.post('/posts/:id/autosave', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const title = (body.title || '').trim();
  const content = (body.content || '').trim();
  const excerpt = (body.excerpt || '').trim() || null;
  const coverImageUrl = (body.cover_image_url || '').trim() || null;
  const emailSubscribers = body.email_subscribers ? 1 : 0;
  const scheduledAt = body.scheduled_at || null;

  let slug = (body.slug || '').trim();
  if (!slug) {
    slug = generateSlug(title);
  }
  slug = await ensureUniqueSlug(c.env.DB, slug, id);

  await c.env.DB.prepare(
    "UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image_url = ?, email_subscribers = ?, scheduled_at = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(title, slug, content, excerpt, coverImageUrl, emailSubscribers, scheduledAt, id)
    .run();

  return c.json({ success: true, savedAt: new Date().toISOString() });
});

// Update post (JSON)
adminRoutes.post('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const contentType = c.req.header('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await c.req.json();
    const title = (body.title || '').trim();
    const content = (body.content || '').trim();
    const excerpt = (body.excerpt || '').trim() || null;
    const coverImageUrl = (body.cover_image_url || '').trim() || null;
    const emailSubscribers = body.email_subscribers ? 1 : 0;
    const status = body.status || 'draft';
    const scheduledAt = body.scheduled_at || null;

    let slug = (body.slug || '').trim();
    if (!slug) slug = generateSlug(title);
    slug = await ensureUniqueSlug(c.env.DB, slug, id);

    const existing = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    const publishedAt = status === 'published' && existing && existing.status !== 'published'
      ? new Date().toISOString()
      : existing?.published_at || null;

    await c.env.DB.prepare(
      "UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image_url = ?, status = ?, email_subscribers = ?, published_at = ?, scheduled_at = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(title, slug, content, excerpt, coverImageUrl, status, emailSubscribers, publishedAt, scheduledAt, id)
      .run();

    return c.json({ success: true });
  }

  // Legacy form fallback
  const body = await c.req.parseBody();
  const title = (body['title'] as string || '').trim();
  const content = (body['content'] as string || '').trim();
  const excerpt = (body['excerpt'] as string || '').trim() || null;

  if (!title) {
    return c.redirect(`/admin/posts/${id}/edit`);
  }

  await c.env.DB.prepare(
    "UPDATE posts SET title = ?, content = ?, excerpt = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(title, content, excerpt, id)
    .run();

  return c.redirect('/admin/posts');
});

// Publish post
adminRoutes.post('/posts/:id/publish', async (c) => {
  const id = parseInt(c.req.param('id'));

  await c.env.DB.prepare(
    "UPDATE posts SET status = 'published', published_at = datetime('now'), scheduled_at = NULL, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(id)
    .run();

  // Check if email_subscribers is on
  const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
  if (post && post.email_subscribers && !post.emailed) {
    const members = await c.env.DB.prepare(
      "SELECT * FROM members WHERE status = 'active'"
    ).all();

    if (members.results && members.results.length > 0) {
      await sendNewPostEmail(
        c.env,
        post as unknown as Post,
        members.results as unknown as Member[]
      );
      await c.env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?').bind(id).run();
    }
  }

  return c.json({ success: true });
});

// Unpublish post
adminRoutes.post('/posts/:id/unpublish', async (c) => {
  const id = parseInt(c.req.param('id'));

  await c.env.DB.prepare(
    "UPDATE posts SET status = 'draft', scheduled_at = NULL, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(id)
    .run();

  return c.json({ success: true });
});

// Schedule post
adminRoutes.post('/posts/:id/schedule', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const scheduledAt = body.scheduled_at;

  if (!scheduledAt) {
    return c.json({ success: false, error: 'scheduled_at is required' });
  }

  await c.env.DB.prepare(
    "UPDATE posts SET status = 'scheduled', scheduled_at = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(scheduledAt, id)
    .run();

  return c.json({ success: true });
});

// Delete post
adminRoutes.post('/posts/:id/delete', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();

  // If JSON request (from editor), return JSON
  const accept = c.req.header('accept') || '';
  const contentType = c.req.header('content-type') || '';
  if (accept.includes('application/json') || contentType.includes('application/json')) {
    return c.json({ success: true });
  }

  return c.redirect('/admin/posts');
});

// ---- Helpers ----

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

async function ensureUniqueSlug(db: D1Database, slug: string, excludeId: number | null): Promise<string> {
  let candidate = slug;
  let suffix = 2;

  while (true) {
    let query = 'SELECT id FROM posts WHERE slug = ?';
    const params: (string | number)[] = [candidate];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const existing = await db.prepare(query).bind(...params).first();
    if (!existing) return candidate;

    candidate = slug + '-' + suffix;
    suffix++;
    if (suffix > 100) break; // safety
  }

  return candidate;
}
