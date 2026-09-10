const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 40;
const hits = new Map();

function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function allow(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_HITS) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  return true;
}

export async function aiProxy(req, res) {
  if (!allow(clientIp(req))) {
    return res.status(429).json({ error: 'Too many AI requests. Please try again later.' });
  }

  const base = (process.env.AI_SERVICE_URL || '').replace(/\/$/, '');
  if (!base) {
    return res.status(503).json({ error: 'AI service is not configured.' });
  }

  const target = `${base}${req.originalUrl}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body ?? {}),
      signal: AbortSignal.timeout(90_000),
    });
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    res.send(text);
  } catch (err) {
    console.error('[ai-proxy]', err.message);
    res.status(503).json({ error: 'AI service is unavailable.' });
  }
}
