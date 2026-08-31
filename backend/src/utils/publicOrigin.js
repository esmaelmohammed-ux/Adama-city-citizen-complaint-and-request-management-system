/** Public site URL used for CORS and password-reset links. Never trust the request Origin. */
export function publicOrigin() {
  const raw =
    process.env.CLIENT_ORIGIN ||
    process.env.RENDER_EXTERNAL_URL ||
    'http://localhost:5173';
  return raw.replace(/\/$/, '');
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === publicOrigin()) return true;
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
