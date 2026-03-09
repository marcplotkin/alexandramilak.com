import { layout } from './layout';

export function requestMembershipPage(error?: string): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div style="width: 100%; max-width: 420px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="/" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -0.5px; color: #FFF8F0; text-decoration: none;">Sunday Sauce</a>
        </div>
        <h2 style="text-align: center; font-size: 22px; margin-bottom: 24px;">Request Membership</h2>
        ${error ? `<div class="message message-error">${error}</div>` : ''}
        <form method="POST" action="/auth/request">
          <div class="form-group">
            <label for="name">Your name</label>
            <input type="text" id="name" name="name" required placeholder="Your full name" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
          </div>
          <button type="submit" class="btn btn-secondary" style="width: 100%; text-align: center;">Request Access</button>
        </form>
        <p style="text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,248,240,0.4);">
          Your request will be sent to Alexandra for approval.
        </p>
        <p style="text-align: center; margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.45);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Request Membership', content);
}

export function requestSentPage(): string {
  const content = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
      <div style="width: 100%; max-width: 420px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <a href="/" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -0.5px; color: #FFF8F0; text-decoration: none;">Sunday Sauce</a>
        </div>
        <div style="font-size: 48px; margin-bottom: 16px;">&#10003;</div>
        <h2 style="font-size: 22px; margin-bottom: 12px;">Request Sent</h2>
        <p style="color: rgba(255,248,240,0.6); font-size: 15px; line-height: 1.6;">
          Your membership request has been sent to Alexandra. You'll receive an email when your request is approved.
        </p>
        <p style="margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.45);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Request Sent', content);
}
