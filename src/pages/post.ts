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

export function postPage(post: Post, member: Member, isAdmin: boolean): string {
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

  const content = `
    ${nav}
    <article style="padding-bottom: 60px;">
      <h1 style="font-size: 36px; margin-bottom: 12px; line-height: 1.2;">${escapeHtml(post.title)}</h1>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 40px;">${formatDate(post.published_at || post.created_at)}</p>
      <div class="post-content" style="font-size: 17px; line-height: 1.8; color: var(--text-dark);">
        ${post.content}
      </div>
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e8e0d8;">
        <a href="/feed" style="font-size: 14px; color: var(--text-muted);">&larr; Back to feed</a>
      </div>
    </article>
  `;

  return layout(post.title, content);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
