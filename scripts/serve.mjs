/* scripts/serve.mjs — local preview.
 *
 *   node scripts/serve.mjs          → http://localhost:8000
 *   PORT=3000 node scripts/serve.mjs
 *
 * Works from any folder. On macOS it opens the browser for you
 * (NO_OPEN=1 node scripts/serve.mjs to skip that).
 *
 * Rebuilds _site/ with the same build the deploy workflow uses every time
 * you load a page, then serves it. Edit a .md file, refresh the browser,
 * and you see what the live site will show.
 * Like a static host, /blog/my-post redirects to /blog/my-post/ and
 * unknown URLs get _site/404.html.
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { build, OUT } from './build.mjs';

const PORT = Number(process.env.PORT || 8000);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wasm': 'application/wasm',
};

// One build at a time; every request waits for the current one so nothing is
// served from a half-written _site/.
let building = Promise.resolve();
let lastError = null;
function rebuild() {
  building = building.then(() =>
    build().then(
      () => { lastError = null; },
      (err) => { lastError = err; console.error('Build failed:', err.message || err); }
    )
  );
  return building;
}

async function isFile(p) {
  try {
    return (await fs.stat(p)).isFile();
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const ext = path.extname(urlPath);
  const isPage = ext === '' || ext === '.html' || ext === '.xml';
  if (isPage) await rebuild();
  else await building;

  if (isPage && lastError) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Build failed:\n\n${lastError.message || lastError}`);
    return;
  }

  const target = path.join(OUT, path.normalize(urlPath));
  if (!target.startsWith(OUT)) {
    res.writeHead(400).end();
    return;
  }
  let file = target;
  if (urlPath.endsWith('/')) file = path.join(target, 'index.html');
  else if (!(await isFile(target)) && (await isFile(path.join(target, 'index.html')))) {
    res.writeHead(301, { Location: `${urlPath}/` }).end();
    return;
  }
  if (!(await isFile(file))) {
    const notFound = path.join(OUT, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end((await isFile(notFound)) ? await fs.readFile(notFound) : `Not found: ${urlPath}`);
    return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(await fs.readFile(file));
});

rebuild().then(() => {
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/`;
    console.log(`Preview: ${url}  (Ctrl+C to stop)`);
    if (process.platform === 'darwin' && !process.env.NO_OPEN) {
      spawn('open', [url], { stdio: 'ignore' }).on('error', () => {});
    }
  });
});
