import { mkdir, copyFile, cp, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

for (const file of ['public/vendor/gsap.min.js', 'public/vendor/ScrollTrigger.min.js', 'public/fonts/fonts.css', 'public/assets/discussion-forum.png', 'public/assets/esc.png', 'public/assets/tedx.jpg']) {
  await stat(path.join(root, file));
}

// Synchronize src/content/site-data.js from public/data/content.json
try {
  const contentJsonPath = path.join(root, 'public/data/content.json');
  const contentRaw = await readFile(contentJsonPath, 'utf8');
  const content = JSON.parse(contentRaw);

  const siteDataModule = `/**
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
  await writeFile(path.join(root, 'src/content/site-data.js'), siteDataModule, 'utf8');
} catch (e) {
  console.warn('Could not sync site-data.js during build:', e.message);
}

await mkdir(dist, { recursive: true });
await copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await cp(path.join(root, 'pages'), path.join(dist, 'pages'), { recursive: true });
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });

console.log('Static website built in dist/');
