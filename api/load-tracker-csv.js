const { requireSession } = require('./_auth');
const GITHUB_API_VERSION = '2022-11-28';

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function requireEnv(name) {
  const value = env(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function normalizeBase64(content) {
  return String(content || '').replace(/\n/g, '');
}

function decodeBase64Utf8(content) {
  return Buffer.from(normalizeBase64(content), 'base64').toString('utf8');
}


module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    if (!requireSession(req, res)) return;

    const owner = requireEnv('GITHUB_OWNER');
    const repo = requireEnv('GITHUB_REPO');
    const branch = env('GITHUB_BRANCH', 'main');
    const path = env('GITHUB_CSV_PATH', 'data/tracker.csv');
    const token = requireEnv('GITHUB_TOKEN');

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'ehok-dev-tracker'
      }
    });

    if (response.status === 404) {
      return res.status(200).json({ ok: true, csv: '', sha: null, missing: true });
    }

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: payload.message || 'GitHub API error' });
    }

    return res.status(200).json({
      ok: true,
      csv: decodeBase64Utf8(payload.content),
      sha: payload.sha,
      path: payload.path
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Server error' });
  }
};
