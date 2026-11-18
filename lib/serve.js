// Serves a built site the way GitHub Pages does, so tests see what visitors see:
//   /dir/  -> dir/index.html
//   /dir   -> 301 to /dir/ when dir/ exists, else dir.html when it exists
//   other  -> 404 with the site's own 404.html when it has one
//
// Usage: node lib/serve.js <site-dir> <port>
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

// What GitHub Pages answers for a decoded URL path in the site at `root`:
// { file } to send, { redirect } to a new path, or null for not found.
export function resolveLikePages(root, pathname) {
  const target = path.join(root, pathname);
  // Nothing outside the site directory is ever part of the site.
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  if (isDir(target)) {
    if (!pathname.endsWith('/')) return { redirect: `${pathname}/` };
    const index = path.join(target, 'index.html');
    return isFile(index) ? { file: index } : null;
  }
  if (isFile(target)) return { file: target };
  if (isFile(`${target}.html`)) return { file: `${target}.html` };
  return null;
}

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
    let found = null;
    try {
      found = resolveLikePages(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    } catch {
      // An address that does not decode is not found.
    }
    if (found?.redirect) {
      res.writeHead(301, { Location: found.redirect });
      return res.end();
    }
    return found ? send(res, 200, found.file) : notFound(res);
  }).listen(Number(port), () => {
    console.log(`Serving ${root} at http://localhost:${port}/`);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [siteDir, port] = process.argv.slice(2);
  if (!siteDir || !port) {
    console.error('Usage: node lib/serve.js <site-dir> <port>');
    process.exit(2);
  }
  serve(siteDir, port);
}
