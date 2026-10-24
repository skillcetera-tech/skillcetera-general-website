import { mkdir, copyFile, cp, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
for (const file of ['public/vendor/gsap.min.js', 'public/vendor/ScrollTrigger.min.js', 'public/fonts/fonts.css', 'public/assets/discussion-forum.png', 'public/assets/esc.png', 'public/assets/tedx.jpg']) {
  await stat(path.join(root, file));
}
await mkdir(dist, { recursive: true });
await copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await cp(path.join(root, 'pages'), path.join(dist, 'pages'), { recursive: true });
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
console.log('Static website built in dist/');
