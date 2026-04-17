import type { SiteSettings } from '../lib/settings';
import { escapeHtml } from '../lib/utils';

export function homePage(settings: SiteSettings): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>Sunday Sauce — Alexandra Milak</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="description" content="Sunday Sauce — a food and cooking newsletter by Alexandra Milak. Recipes, stories, and kitchen inspiration.">
  <meta property="og:title" content="Sunday Sauce — Alexandra Milak">
  <meta property="og:description" content="A food and cooking newsletter. Recipes, stories, and kitchen inspiration.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://alexandramilak.com">
  <meta property="og:image" content="${escapeHtml(settings.banner_url)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Sunday Sauce — Alexandra Milak">
  <meta name="twitter:description" content="A food and cooking newsletter. Recipes, stories, and kitchen inspiration.">
  <meta name="twitter:image" content="${escapeHtml(settings.banner_url)}">
  <link rel="dns-prefetch" href="https://static.cloudflareinsights.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" fetchpriority="high">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #220D12;
      background-image: none;
      color: #FFF8F0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-font-smoothing: antialiased;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: translateX(-50%) scale(0.85); }
      to { opacity: 1; transform: translateX(-50%) scale(1); }
    }

    .hero {
      width: 100%;
      max-width: 680px;
      padding: 48px 20px 60px;
      text-align: center;
    }

    .banner { animation: fadeIn 0.6s ease both; }
    .profile-photo { animation: scaleIn 0.5s ease 0.2s both; }
    .title { animation: fadeInUp 0.5s ease 0.3s both; }
    .tagline { animation: fadeInUp 0.5s ease 0.4s both; }
    .buttons { animation: fadeInUp 0.5s ease 0.5s both; }

    .banner-wrapper {
      position: relative;
      margin-bottom: 80px;
    }

    .banner {
      width: 100%;
      height: 280px;
      object-fit: cover;
      border-radius: 20px;
      display: block;
    }

    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,248,240,0.9);
      position: absolute;
      bottom: -60px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 4px 30px rgba(0,0,0,0.3), 0 0 60px rgba(45,10,16,0.5);
    }

    .title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 56px;
      font-weight: 400;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }

    .handle {
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(255, 248, 240, 0.75);
      margin-bottom: 24px;
    }

    .tagline {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.2px;
      line-height: 1.8;
      color: rgba(255, 248, 240, 0.85);
      max-width: 600px;
      margin: 0 auto 40px;
    }

    .buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-block;
      padding: 14px 36px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'DM Sans', sans-serif;
    }

    .btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .btn:focus-visible {
      outline: 2px solid #FFF8F0;
      outline-offset: 2px;
    }

    .btn-outline {
      background: transparent;
      color: #FFF8F0;
      border: 1.5px solid rgba(255, 248, 240, 0.55);
      letter-spacing: 0.5px;
    }

    .btn-outline:hover {
      border-color: #FFF8F0;
    }

    .btn-solid {
      background: #FFF8F0;
      color: #2D0A10;
      border: 2px solid #FFF8F0;
      letter-spacing: 0.5px;
    }

    .footer {
      margin-top: auto;
      padding: 32px 20px;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: rgba(255, 248, 240, 0.65);
    }

    .skip-link {
      position: absolute;
      top: -100%;
      left: 0;
      padding: 12px 24px;
      background: #FFF8F0;
      color: #2D0A10;
      font-weight: 600;
      font-size: 14px;
      z-index: 1000;
      text-decoration: none;
      border-radius: 0 0 8px 0;
    }

    .skip-link:focus {
      top: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (max-width: 640px) {
      .title {
        font-size: 40px;
      }
      .banner {
        height: 180px;
      }
      .buttons {
        flex-direction: column;
        align-items: center;
      }
      .btn {
        width: 100%;
        max-width: 280px;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <main id="main-content" class="hero">
    <div class="banner-wrapper">
      <img src="${escapeHtml(settings.banner_url)}" alt="Sunday Sauce newsletter banner" class="banner" width="1800" height="1350">
      <img src="${escapeHtml(settings.profile_photo_url)}" alt="Alexandra Milak" class="profile-photo" width="800" height="691">
    </div>
    <h1 class="title">Sunday Sauce</h1>
    <p class="tagline">${escapeHtml(settings.tagline)}</p>
    <div class="buttons">
      <a href="/auth/login" class="btn btn-outline">Log In</a>
      <a href="/auth/request" class="btn btn-solid">Request Membership</a>
    </div>
  </main>
</body>
</html>`;
}
