export function homePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sunday Sauce — Alexandra Milak</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #722F37;
      color: #FFF8F0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-font-smoothing: antialiased;
    }

    .hero {
      width: 100%;
      max-width: 680px;
      padding: 48px 20px 60px;
      text-align: center;
    }

    .banner-wrapper {
      position: relative;
      margin-bottom: 80px;
    }

    .banner {
      width: 100%;
      height: 280px;
      object-fit: cover;
      border-radius: 16px;
      display: block;
    }

    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #FFF8F0;
      position: absolute;
      bottom: -60px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .handle {
      font-size: 15px;
      color: rgba(255, 248, 240, 0.6);
      margin-bottom: 24px;
    }

    .tagline {
      font-size: 17px;
      line-height: 1.6;
      color: rgba(255, 248, 240, 0.85);
      max-width: 480px;
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
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }

    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: #FFF8F0;
      border: 2px solid rgba(255, 248, 240, 0.5);
    }

    .btn-outline:hover {
      border-color: #FFF8F0;
    }

    .btn-solid {
      background: #FFF8F0;
      color: #722F37;
      border: 2px solid #FFF8F0;
    }

    .footer {
      margin-top: auto;
      padding: 32px 20px;
      font-size: 13px;
      color: rgba(255, 248, 240, 0.4);
    }

    @media (max-width: 640px) {
      .title {
        font-size: 36px;
      }
      .banner {
        height: 200px;
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
  <div class="hero">
    <div class="banner-wrapper">
      <img src="/tomatoes.jpg" alt="Tomatoes" class="banner">
      <img src="/alexandra.jpg" alt="Alexandra Milak" class="profile-photo">
    </div>
    <h1 class="title">Sunday Sauce</h1>
    <p class="handle">@alexandramilak</p>
    <p class="tagline">Thoughts and curations about things I care about and think are nice.</p>
    <div class="buttons">
      <a href="/auth/login" class="btn btn-outline">Log In</a>
      <a href="/auth/request" class="btn btn-solid">Request Membership</a>
    </div>
  </div>
  <div class="footer">&copy; 2026 Alexandra Milak</div>
</body>
</html>`;
}
