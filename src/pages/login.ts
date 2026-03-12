import { layout } from './layout';

export function loginPage(error?: string, csrfToken?: string): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div style="width: 100%; max-width: 420px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="/" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 400; color: #FFF8F0; text-decoration: none; letter-spacing: -0.5px;">Sunday Sauce</a>
          <p style="font-size: 13px; color: rgba(255,248,240,0.6); margin-top: 8px; letter-spacing: 0.3px;">a bimonthly, curated newsletter</p>
        </div>
        ${error ? `<div class="message message-error">${error}</div>` : ''}

        <!-- Social Login Buttons -->
        <div style="margin-bottom: 24px;">
          <a href="/auth/google" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px 20px; background: rgba(255,248,240,0.06); color: #FFF8F0; border: 1px solid rgba(255,248,240,0.25); border-radius: 50px; font-size: 14px; font-weight: 500; letter-spacing: 0.3px; text-decoration: none; font-family: 'DM Sans', sans-serif; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); box-sizing: border-box; cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>
        </div>

        <!-- Divider -->
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="flex: 1; height: 1px; background: rgba(255,248,240,0.15);"></div>
          <span style="padding: 0 16px; font-size: 13px; color: rgba(255,248,240,0.6); font-weight: 500;">or</span>
          <div style="flex: 1; height: 1px; background: rgba(255,248,240,0.15);"></div>
        </div>

        <!-- Magic Link Form -->
        <form method="POST" action="/auth/login">
          <input type="hidden" name="_csrf" value="${csrfToken || ''}">
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
          </div>
          <button type="submit" class="btn btn-secondary" style="width: 100%; text-align: center;">Send Magic Link</button>
        </form>
        <p style="text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,248,240,0.6);">
          No password needed &mdash; it'll email you a link to log in.
        </p>
        <p style="text-align: center; margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.65);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Log In', content);
}

export function checkEmailPage(): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <a href="/" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -0.5px; color: #FFF8F0; text-decoration: none;">Sunday Sauce</a>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px;">&#9993;</div>
        <h2 style="font-size: 22px; margin-bottom: 12px;">Check your email</h2>
        <p style="color: rgba(255,248,240,0.75); font-size: 15px; line-height: 1.6;">
          We sent you a magic link. Click it to log in. The link expires in 15 minutes.
        </p>
        <p style="margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.65);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Check Your Email', content);
}

export function pendingApprovalPage(): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <a href="/" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -0.5px; color: #FFF8F0; text-decoration: none;">Sunday Sauce</a>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px;">&#9203;</div>
        <h2 style="font-size: 22px; margin-bottom: 12px;">Membership Pending</h2>
        <p style="color: rgba(255,248,240,0.75); font-size: 15px; line-height: 1.6;">
          Your membership request has been sent to Alexandra for approval. You'll receive an email when you're approved.
        </p>
        <p style="margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.65);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Membership Pending', content);
}
