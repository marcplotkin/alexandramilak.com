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

export function lightenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r * factor));
  const lg = Math.min(255, Math.round(g * factor));
  const lb = Math.min(255, Math.round(b * factor));
  return '#' + [lr, lg, lb].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export const DEFAULT_BG_COLOR = '#220D12';
