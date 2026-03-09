export function homePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>Sunday Sauce — Alexandra Milak</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #2D0A10 0%, #1A0609 100%);
      background-attachment: fixed;
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
      color: rgba(255, 248, 240, 0.6);
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

    .btn-outline {
      background: transparent;
      color: #FFF8F0;
      border: 1.5px solid rgba(255, 248, 240, 0.35);
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
      color: rgba(255, 248, 240, 0.4);
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
  <div class="hero">
    <div class="banner-wrapper">
      <img src="/tomatoes.jpg" alt="Tomatoes" class="banner">
      <img src="/alexandra.jpg" alt="Alexandra Milak" class="profile-photo">
    </div>
    <h1 class="title">Sunday Sauce</h1>
    <p class="tagline">Thoughts and curations about things I care about and think are nice.</p>
    <div class="buttons">
      <a href="/auth/login" class="btn btn-outline">Log In</a>
      <a href="/auth/request" class="btn btn-solid">Request Membership</a>
    </div>
  </div>
</body>
</html>`;
}
