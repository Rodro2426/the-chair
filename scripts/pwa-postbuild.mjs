// Runs after `expo export --platform web`. Turns the export into an installable
// web app for GitHub Pages:
//  1. Adds the manifest + iOS "web app" meta tags so a home-screen icon opens
//     full-screen (standalone) and in-app navigation stays inside the app.
//  2. Writes a real index.html for every route, so reloading or launching on any
//     page gets a 200 response instead of GitHub's 404 fallback (iOS may punt
//     404 responses out to Safari).
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
const base = '/the-chair';
const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const head = `
<link rel="manifest" href="${base}/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="The Chair">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="${base}/apple-touch-icon.png">
`;
// One solid colour behind everything — including the iPhone home-indicator strip and
// overscroll areas, which otherwise show the page's default white.
const BG = '#2B2019';
const solid = `<style id="the-chair-solid">html,body{background-color:${BG};}html{height:100%;}body{min-height:100%;min-height:100dvh;}#root{background-color:${BG};}</style>`;
if (!html.includes('rel="manifest"')) html = html.replace('</head>', `${head}${solid}\n</head>`);
html = html.replace(/<meta name="theme-color" content="[^"]*">/, `<meta name="theme-color" content="${BG}">`);
// Full-bleed under the notch / home indicator, and no pinch-zoom jumps on inputs.
html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />'
);
fs.writeFileSync(indexPath, html);

// Every static route URL (route groups like (family) don't appear in URLs).
const routes = [
  'welcome', 'sign-in', 'sign-up',
  'home', 'history', 'link', 'photo', 'settings', 'text', 'chairs',
  'chair', 'chair/home', 'chair/pair', 'chair/setup',
];
for (const r of routes) {
  const dir = path.join(dist, r);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
// Dynamic routes (e.g. /chairs/<id>) still fall back to this.
fs.writeFileSync(path.join(dist, '404.html'), html);
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log(`PWA post-build done: ${routes.length} routes + manifest`);
