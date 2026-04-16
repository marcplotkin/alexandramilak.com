export type SiteSettings = {
  bg_color: string;
  accent_color: string;
  text_color: string;
  font_pairing: string;
  heading_font: string;
  body_font: string;
  tagline: string;
  banner_url: string;
  profile_photo_url: string;
};

export const DEFAULTS: SiteSettings = {
  bg_color: '#220D12',
  accent_color: '#C0392B',
  text_color: '#FFF8F0',
  font_pairing: 'classic',
  heading_font: 'Cormorant Garamond',
  body_font: 'DM Sans',
  tagline: 'Thoughts and curations of things I care about and think are nice.',
  banner_url: '/tomatoes.jpg',
  profile_photo_url: '/alexandra.jpg',
};

export type FontPairing = {
  label: string;
  heading: string;
  body: string;
  googleFontsUrl: string;
};

export const FONT_PAIRINGS: Record<string, FontPairing> = {
  classic: {
    label: 'Classic',
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap',
  },
  modern: {
    label: 'Modern',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap',
  },
  elegant: {
    label: 'Elegant',
    heading: "'Libre Baskerville', Georgia, serif",
    body: "'Lato', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@400;700&display=swap',
  },
  editorial: {
    label: 'Editorial',
    heading: "'Abril Fatface', Georgia, serif",
    body: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Poppins:wght@400;500;600&display=swap',
  },
  clean: {
    label: 'Clean',
    heading: "'Source Serif 4', Georgia, serif",
    body: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@400;500;600&display=swap',
  },
};

export async function getSiteSetting(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM site_settings WHERE key = ?').bind(key).first();
  return row ? (row.value as string) : null;
}

export async function setSiteSetting(db: D1Database, key: string, value: string): Promise<void> {
  await db
    .prepare(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    )
    .bind(key, value, value)
    .run();
}

export async function getAllSiteSettings(db: D1Database): Promise<SiteSettings> {
  const rows = await db.prepare('SELECT key, value FROM site_settings').all();
  const map: Record<string, string> = {};
  for (const row of (rows.results || [])) {
    map[row.key as string] = row.value as string;
  }
  return {
    bg_color: map.bg_color || DEFAULTS.bg_color,
    accent_color: map.accent_color || DEFAULTS.accent_color,
    text_color: map.text_color || DEFAULTS.text_color,
    font_pairing: map.font_pairing || DEFAULTS.font_pairing,
    heading_font: map.heading_font || DEFAULTS.heading_font,
    body_font: map.body_font || DEFAULTS.body_font,
    tagline: map.tagline || DEFAULTS.tagline,
    banner_url: map.banner_url || DEFAULTS.banner_url,
    profile_photo_url: map.profile_photo_url || DEFAULTS.profile_photo_url,
  };
}

export function buildGoogleFontsUrl(headingFont: string, bodyFont: string): string {
  const families: string[] = [];
  if (headingFont) {
    families.push(`family=${encodeURIComponent(headingFont)}:ital,wght@0,400;0,500;0,600;0,700;1,400`);
  }
  if (bodyFont && bodyFont !== headingFont) {
    families.push(`family=${encodeURIComponent(bodyFont)}:wght@400;500;600`);
  }
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

export const POPULAR_GOOGLE_FONTS = [
  'Abril Fatface', 'Alegreya', 'Alegreya Sans', 'Archivo', 'Archivo Narrow',
  'Barlow', 'Bitter', 'Cabin', 'Cardo', 'Cinzel', 'Cormorant', 'Cormorant Garamond',
  'Crimson Pro', 'Crimson Text', 'DM Sans', 'DM Serif Display', 'DM Serif Text',
  'EB Garamond', 'Eczar', 'Fira Sans', 'Fraunces', 'Gelasio', 'Gentium Plus',
  'IBM Plex Sans', 'IBM Plex Serif', 'Inter', 'Josefin Sans', 'Josefin Slab',
  'Karla', 'Lato', 'Libre Baskerville', 'Libre Franklin', 'Lora',
  'Manrope', 'Merriweather', 'Montserrat', 'Mulish', 'Neuton', 'Noto Sans',
  'Noto Serif', 'Nunito', 'Nunito Sans', 'Old Standard TT', 'Open Sans',
  'Oswald', 'Outfit', 'Playfair Display', 'Poppins', 'PT Sans', 'PT Serif',
  'Raleway', 'Roboto', 'Roboto Condensed', 'Roboto Slab', 'Rubik',
  'Source Sans 3', 'Source Serif 4', 'Space Grotesk', 'Space Mono', 'Spectral',
  'Work Sans', 'Yeseva One', 'Zilla Slab',
  'Antic Didone', 'Bodoni Moda', 'Bona Nova', 'Brygada 1918', 'Canela',
  'Chivo', 'Corben', 'Domine', 'Epilogue', 'Figtree', 'Gilda Display',
  'Hanken Grotesk', 'Hepta Slab', 'Instrument Serif', 'Italiana',
  'Jost', 'Literata', 'Lusitana', 'Marcellus', 'Maven Pro',
  'Nanum Myeongjo', 'Newsreader', 'Philosopher', 'Plus Jakarta Sans',
  'Pridi', 'Quattrocento', 'Questrial', 'Sora', 'Suranna', 'Tenor Sans',
  'Unna', 'Vollkorn', 'Yaldevi',
];

export function lightenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r * factor));
  const lg = Math.min(255, Math.round(g * factor));
  const lb = Math.min(255, Math.round(b * factor));
  return '#' + [lr, lg, lb].map((c) => c.toString(16).padStart(2, '0')).join('');
}
