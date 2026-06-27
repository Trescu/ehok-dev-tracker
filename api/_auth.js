const crypto = require('crypto');

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function getSecret() {
  return env('AUTH_TOKEN_SECRET') || env('ADMIN_KEY') || '';
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64url(input) {
  const normalized = String(input || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function timingSafeEqualString(a, b) {
  const aBuf = Buffer.from(String(a || ''));
  const bBuf = Buffer.from(String(b || ''));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function sign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createSessionToken() {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_KEY nincs beállítva a Vercel Environment Variables alatt.');

  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = Number(env('AUTH_SESSION_TTL_SECONDS', String(60 * 60 * 24 * 7))); // 7 nap
  const payload = {
    sub: 'ehok-dev-tracker-admin',
    iat: now,
    exp: now + ttlSeconds,
    nonce: crypto.randomBytes(12).toString('hex')
  };

  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  if (match) return match[1].trim();
  return String(req.headers['x-session-token'] || '').trim();
}

function verifySessionToken(token) {
  const secret = getSecret();
  if (!secret || !token) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = sign(encodedPayload, secret);
  if (!timingSafeEqualString(providedSignature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(fromBase64url(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return false;
    if (payload.sub !== 'ehok-dev-tracker-admin') return false;
    return true;
  } catch {
    return false;
  }
}

function requireSession(req, res) {
  const token = getBearerToken(req);
  if (!verifySessionToken(token)) {
    res.status(401).json({ ok: false, error: 'Unauthorized vagy lejárt munkamenet.' });
    return false;
  }
  return true;
}

function verifyPassword(password) {
  const expected = env('ADMIN_KEY');
  if (!expected) throw new Error('ADMIN_KEY nincs beállítva a Vercel Environment Variables alatt.');
  return timingSafeEqualString(String(password || ''), expected);
}

module.exports = {
  env,
  createSessionToken,
  requireSession,
  verifyPassword,
  verifySessionToken,
  getBearerToken
};
