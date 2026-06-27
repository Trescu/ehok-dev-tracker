const { createSessionToken, requireSession, verifyPassword, env } = require('./_auth');

module.exports = async function handler(req, res) {
  if (!env('ADMIN_KEY')) {
    return res.status(500).json({ ok: false, error: 'ADMIN_KEY nincs beállítva a Vercel Environment Variables alatt.' });
  }

  if (req.method === 'POST') {
    const password = req.body?.password || '';
    try {
      if (!verifyPassword(password)) {
        return res.status(401).json({ ok: false, error: 'Hibás admin jelszó.' });
      }
      return res.status(200).json({ ok: true, token: createSessionToken() });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message || 'Server error' });
    }
  }

  if (req.method === 'GET') {
    if (!requireSession(req, res)) return;
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};
