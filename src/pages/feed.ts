import type { Post, Member } from '../index';
import type { SiteSettings } from '../lib/settings';
import { escapeHtml } from '../lib/utils';

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

function getReadingTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, '').trim();
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.round(words / 238));
  return minutes === 1 ? '1 min read' : minutes + ' min read';
}

export function feedPage(posts: Post[], member: Member, isAdmin: boolean, page: number = 1, hasMore: boolean = false, settings?: SiteSettings): string {
  let postsHtml: string;
  if (posts.length === 0) {
    postsHtml = `
      <div style="text-align: center; padding: 80px 0; color: rgba(255,248,240,0.7);">
        <p style="font-size: 18px; margin-bottom: 8px;">No posts yet.</p>
        <p>Check back soon!</p>
      </div>
    `;
  } else {
    postsHtml = posts
      .map(
        (post) => `
      <a href="/feed/${post.slug}" class="post-card">
        ${post.cover_image_url ? `
          <div class="post-card-image">
            <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}" loading="lazy">
          </div>
        ` : ''}
        <div class="post-card-body">
          <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
          <p class="post-card-date">${formatDate(post.published_at || post.created_at)} &middot; ${getReadingTime(post.content)}</p>
          <p class="post-card-excerpt">${escapeHtml(getExcerpt(post))}</p>
          <span class="post-card-read">Read more &rarr;</span>
        </div>
      </a>
    `
      )
      .join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>Feed — Sunday Sauce</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" fetchpriority="high">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #220D12;
      background-image: linear-gradient(180deg, #361219 0%, #220D12 100%);
      background-size: 100% 100vh;
      background-repeat: no-repeat;
      color: #FFF8F0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .hero-section { animation: fadeInUp 0.5s ease both; }
    .post-card { animation: fadeInUp 0.4s ease both; }
    .post-card:nth-child(1) { animation-delay: 0.05s; }
    .post-card:nth-child(2) { animation-delay: 0.1s; }
    .post-card:nth-child(3) { animation-delay: 0.15s; }
    .post-card:nth-child(4) { animation-delay: 0.2s; }
    .post-card:nth-child(5) { animation-delay: 0.25s; }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      margin-bottom: 32px;
    }

    .hero {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 32px;
      position: relative;
    }

    .hero-border {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,248,240,0.12), transparent);
    }

    .banner-wrapper {
      position: relative;
      margin-bottom: 70px;
    }

    .banner {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 20px;
      display: block;
    }

    .profile-photo {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,248,240,0.9);
      position: absolute;
      bottom: -48px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 4px 30px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .profile-photo:hover {
      box-shadow: 0 6px 40px rgba(0,0,0,0.4);
    }

    .lightbox {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .lightbox.active {
      display: flex;
      opacity: 1;
    }

    .lightbox img {
      width: 320px;
      height: 320px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,248,240,0.9);
      box-shadow: 0 20px 80px rgba(0,0,0,0.5);
    }

    @media (max-width: 640px) {
      .lightbox img {
        width: 260px;
        height: 260px;
      }
    }

    .hero-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 48px;
      font-weight: 400;
      color: #FFF8F0;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .hero-tagline {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      color: rgba(255,248,240,0.6);
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    @media (max-width: 640px) {
      .banner { height: 150px; }
      .hero-title { font-size: 26px; }
      .banner-wrapper { margin-bottom: 60px; }
      .profile-photo { width: 80px; height: 80px; bottom: -40px; }
    }

    .nav-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: #FFF8F0;
      text-decoration: none;
    }

    .nav-brand:hover { text-decoration: none; }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 16px;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
    }

    .nav-links a {
      color: rgba(255,248,240,0.6);
      text-decoration: none;
      transition: color 0.2s;
    }

    .nav-links a:hover { color: #FFF8F0; }

    .nav-links .email {
      color: rgba(255,248,240,0.6);
      font-size: 13px;
      letter-spacing: 0.3px;
    }

    .post-card {
      display: block;
      text-decoration: none;
      background: rgba(255,248,240,0.06);
      border: 1px solid rgba(255,248,240,0.06);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .post-card:hover {
      background: rgba(255,248,240,0.10);
      border-color: rgba(255,248,240,0.12);
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.2);
      text-decoration: none;
    }

    .post-card-image img {
      width: 100%;
      max-height: 320px;
      object-fit: contain;
      display: block;
    }

    .post-card-body {
      padding: 32px 30px 28px;
    }

    .post-card-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 26px;
      font-weight: 500;
      color: #FFF8F0;
      margin-bottom: 8px;
      line-height: 1.3;
      letter-spacing: -0.3px;
    }

    .post-card-date {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: rgba(255,248,240,0.6);
      font-size: 12px;
      margin-bottom: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .post-card-excerpt {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: rgba(255,248,240,0.7);
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .post-card-read {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,248,240,0.7);
      transition: color 0.2s;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .post-card:hover .post-card-read { color: #FFF8F0; }

    .footer {
      margin-top: 60px;
      padding: 32px 0;
      text-align: center;
      font-size: 11px;
      color: rgba(255,248,240,0.5);
      position: relative;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .footer-border {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,248,240,0.12), transparent);
    }

    @media (max-width: 640px) {
      .container { padding: 0 16px; }
      .nav { flex-wrap: wrap; gap: 12px; }
      .post-card-body { padding: 20px 20px 18px; }
      .post-card-title { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <nav class="nav">
      <div class="nav-links" style="margin-left: auto;">
        ${isAdmin ? '<a href="/admin">Admin</a>' : ''}
        <a href="/feed/profile">Profile</a>
        <a href="/auth/logout">Log Out</a>
      </div>
    </nav>
    <div class="hero">
      <div class="banner-wrapper">
        <img src="${escapeHtml(settings?.banner_url || '/tomatoes.jpg')}" alt="Banner" class="banner">
        <img src="${escapeHtml(settings?.profile_photo_url || '/alexandra.jpg')}" alt="Alexandra Milak" class="profile-photo" onclick="document.getElementById('lightbox').classList.add('active')">
      </div>
      <h1 class="hero-title">Sunday Sauce</h1>
      <p style="font-size: 14px; color: rgba(255,248,240,0.65); margin-top: 8px; letter-spacing: 0.5px;">by Alexandra Milak</p>
      <p style="font-size: 13px; color: rgba(255,248,240,0.7); margin-top: 6px;">${escapeHtml(settings?.tagline || 'Thoughts and curations of things I care about and think are nice.')}</p>
      <div class="hero-border"></div>
    </div>
    <div style="margin-bottom: 24px;">
      <input type="text" id="feedSearch" placeholder="Search posts..."
        style="width: 100%; padding: 12px 16px; border: 1px solid rgba(255,248,240,0.1); border-radius: 12px; background: rgba(255,248,240,0.04); color: #FFF8F0; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none; transition: border-color 0.2s;"
        onfocus="this.style.borderColor='rgba(255,248,240,0.25)'"
        onblur="this.style.borderColor='rgba(255,248,240,0.1)'">
    </div>
    <div>
      ${postsHtml}
    </div>
    ${page > 1 || hasMore ? `
      <div style="display: flex; justify-content: center; gap: 16px; padding: 32px 0;">
        ${page > 1 ? `<a href="/feed?page=${page - 1}" style="display: inline-block; padding: 10px 24px; background: rgba(255,248,240,0.06); border: 1px solid rgba(255,248,240,0.12); border-radius: 8px; color: #FFF8F0; text-decoration: none; font-size: 14px; transition: all 0.2s;">&larr; Newer</a>` : ''}
        ${hasMore ? `<a href="/feed?page=${page + 1}" style="display: inline-block; padding: 10px 24px; background: rgba(255,248,240,0.06); border: 1px solid rgba(255,248,240,0.12); border-radius: 8px; color: #FFF8F0; text-decoration: none; font-size: 14px; transition: all 0.2s;">Older &rarr;</a>` : ''}
      </div>
    ` : ''}
  </div>
  <div class="lightbox" id="lightbox" onclick="this.classList.remove('active')">
    <img src="${escapeHtml(settings?.profile_photo_url || '/alexandra.jpg')}" alt="Alexandra Milak">
  </div>
<script>
  document.getElementById('feedSearch')?.addEventListener('input', function(e) {
    var q = e.target.value.toLowerCase();
    document.querySelectorAll('.post-card').forEach(function(card) {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
</script>
</body>
</html>`;
}
