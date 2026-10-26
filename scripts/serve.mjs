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
  '.pdf': 'application/pdf',
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

function readRawBuffer(req, maxBytes = 60 * 1024 * 1024) {
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
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function readBody(req, maxBytes = 60 * 1024 * 1024) {
  return readRawBuffer(req, maxBytes).then((buf) => buf.toString('utf8'));
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

export const ESC_SEASONS = ${JSON.stringify(content.escSeasons || {}, null, 2)};

export const OTHER_PROJECTS = ${JSON.stringify(content.otherProjects, null, 2)};

export const HQ_GALLERY = ${JSON.stringify(content.hqGallery || [], null, 2)};

export const FULL_CONTENT = {
  siteMeta: SITE_META,
  missions: MISSIONS,
  annualEvents: ANNUAL_EVENTS,
  tedxSeasons: TEDX_SEASONS,
  escSeasons: ESC_SEASONS,
  otherProjects: OTHER_PROJECTS,
  hqGallery: HQ_GALLERY,
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
      let manifest = { assets: [] };
      try {
        manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      } catch {}

      content.hqGallery = Array.isArray(content.hqGallery) ? content.hqGallery : [];
      if (Array.isArray(manifest.assets)) {
        manifest.assets.forEach((asset) => {
          if (asset.webpPath && !content.hqGallery.some((item) => item.webpUrl === asset.webpPath || item.originalUrl === asset.originalUrl)) {
            content.hqGallery.push({
              id: `hq-${asset.slug || path.basename(asset.webpPath, '.webp')}`,
              title: asset.description || asset.file || 'Ảnh tư liệu chất lượng cao',
              alt: asset.description || 'Ảnh tư liệu Skillcetera',
              caption: `${asset.width || ''} × ${asset.height || ''} px · Đã lưu trên máy chủ`,
              webpUrl: asset.webpPath,
              originalUrl: asset.originalUrl || asset.path || asset.webpPath,
              dimensions: asset.width && asset.height ? `${asset.width} × ${asset.height} px` : 'Full-Res'
            });
          }
        });
      }

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

      // Sync hero image in index.html if modified
      if (content.siteMeta?.heroImage) {
        try {
          const indexHtmlPath = path.join(project, 'index.html');
          let html = await readFile(indexHtmlPath, 'utf8');
          const webpUrl = content.siteMeta.heroImage;
          const origUrl = content.siteMeta.heroOriginalImage || webpUrl;
          html = html.replace(
            /(<div class="hero-media hero-visual">\s*<picture>\s*<source srcset=")[^"]+(" type="image\/webp">\s*<img src=")[^"]+(")/,
            `$1${webpUrl}$2${origUrl}$3`
          );
          await writeFile(indexHtmlPath, html, 'utf8');
        } catch (err) {
          console.error('Error updating index.html hero image:', err);
        }
      }

      // Sync to dist/ if present
      try {
        await stat(path.join(project, 'dist'));
        await mkdir(path.join(project, 'dist/data'), { recursive: true });
        await mkdir(path.join(project, 'dist/src/content'), { recursive: true });
        await writeFile(path.join(project, 'dist/data/content.json'), contentJson, 'utf8');
        await writeFile(path.join(project, 'dist/src/content/site-data.js'), moduleCode, 'utf8');
        if (content.siteMeta?.heroImage) {
          try {
            const distIndex = path.join(project, 'dist/index.html');
            const rootIndex = await readFile(path.join(project, 'index.html'), 'utf8');
            await writeFile(distIndex, rootIndex, 'utf8');
          } catch {}
        }
      } catch {
        // dist not built yet
      }

      sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
      return;
    }

    // CMS API: POST /api/upload (High-Quality Image Upload + WebP Derivative)
    if (pathname === '/api/upload' && req.method === 'POST') {
      const rawBuffer = await readRawBuffer(req);
      if (!rawBuffer || rawBuffer.length === 0) {
        sendJson(res, 400, { ok: false, error: 'Empty upload body' });
        return;
      }

      let filename = '';
      let buffer = null;
      let section = 'gallery';
      let description = '';

      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(rawBuffer.toString('utf8'));
          filename = parsed.filename || 'upload.png';
          section = parsed.section || 'gallery';
          description = parsed.description || '';
          if (parsed.dataBase64) {
            const cleanBase64 = parsed.dataBase64.replace(/^data:[^;]+;base64,/, '');
            buffer = Buffer.from(cleanBase64, 'base64');
          }
        } catch {
          sendJson(res, 400, { ok: false, error: 'Malformed JSON payload' });
          return;
        }
      } else {
        buffer = rawBuffer;
        const rawFileNameHeader = req.headers['x-file-name'] || '';
        try {
          filename = decodeURIComponent(rawFileNameHeader);
        } catch {
          filename = rawFileNameHeader;
        }
        if (!filename) {
          filename = urlObj.searchParams.get('filename') || 'upload.png';
        }
        section = urlObj.searchParams.get('section') || 'gallery';
        description = urlObj.searchParams.get('description') || '';
      }

      if (!buffer || buffer.length === 0) {
        sendJson(res, 400, { ok: false, error: 'Missing image data' });
        return;
      }

      const ext = path.extname(filename).toLowerCase() || '.png';
      if (!['.png', '.jpg', '.jpeg', '.webp', '.avif', '.pdf'].includes(ext)) {
        sendJson(res, 400, { ok: false, error: 'Unsupported format. Supported: PNG, JPG, JPEG, WebP, AVIF, PDF' });
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
      const webpRel = ext === '.pdf' ? `assets/originals/${slug}${ext}` : `assets/${slug}.webp`;

      const origFullPath = path.join(project, 'public', origRel);
      const webpFullPath = path.join(project, 'public', webpRel);
      await mkdir(path.dirname(origFullPath), { recursive: true });
      await writeFile(origFullPath, buffer);

      let meta = {
        width: 0,
        height: 0,
        originalBytes: buffer.length,
        webpBytes: buffer.length,
      };

      if (ext === '.pdf') {
        meta = {
          width: 1200,
          height: 1600,
          originalBytes: buffer.length,
          webpBytes: buffer.length,
        };
      } else {
        try {
          const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
          const { stdout } = await execFileAsync(pythonBin, [
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

      // Auto-persist new asset to public/data/content.json's hqGallery
      try {
        const contentPath = path.join(project, 'public/data/content.json');
        const content = JSON.parse(await readFile(contentPath, 'utf8'));
        content.hqGallery = Array.isArray(content.hqGallery) ? content.hqGallery : [];
        content.hqGallery.unshift({
          id: `hq-${slug}`,
          title: description || `Ảnh tư liệu tải lên (${filename})`,
          alt: description || 'Ảnh tư liệu Skillcetera',
          caption: `${meta.width} × ${meta.height} px · Đã lưu trên máy chủ`,
          webpUrl: `/${webpRel}`,
          originalUrl: `/${origRel}`,
          dimensions: meta.width && meta.height ? `${meta.width} × ${meta.height} px` : 'Full-Res'
        });
        await writeFile(contentPath, JSON.stringify(content, null, 2), 'utf8');

        // Also update src/content/site-data.js
        const moduleCode = buildSiteDataModule(content);
        await writeFile(path.join(project, 'src/content/site-data.js'), moduleCode, 'utf8');
      } catch (err) {
        console.error('Error auto-syncing hqGallery:', err);
      }

      const assetPayload = {
        slug,
        webpUrl: `/${webpRel}`,
        originalUrl: `/${origRel}`,
        width: meta.width,
        height: meta.height,
        originalBytes: meta.originalBytes,
        webpBytes: meta.webpBytes,
        section,
        description,
      };

      sendJson(res, 200, {
        ok: true,
        slug,
        webpUrl: `/${webpRel}`,
        originalUrl: `/${origRel}`,
        width: meta.width,
        height: meta.height,
        originalBytes: meta.originalBytes,
        webpBytes: meta.webpBytes,
        asset: assetPayload,
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

const host = process.env.HOST || '0.0.0.0';

function listenWithFallback(serverInstance, currentPort, attemptsLeft = 10) {
  const onError = (err) => {
    serverInstance.removeListener('listening', onListening);
    if (err.code === 'EADDRINUSE') {
      if (process.env.PORT) {
        console.error(`\n[Lỗi] Cổng ${currentPort} đang được sử dụng.`);
        console.error(`Gợi ý: Chỉ định cổng khác bằng PORT=${currentPort + 1} npm run dev\n`);
        process.exit(1);
      } else if (attemptsLeft > 0) {
        console.warn(`[Lưu ý] Cổng ${currentPort} đang bận, tự động thử cổng ${currentPort + 1}...`);
        serverInstance.close(() => {
          listenWithFallback(serverInstance, currentPort + 1, attemptsLeft - 1);
        });
      } else {
        console.error(`\n[Lỗi] Đã thử nhiều cổng từ ${port} đến ${currentPort} nhưng tất cả đều đang bận.\n`);
        process.exit(1);
      }
    } else {
      console.error(`\n[Lỗi máy chủ]`, err);
      process.exit(1);
    }
  };

  const onListening = () => {
    serverInstance.removeListener('error', onError);
    const localHost = host === '0.0.0.0' ? 'localhost' : host;
    console.log(
      `Skillcetera preview & Content Studio\nLocal:  http://${localHost}:${currentPort}\nStudio: http://${localHost}:${currentPort}/studio`
    );
  };

  serverInstance.once('error', onError);
  serverInstance.once('listening', onListening);
  serverInstance.listen(currentPort, host);
}

listenWithFallback(server, port);

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
