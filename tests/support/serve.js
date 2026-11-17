// Serves a built site the way GitHub Pages does, so tests see what visitors see:
//   /dir/  -> dir/index.html
//   /dir   -> 301 to /dir/ when dir/ exists, else dir.html when it exists
//   other  -> 404 with the site's own 404.html when it has one
//
// Usage: node tests/support/serve.js <site-dir> <port>
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const isFile = (p) => fs.statSync(p, { throwIfNoEntry: false })?.isFile() ?? false;
const isDir = (p) => fs.statSync(p, { throwIfNoEntry: false })?.isDirectory() ?? false;

export function serve(siteDir, port) {
  const root = path.resolve(siteDir);

  const send = (res, status, file) => {
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  };

  const notFound = (res) => {
    const page = path.join(root, '404.html');
    if (isFile(page)) return send(res, 404, page);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  };

  return http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      return notFound(res);
    }
    const target = path.join(root, pathname);
    // Never serve anything outside the site directory.
    if (target !== root && !target.startsWith(root + path.sep)) return notFound(res);

    if (isDir(target)) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${pathname}/` });
        return res.end();
      }
      const index = path.join(target, 'index.html');
      return isFile(index) ? send(res, 200, index) : notFound(res);
    }
    if (isFile(target)) return send(res, 200, target);
    if (isFile(`${target}.html`)) return send(res, 200, `${target}.html`);
    return notFound(res);
  }).listen(Number(port), () => {
    console.log(`Serving ${root} at http://localhost:${port}/`);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [siteDir, port] = process.argv.slice(2);
  if (!siteDir || !port) {
    console.error('Usage: node tests/support/serve.js <site-dir> <port>');
    process.exit(2);
  }
  serve(siteDir, port);
}
