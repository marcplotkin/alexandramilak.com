import { Hono } from 'hono';
import type { Env, Post, Member } from '../index';
import { getSession, isAdmin, createMagicLink } from '../lib/auth';
import { isValidEmail } from '../lib/utils';
import { sendWelcomeEmail, sendNewPostEmail } from '../lib/email';
import {
  adminDashboard,
  adminMembersPage,
  adminRequestsPage,
  adminPostsPage,
  adminAnalyticsPage,
} from '../pages/admin';
import { editorPage } from '../pages/editor';
import { appearancePage } from '../pages/appearance';
import { setSiteSetting, getAllSiteSettings } from '../lib/settings';

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
  const stats = await c.env.DB.prepare(`
    SELECT
      SUM(CASE WHEN type = 'member' AND status = 'active' THEN 1 ELSE 0 END) as totalMembers,
      SUM(CASE WHEN type = 'member' AND status = 'pending' THEN 1 ELSE 0 END) as pendingRequests,
      SUM(CASE WHEN type = 'post' AND status = 'published' THEN 1 ELSE 0 END) as publishedPosts,
      SUM(CASE WHEN type = 'post' AND status = 'draft' THEN 1 ELSE 0 END) as draftPosts,
      SUM(CASE WHEN type = 'post' AND status = 'scheduled' THEN 1 ELSE 0 END) as scheduledPosts
    FROM (
      SELECT 'member' as type, status FROM members
      UNION ALL
      SELECT 'post' as type, status FROM posts
    )
  `).first();

  return c.html(
    adminDashboard({
      totalMembers: (stats?.totalMembers as number) || 0,
      pendingRequests: (stats?.pendingRequests as number) || 0,
      publishedPosts: (stats?.publishedPosts as number) || 0,
      draftPosts: (stats?.draftPosts as number) || 0,
      scheduledPosts: (stats?.scheduledPosts as number) || 0,
    })
  );
});

// Members list
adminRoutes.get('/members', async (c) => {
  const members = await c.env.DB.prepare(
    "SELECT * FROM members WHERE status = 'active' ORDER BY name ASC"
  ).all();

  return c.html(adminMembersPage((members.results || []) as unknown as Member[], c.env.ADMIN_EMAIL));
});

// Add member directly
adminRoutes.post('/members/add', async (c) => {
  const body = await c.req.parseBody();
  const name = (body['name'] as string || '').trim();
  const email = (body['email'] as string || '').trim().toLowerCase();

  if (!name || !email) {
    return c.redirect('/admin/members');
  }

  if (!isValidEmail(email)) {
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
  const baseUrl = new URL(c.req.url).origin;
  await sendWelcomeEmail(c.env, { email, name }, token, baseUrl);

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

  // Look up referrer names
  const members = (requests.results || []) as unknown as Member[];
  const referrerIds = members.map(m => m.referred_by).filter(Boolean) as number[];
  const referrerNames: Record<number, string> = {};

  if (referrerIds.length > 0) {
    for (const id of referrerIds) {
      const ref = await c.env.DB.prepare('SELECT name FROM members WHERE id = ?').bind(id).first();
      if (ref) referrerNames[id] = ref.name as string;
    }
  }

  return c.html(adminRequestsPage(members, referrerNames));
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
    const baseUrl = new URL(c.req.url).origin;
    await sendWelcomeEmail(
      c.env,
      { email: member.email as string, name: member.name as string },
      token,
      baseUrl
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
    `SELECT p.*,
      COALESCE(v.view_count, 0) as view_count,
      COALESCE(v.unique_readers, 0) as unique_readers
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) as view_count, COUNT(DISTINCT member_id) as unique_readers
      FROM post_views GROUP BY post_id
    ) v ON p.id = v.post_id
    ORDER BY p.updated_at DESC`
  ).all();

  const filter = c.req.query('filter') || undefined;

  return c.html(adminPostsPage((posts.results || []) as unknown as (Post & { view_count: number; unique_readers: number })[], filter));
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
    const coverImageCaption = (body.cover_image_caption || '').trim() || null;
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
      'INSERT INTO posts (title, slug, content, excerpt, cover_image_url, cover_image_caption, status, email_subscribers, published_at, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(title, slug, content, excerpt, coverImageUrl, coverImageCaption, status, emailSubscribers, publishedAt, scheduledAt)
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
  const coverImageCaption = (body.cover_image_caption || '').trim() || null;
  const emailSubscribers = body.email_subscribers ? 1 : 0;
  const scheduledAt = body.scheduled_at || null;

  let slug = (body.slug || '').trim();
  if (!slug) {
    slug = generateSlug(title);
  }
  slug = await ensureUniqueSlug(c.env.DB, slug, id);

  await c.env.DB.prepare(
    "UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image_url = ?, cover_image_caption = ?, email_subscribers = ?, scheduled_at = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(title, slug, content, excerpt, coverImageUrl, coverImageCaption, emailSubscribers, scheduledAt, id)
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
    const coverImageCaption = (body.cover_image_caption || '').trim() || null;
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
      "UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image_url = ?, cover_image_caption = ?, status = ?, email_subscribers = ?, published_at = ?, scheduled_at = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(title, slug, content, excerpt, coverImageUrl, coverImageCaption, status, emailSubscribers, publishedAt, scheduledAt, id)
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

  // Only set published_at if not already published (preserve original publish date on updates)
  const existing = await c.env.DB.prepare('SELECT status, published_at FROM posts WHERE id = ?').bind(id).first();
  const isAlreadyPublished = existing && existing.status === 'published' && existing.published_at;

  if (isAlreadyPublished) {
    await c.env.DB.prepare(
      "UPDATE posts SET status = 'published', scheduled_at = NULL, updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run();
  } else {
    await c.env.DB.prepare(
      "UPDATE posts SET status = 'published', published_at = datetime('now'), scheduled_at = NULL, updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run();
  }

  // Check if email_subscribers is on
  const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
  if (post && post.email_subscribers && !post.emailed) {
    const emailPromise = (async () => {
      const members = await c.env.DB.prepare(
        "SELECT * FROM members WHERE status = 'active' AND email_notifications = 1"
      ).all();

      if (members.results && members.results.length > 0) {
        const baseUrl = new URL(c.req.url).origin;
        await sendNewPostEmail(
          c.env,
          post as unknown as Post,
          members.results as unknown as Member[],
          baseUrl
        );
        await c.env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?').bind(id).run();
      }
    })();

    if (c.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(emailPromise);
    } else {
      await emailPromise;
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

// Analytics
adminRoutes.get('/analytics', async (c) => {
  const postViews = await c.env.DB.prepare(`
    SELECT p.title, p.slug, p.published_at,
      COUNT(v.id) as total_views,
      COUNT(DISTINCT v.member_id) as unique_readers
    FROM post_views v
    JOIN posts p ON v.post_id = p.id
    GROUP BY v.post_id
    ORDER BY total_views DESC
  `).all();

  const recentReaders = await c.env.DB.prepare(`
    SELECT m.name, p.title, p.slug, v.viewed_at
    FROM post_views v
    JOIN members m ON v.member_id = m.id
    JOIN posts p ON v.post_id = p.id
    ORDER BY v.viewed_at DESC
    LIMIT 50
  `).all();

  const totals = await c.env.DB.prepare(`
    SELECT COUNT(*) as total_views, COUNT(DISTINCT member_id) as unique_readers
    FROM post_views
  `).first();

  return c.html(adminAnalyticsPage(
    (postViews.results || []) as any[],
    (recentReaders.results || []) as any[],
    (totals?.total_views as number) || 0,
    (totals?.unique_readers as number) || 0,
  ));
});

// Unfurl URL (fetch Open Graph metadata for link cards)
adminRoutes.get('/unfurl', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.json({ success: false, error: 'No URL' });

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SundaySauceBot/1.0)' },
      redirect: 'follow',
    });
    if (!res.ok) return c.json({ success: false });

    const html = await res.text();
    const getOg = (prop: string): string => {
      const m = html.match(new RegExp(`<meta[^>]*property=["']og:${prop}["'][^>]*content=["']([^"']*)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${prop}["']`, 'i'));
      return m ? m[1] : '';
    };
    const getMeta = (name: string): string => {
      const m = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'));
      return m ? m[1] : '';
    };

    const title = getOg('title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '').trim();
    const description = getOg('description') || getMeta('description');
    const rawImage = getOg('image');
    const image = rawImage ? rawImage.replace(/^http:\/\//, 'https://') : null;
    const siteName = getOg('site_name') || new URL(url).hostname;

    if (!title && !description) return c.json({ success: false });

    return c.json({
      success: true,
      title: title.substring(0, 200),
      description: description.substring(0, 300),
      image: image,
      site: siteName,
    });
  } catch {
    return c.json({ success: false });
  }
});

// Appearance settings
adminRoutes.get('/appearance', async (c) => {
  const settings = await getAllSiteSettings(c.env.DB);
  return c.html(appearancePage(settings));
});

adminRoutes.post('/appearance', async (c) => {
  const body = await c.req.json();
  const allowedKeys = ['bg_color', 'accent_color', 'text_color', 'font_pairing', 'heading_font', 'body_font', 'tagline', 'banner_url', 'profile_photo_url'];

  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      const value = String(body[key]).trim();
      if ((key === 'bg_color' || key === 'accent_color' || key === 'text_color') && !/^#[0-9a-fA-F]{6}$/.test(value)) {
        return c.json({ success: false, error: `Invalid hex color for ${key}` });
      }
      if (key === 'font_pairing' && !['classic', 'modern', 'elegant', 'editorial', 'clean'].includes(value)) {
        return c.json({ success: false, error: 'Invalid font pairing' });
      }
      if ((key === 'heading_font' || key === 'body_font') && (value.length < 1 || value.length > 100)) {
        return c.json({ success: false, error: `Invalid font name for ${key}` });
      }
      await setSiteSetting(c.env.DB, key, value);
    }
  }

  return c.json({ success: true });
});

// Upload media to R2
adminRoutes.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || typeof file === 'string') {
    return c.json({ success: false, error: 'No file provided' }, 400);
  }

  const f = file as File;

  // Validate file type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
  ];
  if (!allowedTypes.includes(f.type)) {
    return c.json({ success: false, error: 'File type not allowed' }, 400);
  }

  // 50MB limit
  if (f.size > 50 * 1024 * 1024) {
    return c.json({ success: false, error: 'File too large (max 50MB)' }, 400);
  }

  // Generate unique key
  const ext = f.name.split('.').pop() || 'bin';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const key = `media/${timestamp}-${random}.${ext}`;

  await c.env.MEDIA_BUCKET.put(key, f.stream(), {
    httpMetadata: { contentType: f.type },
  });

  const url = `/${key}`;

  return c.json({ success: true, url, key });
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
