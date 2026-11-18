// The link check (npm run linkcheck): every internal link and file reference in
// the built site leads somewhere. It reads every page in the build, including
// the page-not-found page, and the sitemap, and checks each href, src and
// srcset that points into the site, and the place on the page (#id) it names.
//
// Links to other sites are not checked: they break on their own, so they must
// not block a pull request.
//
// Usage: node tools/linkcheck.js [site-dir]   (default: _site, built by npm run build)
import fs from 'node:fs';
import path from 'node:path';
import { loadSiteSettings, repoPath, ROOT } from '../lib/content.js';
import { resolveLikePages } from '../lib/serve.js';

const siteDir = path.resolve(ROOT, process.argv[2] ?? '_site');
if (!fs.existsSync(path.join(siteDir, 'index.html'))) {
  console.error(`No built site in ${repoPath(siteDir)}/: run npm run build first.`);
  process.exit(2);
}

// Any origin works: it only turns paths into URLs. The site's own address
// (canonical links, the sitemap) counts as internal too.
const LOCAL = 'http://site.invalid';
const siteUrl = loadSiteSettings().url;
const isOnSite = (ref) => ref === siteUrl || ref.startsWith(`${siteUrl}/`);

const ENTITIES = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' };
const unescape = (value) => value.replace(/&(amp|quot|#39|lt|gt);/g, (entity) => ENTITIES[entity]);

// Every URL a file refers to.
function referencesIn(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.xml')) return [...text.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => unescape(m[1]));
  const refs = [...text.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => unescape(m[1]));
  for (const [, srcset] of text.matchAll(/\ssrcset="([^"]*)"/g)) {
    refs.push(...unescape(srcset).split(',').map((candidate) => candidate.trim().split(/\s+/)[0]));
  }
  return refs;
}

// The ids on each page, read once.
const idsCache = new Map();
function idsIn(file) {
  if (!idsCache.has(file)) {
    const text = fs.readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...text.matchAll(/\sid="([^"]*)"/g)].map((m) => unescape(m[1]))));
  }
  return idsCache.get(file);
}

// The problem with one reference from the page at `pagePath`, or null if it is fine.
function problemWith(ref, pagePath) {
  let url;
  try {
    url = new URL(isOnSite(ref) ? ref.slice(siteUrl.length) || '/' : ref, LOCAL + pagePath);
  } catch {
    return 'is not a valid address';
  }
  if (url.origin !== LOCAL) return null; // another site, or mailto:, tel:, data:
  let found = resolveLikePages(siteDir, decodeURIComponent(url.pathname));
  if (found?.redirect) found = resolveLikePages(siteDir, found.redirect);
  if (!found) return 'leads to a missing page or file';
  const id = decodeURIComponent(url.hash.slice(1));
  if (id && found.file.endsWith('.html') && !idsIn(found.file).has(id)) {
    return `names #${id}, but ${repoPath(found.file)} has no element with that id`;
  }
  return null;
}

const files = fs.readdirSync(siteDir, { recursive: true })
  .map((name) => path.join(siteDir, name))
  .filter((file) => file.endsWith('.html') || file === path.join(siteDir, 'sitemap.xml'));

const problems = [];
for (const file of files) {
  // The address a visitor sees the page at; relative links resolve against it.
  const pagePath = '/' + path.relative(siteDir, file).split(path.sep).join('/').replace(/(^|\/)index\.html$/, '$1');
  for (const ref of new Set(referencesIn(file))) {
    const problem = problemWith(ref, pagePath);
    if (problem) problems.push(`${repoPath(file)}: ${ref} ${problem}`);
  }
}

if (problems.length) {
  console.error(`Broken internal links in ${repoPath(siteDir)}/:`);
  for (const problem of problems) console.error(`  x ${problem}`);
  process.exit(1);
}
console.log(`Link check: every internal link in ${files.length} files in ${repoPath(siteDir)}/ leads somewhere.`);
