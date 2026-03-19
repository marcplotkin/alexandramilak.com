import { layout } from './layout';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function requestMembershipPage(error?: string, refCode?: string, csrfToken?: string, turnstileSiteKey?: string): string {
  const content = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 0;">
      <div style="width: 100%; max-width: 680px; margin-bottom: 32px;">
        <img src="/tomatoes.jpg" alt="Tomatoes" style="width: 100%; height: 180px; object-fit: cover; border-radius: 0 0 20px 20px; display: block;">
      </div>
      <div style="width: 100%; max-width: 420px; padding: 0 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="/" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -0.5px; color: #FFF8F0; text-decoration: none;">Sunday Sauce</a>
          <p style="font-size: 12px; color: rgba(255,248,240,0.65); font-style: italic; margin-top: 6px;">A bimonthly curated newsletter</p>
        </div>
        <h2 style="text-align: center; font-size: 22px; margin-bottom: 24px;">Request Membership</h2>
        ${error ? `<div class="message message-error">${error}</div>` : ''}
        <form method="POST" action="/auth/request">
          <input type="hidden" name="_csrf" value="${csrfToken || ''}">
          <input type="hidden" name="_t" value="">
          ${refCode ? `<input type="hidden" name="ref_code" value="${escapeHtml(refCode)}">` : ''}
          <!-- honeypot — hidden from humans via CSS -->
          <div style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true" tabindex="-1">
            <label for="website">Website</label>
            <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
          </div>
          <div class="form-group">
            <label for="name">Your name</label>
            <input type="text" id="name" name="name" required placeholder="Your full name" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label for="referred_by">Who referred you? <span style="color: rgba(255,248,240,0.55); font-weight: 400;">(optional)</span></label>
            <input type="text" id="referred_by" name="referred_by" placeholder="Name of the member who sent you">
          </div>
          ${turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(turnstileSiteKey)}" data-theme="dark" style="margin-bottom: 16px;"></div>` : ''}
          <button type="submit" class="btn btn-secondary" style="width: 100%; text-align: center;">Request Access</button>
        </form>
        ${turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ''}
        <script>document.querySelector('input[name="_t"]').value=Date.now();</script>
        <p style="text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,248,240,0.6);">
          Your request will be sent to Alexandra for approval.
        </p>
        <p style="text-align: center; margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.65);">&larr; Back to home</a>
        </p>
      </div>
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
        <p style="color: rgba(255,248,240,0.75); font-size: 15px; line-height: 1.6;">
          Your membership request has been sent to Alexandra. You'll receive an email when your request is approved.
        </p>
        <p style="margin-top: 24px; font-size: 14px;">
          <a href="/" style="color: rgba(255,248,240,0.65);">&larr; Back to home</a>
        </p>
      </div>
    </div>
  `;
  return layout('Request Sent', content);
}
