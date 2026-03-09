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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--warm-white);
      color: var(--text-dark);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    body.bg-burgundy {
      background: var(--burgundy);
      color: var(--cream);
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1, h2, h3, h4 {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      line-height: 1.3;
    }

    a {
      color: var(--burgundy);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid #e8e0d8;
      margin-bottom: 40px;
    }

    .nav-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--burgundy);
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
      color: var(--text-muted);
    }

    .nav-links a:hover {
      color: var(--burgundy);
    }

    .btn {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--burgundy);
      color: var(--cream);
    }

    .btn-secondary {
      background: var(--cream);
      color: var(--burgundy);
    }

    .btn-outline {
      background: transparent;
      color: var(--cream);
      border: 2px solid var(--cream);
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
      color: var(--text-dark);
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d4cdc5;
      border-radius: 8px;
      font-size: 15px;
      font-family: 'Inter', sans-serif;
      background: white;
      color: var(--text-dark);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--burgundy);
      box-shadow: 0 0 0 3px rgba(114, 47, 55, 0.1);
    }

    .form-group textarea {
      min-height: 300px;
      resize: vertical;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      margin-bottom: 24px;
    }

    .message {
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .message-success {
      background: #f0faf0;
      color: #2d6a2d;
      border: 1px solid #c3e6c3;
    }

    .message-error {
      background: #faf0f0;
      color: #6a2d2d;
      border: 1px solid #e6c3c3;
    }

    .message-info {
      background: #f0f4fa;
      color: #2d3d6a;
      border: 1px solid #c3cfe6;
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
      accent-color: var(--burgundy);
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
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: var(--burgundy);
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e8e0d8;
      font-size: 14px;
    }

    th {
      font-weight: 600;
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
