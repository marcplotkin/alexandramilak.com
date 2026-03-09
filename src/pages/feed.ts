import { layout } from './layout';
import type { Post, Member } from '../index';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getExcerpt(post: Post): string {
  if (post.excerpt) return post.excerpt;
  const stripped = post.content.replace(/<[^>]*>/g, '');
  return stripped.length > 150 ? stripped.substring(0, 150) + '...' : stripped;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function feedPage(posts: Post[], member: Member, isAdmin: boolean): string {
  const nav = `
    <nav class="nav">
      <a href="/feed" class="nav-brand">Sunday Sauce</a>
      <div class="nav-links">
        ${isAdmin ? '<a href="/admin">Admin</a>' : ''}
        <span style="color: var(--text-muted); font-size: 13px;">${member.email}</span>
        <a href="/auth/logout">Log Out</a>
      </div>
    </nav>
  `;

  let postsHtml: string;
  if (posts.length === 0) {
    postsHtml = `
      <div style="text-align: center; padding: 60px 0; color: var(--text-muted);">
        <p style="font-size: 18px; margin-bottom: 8px;">No posts yet.</p>
        <p>Check back soon!</p>
      </div>
    `;
  } else {
    postsHtml = posts
      .map(
        (post) => `
      <article style="padding: 32px 0; border-bottom: 1px solid #e8e0d8;">
        ${post.cover_image_url ? `
          <a href="/feed/${post.slug}" style="text-decoration: none; display: block; margin-bottom: 16px;">
            <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px;">
          </a>
        ` : ''}
        <a href="/feed/${post.slug}" style="text-decoration: none;">
          <h2 style="font-size: 24px; color: var(--text-dark); margin-bottom: 8px;">${escapeHtml(post.title)}</h2>
        </a>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 12px;">${formatDate(post.published_at || post.created_at)}</p>
        <p style="color: var(--text-dark); line-height: 1.6; font-size: 15px;">${escapeHtml(getExcerpt(post))}</p>
        <a href="/feed/${post.slug}" style="display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 500; color: var(--burgundy);">Read more &rarr;</a>
      </article>
    `
      )
      .join('');
  }

  const content = `
    ${nav}
    <div style="padding-bottom: 60px;">
      ${postsHtml}
    </div>
  `;

  return layout('Feed', content);
}
