export function layout(
  title: string,
  content: string,
  options?: { bodyClass?: string }
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Sunday Sauce</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --burgundy: #2D0A10;
      --burgundy-dark: #1A0609;
      --burgundy-light: #4A1520;
      --cream: #FFF8F0;
      --warm-white: #FFFAF5;
      --tomato-red: #C0392B;
      --gold: #D4A853;
      --text-dark: #2C1810;
      --text-muted: #7A6B63;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #2D0A10 0%, #1A0609 100%);
      background-attachment: fixed;
      color: var(--cream);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      letter-spacing: 0.1px;
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1, h2, h3, h4 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 500;
      line-height: 1.3;
      color: var(--cream);
      letter-spacing: -0.3px;
    }

    a {
      color: rgba(255,248,240,0.7);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--cream);
      text-decoration: underline;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .container > * {
      animation: fadeInUp 0.4s ease both;
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,248,240,0.12);
      margin-bottom: 40px;
    }

    .nav-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--cream);
      text-decoration: none;
    }

    .nav-brand:hover {
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
      transition: color 0.2s ease;
    }

    .nav-links a:hover {
      color: var(--cream);
    }

    .btn {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 50px;
      font-weight: 500;
      font-size: 13px;
      letter-spacing: 0.5px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn:hover {
      transform: translateY(-1px);
      text-decoration: none;
    }

    .btn-primary {
      background: rgba(255,248,240,0.12);
      color: var(--cream);
      border: 1px solid rgba(255,248,240,0.15);
    }

    .btn-primary:hover {
      background: rgba(255,248,240,0.18);
    }

    .btn-secondary {
      background: var(--cream);
      color: var(--burgundy);
    }

    .btn-outline {
      background: transparent;
      color: var(--cream);
      border: 2px solid rgba(255,248,240,0.4);
    }

    .btn-danger {
      background: var(--tomato-red);
      color: white;
      font-size: 13px;
      padding: 6px 14px;
    }

    .btn-small {
      padding: 6px 14px;
      font-size: 13px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: rgba(255,248,240,0.7);
    }

    .card-white .form-group label {
      color: var(--text-dark);
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 8px;
      font-size: 15px;
      font-family: 'DM Sans', sans-serif;
      background: rgba(255,248,240,0.08);
      color: var(--cream);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: rgba(255,248,240,0.3);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: rgba(255,248,240,0.35);
      box-shadow: 0 0 0 3px rgba(255,248,240,0.08);
    }

    .card-white .form-group input,
    .card-white .form-group textarea,
    .card-white .form-group select {
      border: 1px solid #d4cdc5;
      background: white;
      color: var(--text-dark);
    }

    .card-white .form-group input::placeholder,
    .card-white .form-group textarea::placeholder {
      color: #999;
    }

    .card-white .form-group input:focus,
    .card-white .form-group textarea:focus {
      border-color: var(--burgundy);
      box-shadow: 0 0 0 3px rgba(114, 47, 55, 0.1);
    }

    .form-group textarea {
      min-height: 300px;
      resize: vertical;
    }

    .card {
      background: rgba(255,248,240,0.05);
      border: 1px solid rgba(255,248,240,0.08);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      transition: border-color 0.3s ease, background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      border-color: rgba(255,248,240,0.15);
      background: rgba(255,248,240,0.07);
    }

    /* White card variant for forms (login, request membership) */
    .card-white {
      background: white;
      border: none;
      color: var(--text-dark);
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    }

    .card-white h2 { color: var(--burgundy); }
    .card-white a { color: var(--burgundy); }
    .card-white a:hover { color: var(--burgundy-dark); }

    .card-white .btn-primary {
      background: var(--burgundy);
      color: var(--cream);
      border: none;
    }

    .card-white .message-error {
      background: #faf0f0;
      color: #6a2d2d;
      border: 1px solid #e6c3c3;
    }

    .message {
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .message-success {
      background: rgba(45,106,45,0.15);
      color: #6aba6a;
      border: 1px solid rgba(45,106,45,0.3);
    }

    .message-error {
      background: rgba(192,57,43,0.15);
      color: #e6a09a;
      border: 1px solid rgba(192,57,43,0.3);
    }

    .message-info {
      background: rgba(37,99,235,0.15);
      color: #93b5f5;
      border: 1px solid rgba(37,99,235,0.3);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }

    .checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--cream);
    }

    .checkbox-group label {
      font-size: 14px;
      margin-bottom: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: rgba(255,248,240,0.04);
      border: 1px solid rgba(255,248,240,0.08);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      transition: transform 0.2s ease, border-color 0.3s ease, background 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255,248,240,0.15);
      background: rgba(255,248,240,0.06);
    }

    .stat-number {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 700;
      color: var(--cream);
    }

    .stat-label {
      font-size: 13px;
      color: rgba(255,248,240,0.5);
      margin-top: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(255,248,240,0.08);
      font-size: 14px;
      color: rgba(255,248,240,0.8);
    }

    th {
      font-weight: 500;
      color: rgba(255,248,240,0.4);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    td a {
      color: var(--cream);
      font-weight: 500;
    }

    @media (max-width: 640px) {
      .container {
        padding: 0 16px;
      }
      .card {
        padding: 24px;
      }
      .nav {
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  </style>
</head>
<body${options?.bodyClass ? ` class="${options.bodyClass}"` : ''}>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;
}
