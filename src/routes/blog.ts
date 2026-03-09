import { Hono } from 'hono';
import type { Env, Post, Member, Comment } from '../index';
import { getSession, isAdmin } from '../lib/auth';
import { sendCommentNotificationEmail, sendReplyNotificationEmail } from '../lib/email';
import { feedPage } from '../pages/feed';
import { postPage } from '../pages/post';
import { profilePage } from '../pages/profile';

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

// Profile page
blogRoutes.get('/profile', async (c) => {
  const member = (c as any).get('member') as Member;
  const admin = isAdmin(member.email, c.env.ADMIN_EMAIL);
  const msg = c.req.query('msg');
  return c.html(profilePage(member, admin, msg || undefined));
});

// Upload avatar
blogRoutes.post('/profile/avatar', async (c) => {
  const member = (c as any).get('member') as Member;
  const body = await c.req.parseBody();
  const avatarData = body['avatar_data'] as string || '';

  if (!avatarData || !avatarData.startsWith('data:image/')) {
    return c.redirect('/feed/profile?msg=Error: Invalid image data.');
  }

  // Limit base64 size (~100KB encoded)
  if (avatarData.length > 150000) {
    return c.redirect('/feed/profile?msg=Error: Image too large. Please try a smaller photo.');
  }

  await c.env.DB.prepare('UPDATE members SET avatar_url = ? WHERE id = ?')
    .bind(avatarData, member.id)
    .run();

  return c.redirect('/feed/profile?msg=Photo updated!');
});

// Remove avatar
blogRoutes.post('/profile/avatar/remove', async (c) => {
  const member = (c as any).get('member') as Member;

  await c.env.DB.prepare('UPDATE members SET avatar_url = NULL WHERE id = ?')
    .bind(member.id)
    .run();

  return c.redirect('/feed/profile?msg=Photo removed.');
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

  const comments = await c.env.DB.prepare(
    'SELECT c.*, m.name as member_name, m.avatar_url as member_avatar_url FROM comments c JOIN members m ON c.member_id = m.id WHERE c.post_id = ? ORDER BY c.created_at ASC'
  )
    .bind(post.id)
    .all();

  return c.html(
    postPage(
      post as unknown as Post,
      member,
      isAdmin(member.email, c.env.ADMIN_EMAIL),
      (comments.results || []) as unknown as Comment[]
    )
  );
});

// Post a comment
blogRoutes.post('/:slug/comments', async (c) => {
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

  const body = await c.req.parseBody();
  const content = (body.content as string || '').trim();
  const parentId = body.parent_id ? Number(body.parent_id) : null;

  if (!content) {
    return c.redirect(`/feed/${slug}`);
  }

  await c.env.DB.prepare(
    'INSERT INTO comments (post_id, member_id, parent_id, content) VALUES (?, ?, ?, ?)'
  )
    .bind(post.id, member.id, parentId, content)
    .run();

  // Notify Alex of new comment
  const baseUrl = new URL(c.req.url).origin;
  try {
    await sendCommentNotificationEmail(
      c.env,
      { name: member.name },
      post.title as string,
      slug,
      content,
      baseUrl
    );
  } catch (e) {
    console.error('Failed to send comment notification:', e);
  }

  // If this is a reply, notify the parent comment author
  if (parentId) {
    try {
      const parentComment = await c.env.DB.prepare(
        'SELECT c.member_id, m.email, m.name FROM comments c JOIN members m ON c.member_id = m.id WHERE c.id = ?'
      ).bind(parentId).first();

      if (parentComment && parentComment.member_id !== member.id) {
        await sendReplyNotificationEmail(
          c.env,
          parentComment.email as string,
          parentComment.name as string,
          member.name,
          post.title as string,
          slug,
          content,
          baseUrl
        );
      }
    } catch (e) {
      console.error('Failed to send reply notification:', e);
    }
  }

  return c.redirect(`/feed/${slug}#comments`);
});

// Delete a comment (admin or comment author only)
blogRoutes.post('/:slug/comments/:commentId/delete', async (c) => {
  const member = (c as any).get('member') as Member;
  const commentId = c.req.param('commentId');
  const slug = c.req.param('slug');

  const comment = await c.env.DB.prepare('SELECT * FROM comments WHERE id = ?')
    .bind(commentId)
    .first();

  if (!comment) {
    return c.redirect(`/feed/${slug}#comments`);
  }

  // Only admin or comment author can delete
  if (comment.member_id !== member.id && !isAdmin(member.email, c.env.ADMIN_EMAIL)) {
    return c.text('Unauthorized', 403);
  }

  await c.env.DB.prepare('DELETE FROM comments WHERE id = ?')
    .bind(commentId)
    .run();

  return c.redirect(`/feed/${slug}#comments`);
});
