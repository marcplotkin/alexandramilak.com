/**
 * Spam protection utilities for membership requests.
 *
 * Layers:
 *  1. Honeypot — hidden form field bots fill, humans skip
 *  2. Timing — reject submissions faster than a human can type
 *  3. Disposable email domains — blocklist of throwaway providers
 *  4. Gibberish detection — flag random-character names
 */

// ── Honeypot ──────────────────────────────────────────────
export function isHoneypotFilled(body: Record<string, string | File>): boolean {
  const val = (body['website'] as string || '').trim();
  return val.length > 0;
}

// ── Timing ────────────────────────────────────────────────
/** Returns true if the form was submitted suspiciously fast (< 3 seconds). */
export function isTooFast(formLoadedAt: string | undefined): boolean {
  if (!formLoadedAt) return false; // can't check — allow through
  const loaded = parseInt(formLoadedAt, 10);
  if (isNaN(loaded)) return false;
  const elapsed = Date.now() - loaded;
  return elapsed < 3000;
}

// ── Disposable email domains ──────────────────────────────
const DISPOSABLE_DOMAINS = new Set([
  // Major disposable/temp mail providers
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'tempmail.com',
  'throwaway.email', 'temp-mail.org', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamailblock.com', 'grr.la', 'dispostable.com', 'yopmail.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'mailnesia.com',
  'maildrop.cc', 'discard.email', 'mailcatch.com', 'tempail.com',
  'tempr.email', 'temp-mail.io', 'mohmal.com', 'burnermail.io',
  'getairmail.com', 'mailsac.com', 'inboxkitten.com', 'harakirimail.com',
  'getnada.com', 'tmail.ws', '10minutemail.com', '10minutemail.net',
  'minutemail.com', 'emailondeck.com', 'crazymailing.com',
  'jetable.org', 'spamgourmet.com', 'mytemp.email', 'tmpmail.net',
  'tmpmail.org', 'bupmail.com', 'mailtemp.org',
  // The domain from this specific spam attempt
  'immenseignite.info',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  // Heuristic: flag domains with very unusual TLDs commonly used by spam
  // (single-word .info domains with 12+ characters are almost always disposable)
  if (domain.endsWith('.info') && domain.split('.')[0].length >= 12) return true;

  return false;
}

// ── Gibberish detection ───────────────────────────────────
const VOWELS = new Set('aeiouAEIOUàáâãäåèéêëìíîïòóôõöùúûüýÿ');

// Common consonant pairs that appear in real names across languages
const COMMON_PAIRS = new Set([
  'th', 'sh', 'ch', 'ph', 'wh', 'ck', 'ng', 'nk', 'nd', 'nt', 'ns', 'nz',
  'st', 'sk', 'sc', 'sp', 'sm', 'sn', 'sl', 'sw', 'str', 'sch',
  'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'bl', 'cl', 'fl', 'gl', 'pl',
  'ld', 'lk', 'lt', 'lm', 'ln', 'ls', 'lv', 'lz',
  'rd', 'rk', 'rt', 'rm', 'rn', 'rs', 'rv', 'rz', 'rb', 'rg', 'rl', 'rp', 'rf',
  'mp', 'mb', 'mn', 'mk',
  'ft', 'gn', 'kn', 'wr', 'tw', 'dw', 'gh', 'ps', 'pn', 'pt',
  'tz', 'ts', 'zz', 'ff', 'll', 'ss', 'tt', 'nn', 'mm', 'rr', 'pp', 'bb', 'dd', 'gg', 'cc',
]);

/** Returns true if a consonant cluster of 3+ has no recognizable sub-pairs. */
function isUnpronounceable(cluster: string): boolean {
  if (cluster.length < 3) return false;
  const lower = cluster.toLowerCase();
  // Check if any adjacent pair in the cluster is a common consonant pair
  for (let i = 0; i < lower.length - 1; i++) {
    if (COMMON_PAIRS.has(lower.substring(i, i + 2))) return false;
  }
  return true; // No common pair found — likely gibberish
}

/** Returns true if the name looks like random keyboard mashing. */
export function isGibberishName(name: string): boolean {
  // Check each word separately
  const words = name.trim().split(/\s+/);
  for (const word of words) {
    const cleaned = word.replace(/[^a-zA-Z]/g, '');
    if (cleaned.length === 0) continue;
    if (cleaned.length < 2) continue; // single letter words are fine

    // Count vowel ratio — real names have ~25-60% vowels
    const vowelCount = [...cleaned].filter(c => VOWELS.has(c)).length;
    const vowelRatio = vowelCount / cleaned.length;
    if (vowelRatio < 0.1 && cleaned.length >= 5) return true;

    // Check for long consonant clusters (4+ consecutive = suspicious)
    const consonantClusters = cleaned.replace(/[aeiouAEIOU]/g, ' ').split(' ').filter(Boolean);
    const maxCluster = Math.max(0, ...consonantClusters.map(c => c.length));
    if (maxCluster >= 5) return true;

    // Check for unpronounceable 3+ consonant clusters
    for (const cluster of consonantClusters) {
      if (isUnpronounceable(cluster)) return true;
    }
  }

  return false;
}

// ── Turnstile CAPTCHA verification ────────────────────────
export async function verifyTurnstile(token: string, secretKey: string, ip?: string): Promise<boolean> {
  if (!token || !secretKey) return false;

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (ip) formData.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const data = await res.json<{ success: boolean }>();
  return data.success === true;
}

// ── Combined check ────────────────────────────────────────
export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export function checkForSpam(
  body: Record<string, string | File>,
  name: string,
  email: string,
): SpamCheckResult {
  if (isHoneypotFilled(body)) {
    return { isSpam: true, reason: 'honeypot' };
  }

  const formLoadedAt = body['_t'] as string | undefined;
  if (isTooFast(formLoadedAt)) {
    return { isSpam: true, reason: 'timing' };
  }

  if (isDisposableEmail(email)) {
    return { isSpam: true, reason: 'disposable_email' };
  }

  if (isGibberishName(name)) {
    return { isSpam: true, reason: 'gibberish_name' };
  }

  return { isSpam: false };
}
