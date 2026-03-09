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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
      ${post.cover_image_url ? `
        <div style="margin: 0 -20px 32px; border-radius: 12px; overflow: hidden;">
          <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}" style="width: 100%; max-height: 440px; object-fit: cover;">
        </div>
      ` : ''}
      <h1 style="font-size: 36px; margin-bottom: 12px; line-height: 1.2;">${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p style="font-size: 18px; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px;">${escapeHtml(post.excerpt)}</p>` : ''}
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 40px;">${formatDate(post.published_at || post.created_at)}</p>
      <div class="post-content">
        ${post.content}
      </div>
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e8e0d8;">
        <a href="/feed" style="font-size: 14px; color: var(--text-muted);">&larr; Back to feed</a>
      </div>
    </article>

    <style>
      .post-content {
        font-size: 18px;
        line-height: 1.8;
        color: var(--text-dark);
      }
      .post-content p { margin-bottom: 16px; }
      .post-content h2 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 28px;
        font-weight: 700;
        margin: 40px 0 16px;
        line-height: 1.3;
      }
      .post-content h3 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 22px;
        font-weight: 700;
        margin: 32px 0 12px;
        line-height: 1.3;
      }
      .post-content blockquote {
        border-left: 3px solid var(--burgundy);
        padding-left: 20px;
        margin: 24px 0;
        color: var(--text-muted);
        font-style: italic;
      }
      .post-content .pull-quote {
        border-left: none;
        text-align: center;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 24px;
        font-style: italic;
        color: var(--burgundy);
        padding: 24px 40px;
        margin: 32px 0;
      }
      .post-content ul, .post-content ol {
        margin: 16px 0;
        padding-left: 24px;
      }
      .post-content li { margin-bottom: 8px; }
      .post-content code {
        background: #f5f0e8;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
        font-family: 'SF Mono', 'Consolas', monospace;
      }
      .post-content pre {
        background: #2C1810;
        color: #f5f0e8;
        padding: 20px 24px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 24px 0;
        font-size: 14px;
        line-height: 1.6;
      }
      .post-content pre code {
        background: none;
        padding: 0;
        color: inherit;
      }
      .post-content img {
        max-width: 100%;
        border-radius: 8px;
        margin: 24px 0;
      }
      .post-content hr {
        border: none;
        height: 1px;
        background: #e8e0d8;
        margin: 40px 0;
      }
      .post-content a {
        color: var(--burgundy);
        text-decoration: underline;
      }
      .post-content s {
        text-decoration: line-through;
      }
    </style>
  `;

  return layout(post.title, content);
}
