import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { blogRoutes } from './routes/blog';
import { adminRoutes } from './routes/admin';
import { apiRoutes } from './routes/api';
import { homePage } from './pages/home';
import { getSession } from './lib/auth';
import { sendNewPostEmail } from './lib/email';
import { getAllSiteSettings, DEFAULTS, FONT_PAIRINGS, buildGoogleFontsUrl } from './lib/settings';
export type { SiteSettings } from './lib/settings';

export type Env = {
  Bindings: {
    DB: D1Database;
    MEDIA_BUCKET: R2Bucket;
    AUTH_SECRET: string;
    RESEND_API_KEY: string;
    ADMIN_EMAIL: string;
    SITE_URL: string;
    SITE_NAME: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GMAIL_REFRESH_TOKEN: string;
    TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET_KEY: string;
  };
};

export type Member = {
  id: number;
  email: string;
  name: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  removed_at: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: number | null;
  email_notifications: number;
  unsubscribe_token: string | null;
};

export type Comment = {
  id: number;
  post_id: number;
  member_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  member_name?: string;
  member_avatar_url?: string | null;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_caption: string | null;
  status: string;
  emailed: number;
  email_subscribers: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  scheduled_at: string | null;
};

// In-memory cache for site settings (short TTL to reduce D1 queries)
let settingsCache: { data: any; expiry: number } | null = null;
const SETTINGS_TTL = 60_000; // 60 seconds

async function getCachedSettings(db: D1Database): Promise<import('./lib/settings').SiteSettings> {
  if (settingsCache && Date.now() < settingsCache.expiry) {
    return settingsCache.data;
  }
  const settings = await getAllSiteSettings(db);
  settingsCache = { data: settings, expiry: Date.now() + SETTINGS_TTL };
  return settings;
}

const app = new Hono<Env>();

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err.message, err.stack);
  return c.text('An unexpected error occurred. Please try again later.', 500);
});

// Security headers and block search engine crawling
app.use('*', async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.instagram.com https://www.tiktok.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://cloudflareinsights.com https://fonts.googleapis.com https://challenges.cloudflare.com; frame-src https://open.spotify.com https://www.youtube.com https://player.vimeo.com https://w.soundcloud.com https://www.instagram.com https://www.tiktok.com https://challenges.cloudflare.com; frame-ancestors 'none'");
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Vary', 'Cookie');
});

// Inject dynamic theme from site_settings into all HTML responses
app.use('*', async (c, next) => {
  await next();
  const ct = c.res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return;

  const settings = await getCachedSettings(c.env.DB);
  const bgChanged = settings.bg_color !== DEFAULTS.bg_color;
  const accentChanged = settings.accent_color !== DEFAULTS.accent_color;
  const textChanged = settings.text_color !== DEFAULTS.text_color;
  const hasCustomFonts = settings.heading_font !== DEFAULTS.heading_font || settings.body_font !== DEFAULTS.body_font;
  const fontChanged = hasCustomFonts || settings.font_pairing !== DEFAULTS.font_pairing;

  if (!bgChanged && !accentChanged && !textChanged && !fontChanged) return;

  let css = '';
  let extraHead = '';

  if (bgChanged) {
    css += `body{background-color:${settings.bg_color}!important;background-image:none!important;}`;
  }
  if (accentChanged) {
    css += `:root{--accent-color:${settings.accent_color}!important;--tomato-red:${settings.accent_color}!important;}`;
  }
  if (textChanged) {
    css += `:root{--cream:${settings.text_color}!important;--warm-white:${settings.text_color}!important;}`;
    css += `body{color:${settings.text_color}!important;}`;
  }
  if (fontChanged) {
    const preconnect = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
    if (hasCustomFonts) {
      // Use individual font selections
      const hFont = settings.heading_font;
      const bFont = settings.body_font;
      extraHead += `${preconnect}<link href="${buildGoogleFontsUrl(hFont, bFont)}" rel="stylesheet">`;
      css += `body{font-family:'${bFont}', -apple-system, BlinkMacSystemFont, sans-serif!important;}`;
      css += `h1,h2,h3,h4,.nav-brand,.hero-title,.post-title,.post-card-title,.title,.brand,.comments-title,.stat-number,.preview-title{font-family:'${hFont}', Georgia, serif!important;}`;
    } else {
      // Legacy font pairing fallback
      const pairing = FONT_PAIRINGS[settings.font_pairing];
      if (pairing) {
        extraHead += `${preconnect}<link href="${pairing.googleFontsUrl}" rel="stylesheet">`;
        css += `body{font-family:${pairing.body}!important;}`;
        css += `h1,h2,h3,h4,.nav-brand,.hero-title,.post-title,.post-card-title,.title,.brand,.comments-title,.stat-number,.preview-title{font-family:${pairing.heading}!important;}`;
      }
    }
  }

  const overrideStyle = `${extraHead}<style id="site-theme">${css}</style>`;
  const html = await c.res.text();
  const newHtml = html.replace('</head>', overrideStyle + '</head>');
  c.res = new Response(newHtml, {
    status: c.res.status,
    headers: c.res.headers,
  });
});

// Public homepage
app.get('/', async (c) => {
  const session = await getSession(c);
  if (session) {
    return c.redirect('/feed');
  }
  // If referral code in URL, redirect to request page with it
  const ref = c.req.query('ref');
  if (ref) {
    return c.redirect(`/auth/request?ref=${encodeURIComponent(ref)}`);
  }
  const settings = await getCachedSettings(c.env.DB);
  const response = c.html(homePage(settings));
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  return response;
});

// Serve media from R2
app.get('/media/*', async (c) => {
  const key = c.req.path.replace(/^\//, '');
  const object = await c.env.MEDIA_BUCKET.get(key);

  if (!object) {
    return c.text('Not found', 404);
  }

  const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  // Force download for non-image types and SVGs to prevent XSS
  if (!contentType.startsWith('image/') || contentType === 'image/svg+xml') {
    headers.set('Content-Disposition', 'attachment');
  }

  return new Response(object.body, { headers });
});

// Mount routes
app.route('/auth', authRoutes);
app.route('/feed', blogRoutes);
app.route('/admin', adminRoutes);
app.route('/api', apiRoutes);

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env['Bindings'], ctx: ExecutionContext) {
    // Publish any posts whose scheduled_at has passed
    const due = await env.DB.prepare(
      "SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_at <= datetime('now')"
    ).all();

    if (!due.results || due.results.length === 0) return;

    for (const row of due.results) {
      const post = row as unknown as Post;

      await env.DB.prepare(
        "UPDATE posts SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
      )
        .bind(post.id)
        .run();

      // Email subscribers if requested
      if (post.email_subscribers && !post.emailed) {
        const members = await env.DB.prepare(
          "SELECT * FROM members WHERE status = 'active' AND email_notifications = 1"
        ).all();

        if (members.results && members.results.length > 0) {
          // Re-fetch post with updated status for email
          const updated = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
            .bind(post.id)
            .first();

          if (updated) {
            await sendNewPostEmail(
              env,
              updated as unknown as Post,
              members.results as unknown as Member[],
              env.SITE_URL
            );

            await env.DB.prepare('UPDATE posts SET emailed = 1 WHERE id = ?')
              .bind(post.id)
              .run();
          }
        }
      }
    }

    // Clean up expired sessions
    await env.DB.prepare(
      "DELETE FROM sessions WHERE expires_at < datetime('now')"
    ).run();

    // Clean up used/expired magic links older than 1 day
    await env.DB.prepare(
      "DELETE FROM magic_links WHERE (used = 1 OR expires_at < datetime('now')) AND created_at < datetime('now', '-1 day')"
    ).run();

    // Clean up used approval tokens older than 7 days
    await env.DB.prepare(
      "DELETE FROM approval_tokens WHERE used = 1 AND created_at < datetime('now', '-7 days')"
    ).run();
  },
};
