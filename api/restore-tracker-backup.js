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

function githubContentUrl(owner, repo, path, branch) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`;
}

function decodeBase64Utf8(content) {
  return Buffer.from(String(content || '').replace(/\n/g, ''), 'base64').toString('utf8');
}

async function readFile({ owner, repo, path, branch, token }) {
  const response = await fetch(githubContentUrl(owner, repo, path, branch), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      'User-Agent': 'ehok-dev-tracker'
    }
  });
  if (response.status === 404) return { missing: true, sha: null, content: '' };
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || `Could not read ${path} from GitHub`);
  return { missing: false, sha: payload.sha, content: decodeBase64Utf8(payload.content) };
}

async function writeFile({ owner, repo, path, branch, token, content, message, sha }) {
  const body = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch
  };
  if (sha) body.sha = sha;

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
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
  if (!response.ok) throw new Error(payload.message || `GitHub save failed for ${path}`);
  return payload;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    if (!requireSession(req, res)) return;

    const owner = requireEnv('GITHUB_OWNER');
    const repo = requireEnv('GITHUB_REPO');
    const branch = env('GITHUB_BRANCH', 'main');
    const path = env('GITHUB_CSV_PATH', 'data/tracker.csv');
    const backupPath = env('GITHUB_BACKUP_CSV_PATH', 'data/tracker.backup.csv');
    const token = requireEnv('GITHUB_TOKEN');

    const backup = await readFile({ owner, repo, path: backupPath, branch, token });
    if (backup.missing || !backup.content.trim()) {
      return res.status(404).json({ ok: false, missing: true, error: 'No temporary backup CSV found' });
    }

    const current = await readFile({ owner, repo, path, branch, token });
    const payload = await writeFile({
      owner,
      repo,
      path,
      branch,
      token,
      content: backup.content,
      sha: current.sha,
      message: `Restore tracker CSV from temporary backup - ${new Date().toISOString()}`
    });

    return res.status(200).json({
      ok: true,
      csv: backup.content,
      commit: payload.commit?.sha || null,
      path: payload.content?.path || path
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Server error' });
  }
};
