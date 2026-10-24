import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile, mkdir, stat, copyFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const built = process.argv.includes('--dist');
const root = built ? path.join(project, 'dist') : project;
const port = Number(process.env.PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const cleanRoutes = {
  '/about': 'pages/about.html',
  '/esc': 'pages/esc.html',
  '/tedx': 'pages/tedx.html',
  '/projects': 'pages/projects.html',
  '/join': 'pages/join.html',
  '/contact': 'pages/contact.html',
  '/studio': 'pages/studio.html',
};

function readBody(req, maxBytes = 60 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function buildSiteDataModule(content) {
  return `/**
 * Dữ liệu có cấu trúc của hệ thống website Skillcetera (Trang chủ + 6 Subpage + Content Studio).
 * Đồng bộ tự động từ public/data/content.json.
 */

export const SITE_META = ${JSON.stringify(content.siteMeta, null, 2)};

export const MISSIONS = ${JSON.stringify(content.missions, null, 2)};

export const ANNUAL_EVENTS = ${JSON.stringify(content.annualEvents, null, 2)};

export const TEDX_SEASONS = ${JSON.stringify(content.tedxSeasons, null, 2)};

export const OTHER_PROJECTS = ${JSON.stringify(content.otherProjects, null, 2)};

export const FULL_CONTENT = {
  siteMeta: SITE_META,
  missions: MISSIONS,
  annualEvents: ANNUAL_EVENTS,
  tedxSeasons: TEDX_SEASONS,
  otherProjects: OTHER_PROJECTS,
};
`;
}

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(urlObj.pathname).replace(/\/+$/, '') || '/';
    if (pathname.includes('\0')) throw new Error('Invalid path');

    // CMS API: GET /api/content
    if (pathname === '/api/content' && req.method === 'GET') {
      const contentPath = path.join(project, 'public/data/content.json');
      const manifestPath = path.join(project, 'docs/content/asset-manifest.json');
      const content = JSON.parse(await readFile(contentPath, 'utf8'));
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      sendJson(res, 200, { ok: true, content, manifest });
      return;
    }

    // CMS API: PUT /api/content
    if (pathname === '/api/content' && req.method === 'PUT') {
      const raw = await readBody(req);
      const body = JSON.parse(raw);
      const content = body.content || body;
      if (!content.siteMeta || !content.missions || !content.annualEvents || !content.tedxSeasons || !content.otherProjects) {
        sendJson(res, 400, { ok: false, error: 'Invalid content schema' });
        return;
      }
      const contentJson = JSON.stringify(content, null, 2);
      const moduleCode = buildSiteDataModule(content);

      await mkdir(path.join(project, 'public/data'), { recursive: true });
      await writeFile(path.join(project, 'public/data/content.json'), contentJson, 'utf8');
      await writeFile(path.join(project, 'src/content/site-data.js'), moduleCode, 'utf8');

      // Sync to dist/ if present
      try {
        await stat(path.join(project, 'dist'));
        await mkdir(path.join(project, 'dist/data'), { recursive: true });
        await mkdir(path.join(project, 'dist/src/content'), { recursive: true });
        await writeFile(path.join(project, 'dist/data/content.json'), contentJson, 'utf8');
        await writeFile(path.join(project, 'dist/src/content/site-data.js'), moduleCode, 'utf8');
      } catch {
        // dist not built yet
      }

      sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
      return;
    }

    // CMS API: POST /api/upload (High-Quality Image Upload + WebP Derivative)
    if (pathname === '/api/upload' && req.method === 'POST') {
      const raw = await readBody(req);
      const { filename, dataBase64, section = 'gallery', description = '' } = JSON.parse(raw);
      if (!filename || !dataBase64) {
        sendJson(res, 400, { ok: false, error: 'Missing filename or image data' });
        return;
      }

      const ext = path.extname(filename).toLowerCase() || '.png';
      if (!['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) {
        sendJson(res, 400, { ok: false, error: 'Unsupported image format' });
        return;
      }

      const baseSlug = path
        .basename(filename, ext)
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '') || `hq-asset-${Date.now()}`;
      const stamp = Date.now().toString(36);
      const slug = `${baseSlug}-${stamp}`;
      const origRel = `assets/originals/${slug}${ext}`;
      const webpRel = `assets/${slug}.webp`;

      const origFullPath = path.join(project, 'public', origRel);
      const webpFullPath = path.join(project, 'public', webpRel);
      await mkdir(path.dirname(origFullPath), { recursive: true });

      const cleanBase64 = dataBase64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      await writeFile(origFullPath, buffer);

      let meta = {
        width: 0,
        height: 0,
        originalBytes: buffer.length,
        webpBytes: buffer.length,
      };

      try {
        const { stdout } = await execFileAsync('python', [
          path.join(project, 'scripts/optimize-assets.py'),
          origFullPath,
          webpFullPath,
          '2400',
          '92',
        ]);
        meta = JSON.parse(stdout.trim());
      } catch {
        await copyFile(origFullPath, webpFullPath);
      }

      // Sync to dist/ if present
      try {
        await stat(path.join(project, 'dist'));
        const distOrig = path.join(project, 'dist', origRel);
        const distWebp = path.join(project, 'dist', webpRel);
        await mkdir(path.dirname(distOrig), { recursive: true });
        await copyFile(origFullPath, distOrig);
        await copyFile(webpFullPath, distWebp);
      } catch {
        // dist not built yet
      }

      // Record in asset-manifest.json
      const manifestPath = path.join(project, 'docs/content/asset-manifest.json');
      try {
        const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
        manifest.assets.unshift({
          path: `/public/${origRel}`,
          file: `public/${origRel}`,
          webpPath: `/${webpRel}`,
          originalUrl: `/${origRel}`,
          section,
          description: description || `Uploaded HQ asset (${filename})`,
          width: meta.width,
          height: meta.height,
          bytes: meta.originalBytes,
          webpBytes: meta.webpBytes,
          verified: `Uploaded via Skillcetera Content Studio on ${new Date().toISOString().slice(0, 10)}`,
        });
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      } catch {
        // ignore manifest write error
      }

      sendJson(res, 200, {
        ok: true,
        asset: {
          slug,
          webpUrl: `/${webpRel}`,
          originalUrl: `/${origRel}`,
          width: meta.width,
          height: meta.height,
          originalBytes: meta.originalBytes,
          webpBytes: meta.webpBytes,
          section,
          description,
        },
      });
      return;
    }

    let relative =
      pathname === '/'
        ? 'index.html'
        : cleanRoutes[pathname] || pathname.replace(/^\/+/, '');

    if (!built && /^(assets|fonts|vendor|data)\//.test(relative)) {
      relative = `public/${relative}`;
    }

    if (
      !/^(index\.html|petalyx\.html|pages\/[a-z0-9-]+\.html|src\/|public\/(assets|fonts|vendor|data)\/|assets\/|fonts\/|vendor\/|data\/|favicon\.svg)/.test(
        relative,
      )
    ) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
    if (!(await stat(file)).isFile()) throw new Error('Not a file');

    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () =>
  console.log(`Skillcetera preview & Content Studio\nLocal: http://localhost:${port}\nStudio: http://localhost:${port}/studio`),
);
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
