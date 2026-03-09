import type { Post, Member, Comment } from '../index';

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

function buildCommentsHtml(comments: Comment[], post: Post, member: Member, isAdmin: boolean): string {
  if (comments.length === 0) {
    return '<p class="no-comments">No comments yet. Be the first to share your thoughts.</p>';
  }

  const topLevel = comments.filter(c => !c.parent_id);
  const replyMap = new Map<number, Comment[]>();
  comments.filter(c => c.parent_id).forEach(r => {
    const arr = replyMap.get(r.parent_id!) || [];
    arr.push(r);
    replyMap.set(r.parent_id!, arr);
  });

  function renderComment(comment: Comment): string {
    const childReplies = replyMap.get(comment.id) || [];
    const avatar = comment.member_avatar_url
      ? `<img class="comment-avatar" src="${escapeHtml(comment.member_avatar_url)}" alt="">`
      : `<div class="comment-avatar-placeholder">${escapeHtml((comment.member_name || 'M')[0].toUpperCase())}</div>`;

    const deleteBtn = (comment.member_id === member.id || isAdmin)
      ? `<form method="POST" action="/feed/${post.slug}/comments/${comment.id}/delete" style="display:inline;" onsubmit="return confirm('Delete this comment?')"><button type="submit" class="comment-delete">delete</button></form>`
      : '';

    const repliesHtml = childReplies.length > 0
      ? `<div class="comment-replies">${childReplies.map(r => renderComment(r)).join('')}</div>`
      : '';

    return `<div class="comment" id="comment-${comment.id}">
      <div class="comment-header">
        <div class="comment-author-info">
          ${avatar}
          <div>
            <span class="comment-author">${escapeHtml(comment.member_name || 'Member')}</span>
            <span class="comment-date" style="margin-left: 8px;">${formatDate(comment.created_at)}</span>
          </div>
        </div>
        <div>${deleteBtn}<button class="reply-btn" onclick="toggleReply(${comment.id})">reply</button></div>
      </div>
      <div class="comment-body">${escapeHtml(comment.content)}</div>
      <form class="reply-form" id="reply-form-${comment.id}" method="POST" action="/feed/${post.slug}/comments">
        <input type="hidden" name="parent_id" value="${comment.id}">
        <textarea name="content" placeholder="Write a reply..." required></textarea>
        <div class="reply-form-actions">
          <button type="submit">Reply</button>
          <button type="button" class="reply-cancel" onclick="toggleReply(${comment.id})">Cancel</button>
        </div>
      </form>
      ${repliesHtml}
    </div>`;
  }

  return topLevel.map(c => renderComment(c)).join('');
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function postGatePage(post: Post): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>${escapeHtml(post.title)} — Sunday Sauce</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: #2C1810;
      color: #FFF8F0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .gate {
      width: 100%;
      max-width: 480px;
      text-align: center;
    }
    .brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 42px;
      font-weight: 500;
      letter-spacing: -0.5px;
      color: #FFF8F0;
      margin-bottom: 8px;
    }
    .tagline {
      font-size: 15px;
      color: rgba(255,248,240,0.5);
      margin-bottom: 40px;
      font-style: italic;
    }
    .post-preview {
      background: rgba(255,248,240,0.04);
      border: 1px solid rgba(255,248,240,0.08);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
    }
    ${post.cover_image_url ? `
    .preview-image {
      width: calc(100% + 64px);
      margin: -32px -32px 24px;
      border-radius: 16px 16px 0 0;
      overflow: hidden;
    }
    .preview-image img {
      width: 100%;
      max-height: 280px;
      object-fit: contain;
      display: block;
    }
    ` : ''}
    .preview-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 28px;
      font-weight: 500;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .preview-excerpt {
      font-size: 15px;
      color: rgba(255,248,240,0.5);
      margin-bottom: 8px;
    }
    .preview-date {
      font-size: 13px;
      color: rgba(255,248,240,0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .members-note {
      font-size: 14px;
      color: rgba(255,248,240,0.45);
      margin-bottom: 28px;
      line-height: 1.6;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
    .btn {
      display: inline-block;
      padding: 14px 36px;
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      letter-spacing: 0.5px;
      transition: all 0.15s;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: #C0392B;
      color: #FFF8F0;
    }
    .btn-primary:hover { background: #A93226; }
    .btn-secondary {
      background: rgba(255,248,240,0.08);
      color: #FFF8F0;
      border: 1px solid rgba(255,248,240,0.12);
    }
    .btn-secondary:hover { background: rgba(255,248,240,0.12); }
  </style>
</head>
<body>
  <div class="gate">
    <div class="brand">Sunday Sauce</div>
    <div class="tagline">Monthly emails from Alexandra Milak</div>

    <div class="post-preview">
      ${post.cover_image_url ? `
        <div class="preview-image">
          <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}">
        </div>
      ` : ''}
      <div class="preview-title">${escapeHtml(post.title)}</div>
      ${post.excerpt ? `<div class="preview-excerpt">${escapeHtml(post.excerpt)}</div>` : ''}
      <div class="preview-date">${formatDate(post.published_at || post.created_at)}</div>
    </div>

    <p class="members-note">
      Sunday Sauce is a private newsletter for friends of Alexandra &mdash; thoughts and curations about things she cares about and thinks are nice. Already a member? Log in below. Otherwise, request to join &mdash; if Alexandra knows you, you're in!
    </p>

    <div class="actions">
      <a href="/auth/login" class="btn btn-primary">Log In</a>
      <a href="/auth/request" class="btn btn-secondary">Request Membership</a>
    </div>
  </div>
</body>
</html>`;
}

export function postPage(post: Post, member: Member, isAdmin: boolean, comments: Comment[] = []): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>${escapeHtml(post.title)} — Sunday Sauce</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #2D0A10 0%, #1A0609 100%);
      background-attachment: fixed;
      color: #FFF8F0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 20px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    article { animation: fadeInUp 0.5s ease both; }
    .comments-section { animation: fadeInUp 0.5s ease 0.1s both; }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,248,240,0.08);
      margin-bottom: 48px;
    }

    .nav-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 20px;
      font-weight: 500;
      color: #FFF8F0;
      text-decoration: none;
    }

    .nav-brand:hover { text-decoration: none; }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
    }

    .nav-links a {
      color: rgba(255,248,240,0.6);
      text-decoration: none;
      transition: color 0.25s ease;
    }

    .nav-links a:hover { color: #FFF8F0; }

    .nav-links .email {
      color: rgba(255,248,240,0.4);
      font-size: 13px;
    }

    .cover-image {
      width: 100%;
      margin: 0 0 0;
      border-radius: 12px;
      overflow: hidden;
    }

    .cover-image img {
      width: 100%;
      height: auto;
      display: block;
    }

    .cover-caption {
      text-align: left;
      font-size: 13px;
      color: rgba(255,248,240,0.4);
      font-style: italic;
      margin: 4px 0 36px;
    }

    .cover-image-no-caption {
      margin-bottom: 36px;
    }

    .post-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 44px;
      font-weight: 500;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 12px;
      color: #FFF8F0;
    }

    .post-subtitle {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 18px;
      color: rgba(255,248,240,0.55);
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .post-date {
      font-family: 'DM Sans', sans-serif;
      color: rgba(255,248,240,0.35);
      font-size: 13px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 44px;
    }

    .post-content {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 17px;
      line-height: 1.8;
      color: rgba(255,248,240,0.88);
    }

    .post-content p { margin-bottom: 20px; }

    .post-content h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 30px;
      font-weight: 500;
      letter-spacing: -0.3px;
      margin: 44px 0 16px;
      line-height: 1.3;
      color: #FFF8F0;
    }

    .post-content h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 24px;
      font-weight: 500;
      margin: 36px 0 12px;
      line-height: 1.3;
      color: #FFF8F0;
    }

    .post-content blockquote {
      border-left: 2px solid rgba(255,248,240,0.2);
      padding-left: 20px;
      margin: 28px 0;
      color: rgba(255,248,240,0.6);
      font-style: italic;
    }

    .post-content .pull-quote {
      border-left: none;
      text-align: center;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 24px;
      font-style: italic;
      color: rgba(255,248,240,0.7);
      padding: 28px 40px;
      margin: 36px 0;
    }

    .post-content ul, .post-content ol {
      margin: 20px 0;
      padding-left: 24px;
    }

    .post-content li { margin-bottom: 10px; }

    .post-content code {
      background: rgba(255,248,240,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'SF Mono', 'Consolas', monospace;
    }

    .post-content pre {
      background: rgba(0,0,0,0.3);
      color: rgba(255,248,240,0.85);
      padding: 20px 24px;
      border-radius: 10px;
      overflow-x: auto;
      margin: 28px 0;
      font-size: 14px;
      line-height: 1.6;
      border: 1px solid rgba(255,248,240,0.08);
    }

    .post-content pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    .post-content img {
      max-width: 100%;
      border-radius: 10px;
      margin: 28px 0;
    }

    .post-content video {
      max-width: 100%;
      border-radius: 10px;
      margin: 28px 0;
    }

    .embed-wrapper {
      margin: 28px 0;
      border-radius: 12px;
      overflow: hidden;
    }

    .embed-wrapper iframe {
      display: block;
    }

    .post-content hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,248,240,0.12), transparent);
      margin: 44px 0;
    }

    .post-content a {
      color: rgba(255,248,240,0.7);
      text-decoration: underline;
      text-decoration-color: rgba(255,248,240,0.3);
      text-underline-offset: 3px;
      transition: color 0.2s;
    }

    .post-content a:hover {
      color: #FFF8F0;
    }

    .post-content s {
      text-decoration: line-through;
    }

    .back-link {
      display: inline-block;
      margin-top: 48px;
      padding-top: 24px;
      background: linear-gradient(90deg, transparent, rgba(255,248,240,0.1), transparent);
      background-size: 100% 1px;
      background-repeat: no-repeat;
      background-position: top;
      border-top: none;
      width: 100%;
    }

    .back-link a {
      font-size: 14px;
      color: rgba(255,248,240,0.45);
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link a:hover { color: #FFF8F0; }

    /* ---- COMMENTS ---- */
    .comments-section {
      margin-top: 56px;
      padding-top: 36px;
      background: linear-gradient(90deg, transparent, rgba(255,248,240,0.1), transparent);
      background-size: 100% 1px;
      background-repeat: no-repeat;
      background-position: top;
      border-top: none;
    }

    .comments-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 24px;
      font-weight: 500;
      letter-spacing: -0.3px;
      margin-bottom: 28px;
      color: #FFF8F0;
    }

    .comment {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,248,240,0.08);
      transition: background 0.2s ease;
    }

    .comment:last-of-type {
      border-bottom: none;
    }

    .comment-replies {
      margin-left: 42px;
      border-left: 1px solid rgba(255,248,240,0.08);
      padding-left: 16px;
    }

    .comment-replies .comment {
      padding: 14px 0;
    }

    .reply-btn {
      background: none;
      border: none;
      color: rgba(255,248,240,0.3);
      font-size: 12px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.15s;
      margin-left: 8px;
    }

    .reply-btn:hover {
      color: rgba(255,248,240,0.6);
      background: rgba(255,248,240,0.06);
    }

    .reply-form {
      margin: 12px 0 0 42px;
      display: none;
    }

    .reply-form textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 10px;
      background: rgba(255,248,240,0.06);
      color: #FFF8F0;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      resize: vertical;
      min-height: 70px;
      outline: none;
      transition: border-color 0.2s;
    }

    .reply-form textarea:focus {
      border-color: rgba(255,248,240,0.35);
    }

    .reply-form-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .reply-form button[type="submit"] {
      padding: 8px 20px;
      background: rgba(255,248,240,0.1);
      color: #FFF8F0;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
    }

    .reply-form button[type="submit"]:hover {
      background: rgba(255,248,240,0.15);
    }

    .reply-cancel {
      padding: 8px 16px;
      background: none;
      color: rgba(255,248,240,0.4);
      border: none;
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
    }

    .reply-cancel:hover { color: rgba(255,248,240,0.6); }

    .comment-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .comment-author-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid rgba(255,248,240,0.15);
    }

    .comment-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,248,240,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,248,240,0.5);
      flex-shrink: 0;
    }

    .comment-author {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      letter-spacing: 0.3px;
      font-size: 15px;
      color: #FFF8F0;
    }

    .comment-date {
      font-size: 13px;
      letter-spacing: 0.5px;
      color: rgba(255,248,240,0.35);
    }

    .comment-body {
      font-size: 15px;
      line-height: 1.7;
      color: rgba(255,248,240,0.8);
      white-space: pre-wrap;
    }

    .comment-delete {
      background: none;
      border: none;
      color: rgba(255,248,240,0.25);
      font-size: 12px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.15s;
    }

    .comment-delete:hover {
      color: #C0392B;
      background: rgba(192, 57, 43, 0.1);
    }

    .comment-form {
      margin-top: 28px;
    }

    .comment-form textarea {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 12px;
      background: rgba(255,248,240,0.06);
      color: #FFF8F0;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      resize: vertical;
      min-height: 100px;
      outline: none;
      transition: border-color 0.2s;
    }

    .comment-form textarea::placeholder {
      color: rgba(255,248,240,0.25);
    }

    .comment-form textarea:focus {
      border-color: rgba(255,248,240,0.35);
    }

    .comment-form button {
      margin-top: 12px;
      padding: 12px 28px;
      background: rgba(255,248,240,0.1);
      color: #FFF8F0;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
    }

    .comment-form button:hover {
      background: rgba(255,248,240,0.15);
      border-color: rgba(255,248,240,0.25);
    }

    .no-comments {
      color: rgba(255,248,240,0.35);
      font-size: 15px;
      font-style: italic;
    }

    .footer {
      margin-top: 60px;
      padding: 32px 0;
      text-align: center;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: rgba(255,248,240,0.3);
      border-top: 1px solid rgba(255,248,240,0.08);
    }

    @media (max-width: 640px) {
      .container { padding: 0 16px; }
      .nav { flex-wrap: wrap; gap: 12px; }
      .post-title { font-size: 30px; }
      .post-content { font-size: 16px; }
      .cover-image {
        width: 100%;
        margin: 0 0 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <nav class="nav">
      <a href="/feed" class="nav-brand">Sunday Sauce</a>
      <div class="nav-links">
        ${isAdmin ? '<a href="/admin">Admin</a>' : ''}
        <a href="/feed/profile">Profile</a>
        <a href="/auth/logout">Log Out</a>
      </div>
    </nav>
    <article>
      ${post.cover_image_url ? `
        <div class="cover-image${post.cover_image_caption ? '' : ' cover-image-no-caption'}">
          <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}">
        </div>
        ${post.cover_image_caption ? `<p class="cover-caption">${escapeHtml(post.cover_image_caption)}</p>` : ''}
      ` : ''}
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p class="post-subtitle">${escapeHtml(post.excerpt)}</p>` : ''}
      <p class="post-date">${formatDate(post.published_at || post.created_at)}${isAdmin ? ` &nbsp;<a href="/admin/posts/${post.id}/edit" style="font-size: 12px; color: rgba(255,248,240,0.35); text-decoration: none; border: 1px solid rgba(255,248,240,0.15); padding: 3px 10px; border-radius: 4px;">&#9998; Edit</a>` : ''}</p>
      <div class="post-content">
        ${post.content}
      </div>
      <!-- Share -->
      ${member.referral_code ? `
      <div style="text-align: center; margin-top: 40px; padding: 24px; background: rgba(255,248,240,0.04); border-radius: 12px; border: 1px solid rgba(255,248,240,0.08);">
        <p style="font-size: 15px; color: rgba(255,248,240,0.7); margin-bottom: 12px;">Know someone who'd enjoy Sunday Sauce?</p>
        <button onclick="copyShareLink()" id="shareBtn" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: rgba(255,248,240,0.1); color: #FFF8F0; border: 1px solid rgba(255,248,240,0.15); border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer; transition: all 0.15s;">
          &#128279; Copy Invite Link
        </button>
        <input type="hidden" id="shareUrl" value="${escapeAttr(member.referral_code)}">
      </div>
      <script>
        function copyShareLink() {
          var code = document.getElementById('shareUrl').value;
          var url = window.location.origin + '/?ref=' + code;
          navigator.clipboard.writeText(url).then(function() {
            var btn = document.getElementById('shareBtn');
            btn.innerHTML = '&#10003; Copied!';
            setTimeout(function() { btn.innerHTML = '&#128279; Copy Invite Link'; }, 2000);
          });
        }
      </script>
      ` : ''}

      <!-- Comments -->
      <div class="comments-section" id="comments">
        <h2 class="comments-title">Comments${comments.length > 0 ? ` (${comments.length})` : ''}</h2>
        ${buildCommentsHtml(comments, post, member, isAdmin)}

        <form class="comment-form" method="POST" action="/feed/${post.slug}/comments">
          <textarea name="content" placeholder="Leave a comment..." required></textarea>
          <button type="submit">Post Comment</button>
        </form>
      </div>

      <script>
        // Open all post content links in new tab
        document.querySelectorAll('.post-content a').forEach(function(a) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener');
        });

        function toggleReply(commentId) {
          var form = document.getElementById('reply-form-' + commentId);
          if (form.style.display === 'block') {
            form.style.display = 'none';
          } else {
            // Close other open reply forms
            document.querySelectorAll('.reply-form').forEach(function(f) { f.style.display = 'none'; });
            form.style.display = 'block';
            form.querySelector('textarea').focus();
          }
        }
      </script>

      <div class="back-link">
        <a href="/feed">&larr; Back to feed</a>
      </div>
    </article>
  </div>
</body>
</html>`;
}
