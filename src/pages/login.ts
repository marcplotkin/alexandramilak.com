import { layout } from './layout';

export function loginPage(error?: string): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div class="card" style="width: 100%; max-width: 420px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="/" style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: var(--burgundy); text-decoration: none;">Sunday Sauce</a>
        </div>
        ${error ? `<div class="message message-error">${error}</div>` : ''}

        <!-- Social Login Buttons -->
        <div style="margin-bottom: 24px;">
          <a href="/auth/google" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px 20px; background: #fff; color: #3c4043; border: 1px solid #dadce0; border-radius: 8px; font-size: 15px; font-weight: 500; text-decoration: none; font-family: 'Inter', sans-serif; transition: background 0.2s, box-shadow 0.2s; box-sizing: border-box; cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>
        </div>

        <div style="margin-bottom: 24px;">
          <a href="/auth/apple" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px 20px; background: #000; color: #fff; border: 1px solid #000; border-radius: 8px; font-size: 15px; font-weight: 500; text-decoration: none; font-family: 'Inter', sans-serif; transition: opacity 0.2s; box-sizing: border-box; cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.784 9.476c-.024-2.318 1.892-3.432 1.978-3.484-1.076-1.574-2.752-1.79-3.35-1.814-1.426-.145-2.784.84-3.51.84-.726 0-1.848-.818-3.036-.796-1.562.022-3.002.908-3.808 2.308-1.624 2.818-.416 6.994 1.166 9.282.774 1.12 1.696 2.378 2.908 2.334 1.166-.046 1.606-.754 3.014-.754 1.408 0 1.802.754 3.032.73 1.256-.022 2.05-1.142 2.818-2.264.888-1.298 1.254-2.556 1.276-2.622-.028-.012-2.448-.94-2.488-3.76zm-2.334-6.908c.642-.778 1.076-1.858.958-2.934-.926.038-2.048.616-2.712 1.394-.596.69-1.118 1.792-.978 2.848 1.034.08 2.088-.524 2.732-1.308z" fill="#fff"/>
            </svg>
            Continue with Apple
          </a>
        </div>

        <!-- Divider -->
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="flex: 1; height: 1px; background: #d4cdc5;"></div>
          <span style="padding: 0 16px; font-size: 13px; color: var(--text-muted); font-weight: 500;">or</span>
          <div style="flex: 1; height: 1px; background: #d4cdc5;"></div>
        </div>

        <!-- Magic Link Form -->
        <form method="POST" action="/auth/login">
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; text-align: center;">Send Magic Link</button>
        </form>
        <p style="text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted);">
          No password needed &mdash; we'll email you a link to log in.
        </p>
        <p style="text-align: center; margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: var(--text-muted);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Log In', content, { bodyClass: 'bg-burgundy' });
}

export function checkEmailPage(): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <a href="/" style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: var(--burgundy); text-decoration: none;">Sunday Sauce</a>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px;">&#9993;</div>
        <h2 style="font-size: 22px; margin-bottom: 12px; color: var(--text-dark);">Check your email</h2>
        <p style="color: var(--text-muted); font-size: 15px; line-height: 1.6;">
          We sent you a magic link. Click it to log in. The link expires in 15 minutes.
        </p>
        <p style="margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: var(--text-muted);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Check Your Email', content, { bodyClass: 'bg-burgundy' });
}

export function pendingApprovalPage(): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div class="card" style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <a href="/" style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: var(--burgundy); text-decoration: none;">Sunday Sauce</a>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px;">&#9203;</div>
        <h2 style="font-size: 22px; margin-bottom: 12px; color: var(--text-dark);">Membership Pending</h2>
        <p style="color: var(--text-muted); font-size: 15px; line-height: 1.6;">
          Your membership request has been sent to Alexandra for approval. You'll receive an email when you're approved.
        </p>
        <p style="margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: var(--text-muted);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Membership Pending', content, { bodyClass: 'bg-burgundy' });
}
