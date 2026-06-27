const { requireSession } = require('./_auth');
const GITHUB_API_VERSION = '2022-11-28';
const MAX_CSV_BYTES = 1024 * 1024 * 2; // 2 MB

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function requireEnv(name) {
  const value = env(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}


function githubContentUrl(owner, repo, path, branch) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`;
}

async function getCurrentFile({ owner, repo, path, branch, token }) {
  const response = await fetch(githubContentUrl(owner, repo, path, branch), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      'User-Agent': 'ehok-dev-tracker'
    }
  });

  if (response.status === 404) return { sha: null };
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Could not read current CSV from GitHub');
  return { sha: payload.sha };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    if (!requireSession(req, res)) return;

    const csv = typeof req.body?.csv === 'string' ? req.body.csv : '';
    if (!csv.trim()) return res.status(400).json({ ok: false, error: 'CSV content is empty' });
    if (Buffer.byteLength(csv, 'utf8') > MAX_CSV_BYTES) {
      return res.status(413).json({ ok: false, error: 'CSV content is too large' });
    }

    const owner = requireEnv('GITHUB_OWNER');
    const repo = requireEnv('GITHUB_REPO');
    const branch = env('GITHUB_BRANCH', 'main');
    const path = env('GITHUB_CSV_PATH', 'data/tracker.csv');
    const token = requireEnv('GITHUB_TOKEN');
    const message = req.body?.message || `Update eHÖK dev tracker CSV - ${new Date().toISOString()}`;

    const current = await getCurrentFile({ owner, repo, path, branch, token });
    const body = {
      message,
      content: Buffer.from(csv, 'utf8').toString('base64'),
      branch
    };
    if (current.sha) body.sha = current.sha;

    const saveUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`;
    const response = await fetch(saveUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'ehok-dev-tracker',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: payload.message || 'GitHub save failed' });
    }

    return res.status(200).json({
      ok: true,
      commit: payload.commit?.sha || null,
      path: payload.content?.path || path,
      htmlUrl: payload.content?.html_url || null
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Server error' });
  }
};
