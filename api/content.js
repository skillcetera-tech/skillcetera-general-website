export default async function handler(req, res) {
  // CORS headers & Cache-Control
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'skillcetera-tech/skillcetera-general-website';
  const branch = process.env.GITHUB_BRANCH || 'main';

  // GET: Return current content.json (Fetch directly from GitHub if token present to prevent stale read)
  if (req.method === 'GET') {
    if (token) {
      try {
        const filePath = 'public/data/content.json';
        const fileUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}&_t=${Date.now()}`;
        const headers = {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token.trim()}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Skillcetera-Studio-Sync',
        };
        const getFileRes = await fetch(fileUrl, { headers, cache: 'no-store' });
        if (getFileRes.ok) {
          const fileData = await getFileRes.json();
          if (fileData.content) {
            const decoded = Buffer.from(fileData.content, 'base64').toString('utf8');
            return res.status(200).json({
              ok: true,
              source: 'github-live',
              sha: fileData.sha,
              content: JSON.parse(decoded)
            });
          }
        }
      } catch (ghErr) {
        console.warn('GitHub direct fetch failed, falling back to local file:', ghErr.message);
      }
    }

    // Fallback: Read local file
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const filePath = path.join(process.cwd(), 'public/data/content.json');
      const data = await fs.readFile(filePath, 'utf8');
      return res.status(200).json({ ok: true, source: 'local-fallback', content: JSON.parse(data) });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST or PUT: Commit updated content directly to GitHub
  if (req.method === 'POST' || req.method === 'PUT') {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'skillcetera-tech/skillcetera-general-website';
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token) {
      return res.status(503).json({
        ok: false,
        error: 'GITHUB_TOKEN_NOT_CONFIGURED',
        message: 'GITHUB_TOKEN chưa được cấu hình trong Vercel Environment Variables. Hãy thêm GITHUB_TOKEN để tự động commit lên GitHub!',
      });
    }

    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const content = body.content || body;

      if (!content || !content.siteMeta) {
        return res.status(400).json({ ok: false, error: 'Invalid content payload: missing siteMeta' });
      }

      const filePath = 'public/data/content.json';
      const fileUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;

      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Skillcetera-Studio-Sync',
      };

      // 1. Get current file sha from GitHub
      let currentSha = null;
      const getFileRes = await fetch(fileUrl, { headers });
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        currentSha = fileData.sha;
      } else if (getFileRes.status !== 404) {
        const errText = await getFileRes.text();
        return res.status(getFileRes.status).json({
          ok: false,
          error: `GitHub API error (${getFileRes.status}): ${errText}`,
        });
      }

      // 2. Prepare formatted JSON string & Base64
      const newContentStr = JSON.stringify(content, null, 2) + '\n';
      const contentBase64 = Buffer.from(newContentStr, 'utf8').toString('base64');

      // 3. Put commit to GitHub
      const commitRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'chore(cms): update content via Skillcetera Studio',
          content: contentBase64,
          sha: currentSha || undefined,
          branch: branch,
        }),
      });

      if (!commitRes.ok) {
        const errText = await commitRes.text();
        return res.status(commitRes.status).json({
          ok: false,
          error: `GitHub Commit Failed (${commitRes.status}): ${errText}`,
        });
      }

      const commitData = await commitRes.json();
      return res.status(200).json({
        ok: true,
        syncedWithGitHub: true,
        commitSha: commitData?.commit?.sha,
        message: 'Đã tạo commit thành công lên GitHub! Vercel đang tự động build và deploy...',
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: `Internal Server Error: ${err.message}`,
      });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}

