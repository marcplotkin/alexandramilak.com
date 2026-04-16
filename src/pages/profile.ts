import type { Member } from '../index';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function profilePage(member: Member, isAdmin: boolean, message?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>Profile — Sunday Sauce</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" fetchpriority="high">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #1A0609;
      background-image: linear-gradient(180deg, #2D0A10 0%, #1A0609 100%);
      background-size: 100% 100vh;
      background-repeat: no-repeat;
      color: #FFF8F0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 480px;
      margin: 0 auto;
      padding: 0 20px;
    }

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

    .nav-links {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
    }

    .nav-links a {
      color: rgba(255,248,240,0.6);
      text-decoration: none;
      transition: color 0.2s;
    }

    .nav-links a:hover { color: #FFF8F0; }

    .nav-links a:focus-visible {
      outline: 2px solid #FFF8F0;
      outline-offset: 2px;
      border-radius: 2px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 36px;
      font-weight: 500;
      letter-spacing: -0.5px;
      margin-bottom: 36px;
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .current-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,248,240,0.2);
      margin-bottom: 20px;
    }

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,248,240,0.1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 600;
      color: rgba(255,248,240,0.6);
      margin-bottom: 20px;
      border: 3px solid rgba(255,248,240,0.2);
    }

    .upload-area {
      position: relative;
      display: inline-block;
    }

    .upload-btn {
      display: inline-block;
      padding: 10px 24px;
      background: rgba(255,248,240,0.1);
      color: #FFF8F0;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
    }

    .upload-btn:hover {
      background: rgba(255,248,240,0.15);
      border-color: rgba(255,248,240,0.25);
    }

    .upload-btn:focus-visible,
    .remove-avatar:focus-visible {
      outline: 2px solid #FFF8F0;
      outline-offset: 2px;
    }

    .file-input {
      display: none;
    }

    .info-section {
      margin-bottom: 32px;
    }

    .info-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,248,240,0.6);
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 16px;
      color: rgba(255,248,240,0.85);
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,248,240,0.08);
    }

    .message {
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 28px;
      font-size: 14px;
    }

    .message-success {
      background: rgba(45,106,45,0.2);
      border: 1px solid rgba(45,106,45,0.3);
      color: rgba(255,248,240,0.85);
    }

    .message-error {
      background: rgba(192,57,43,0.2);
      border: 1px solid rgba(192,57,43,0.3);
      color: rgba(255,248,240,0.85);
    }

    .remove-avatar {
      display: inline-block;
      margin-left: 12px;
      padding: 10px 20px;
      background: none;
      color: rgba(255,248,240,0.6);
      border: 1px solid rgba(255,248,240,0.1);
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
    }

    .remove-avatar:hover {
      color: #C0392B;
      border-color: rgba(192,57,43,0.3);
    }

    .back-link {
      margin-top: 40px;
    }

    .back-link a {
      font-size: 14px;
      color: rgba(255,248,240,0.65);
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link a:hover { color: #FFF8F0; }

    .footer {
      margin-top: 60px;
      padding: 32px 0;
      text-align: center;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: rgba(255,248,240,0.65);
      border-top: 1px solid rgba(255,248,240,0.08);
    }

    .uploading-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 100;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: rgba(255,248,240,0.8);
    }

    .uploading-overlay.active {
      display: flex;
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
      .container { padding: 0 16px; }
      .page-title { font-size: 28px; }
      .nav { flex-wrap: wrap; gap: 12px; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div class="container">
    <nav class="nav" aria-label="Main navigation">
      <a href="/feed" class="nav-brand">Sunday Sauce</a>
      <div class="nav-links">
        ${isAdmin ? '<a href="/admin">Admin</a>' : ''}
        <a href="/feed">Feed</a>
        <a href="/auth/logout">Log Out</a>
      </div>
    </nav>

    <h1 id="main-content" class="page-title">Profile</h1>

    ${message ? `<div class="message ${message.startsWith('Error') ? 'message-error' : 'message-success'}">${escapeHtml(message)}</div>` : ''}

    <div class="avatar-section">
      ${member.avatar_url
        ? `<img src="${escapeHtml(member.avatar_url)}" alt="Your avatar" class="current-avatar" id="avatarPreview">`
        : `<div class="avatar-placeholder" id="avatarPreview">${escapeHtml(member.name[0].toUpperCase())}</div>`
      }
      <div>
        <input type="file" id="fileInput" class="file-input" accept="image/jpeg,image/png,image/webp">
        <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
          ${member.avatar_url ? 'Change Photo' : 'Upload Photo'}
        </button>
        ${member.avatar_url ? `
          <form method="POST" action="/feed/profile/avatar/remove" style="display:inline;">
            <button type="submit" class="remove-avatar">Remove</button>
          </form>
        ` : ''}
      </div>
    </div>

    <div class="info-section">
      <div class="info-label">Name</div>
      <div class="info-value">${escapeHtml(member.name)}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Email</div>
      <div class="info-value">${escapeHtml(member.email)}</div>
    </div>

    <div class="info-section">
      <div class="info-label">Member Since</div>
      <div class="info-value">${new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

    <div class="back-link">
      <a href="/feed">&larr; Back to feed</a>
    </div>

  </div>

  <div class="uploading-overlay" id="uploadingOverlay">Uploading...</div>

  <script>
    document.getElementById('fileInput').addEventListener('change', async function(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.');
        return;
      }

      const overlay = document.getElementById('uploadingOverlay');
      overlay.classList.add('active');

      try {
        const dataUrl = await resizeImage(file, 200);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/feed/profile/avatar';
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'avatar_data';
        input.value = dataUrl;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      } catch (err) {
        overlay.classList.remove('active');
        alert('Failed to process image. Please try again.');
      }
    });

    function resizeImage(file, maxSize) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function(e) {
          img.onload = function() {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;

            // Crop to square from center
            const size = Math.min(w, h);
            const sx = (w - size) / 2;
            const sy = (h - size) / 2;

            canvas.width = maxSize;
            canvas.height = maxSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);

            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  </script>
</body>
</html>`;
}
