/** Public site URL used for CORS and password-reset links. Never trust the request Origin. */
export function publicOrigin() {
  const raw =
    process.env.CLIENT_ORIGIN ||
    process.env.RENDER_EXTERNAL_URL ||
    'http://localhost:5173';
  return raw.replace(/\/$/, '');
}

function extraOrigins() {
  const list = new Set([publicOrigin()]);
  const extra = process.env.CLIENT_ORIGINS || '';
  for (const item of extra.split(',')) {
    const trimmed = item.trim().replace(/\/$/, '');
    if (trimmed) list.add(trimmed);
  }
  if (process.env.VERCEL_URL) list.add(`https://${process.env.VERCEL_URL}`);
  return list;
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (extraOrigins().has(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NODE_ENV !== 'production';
    }
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }
  return false;
}
