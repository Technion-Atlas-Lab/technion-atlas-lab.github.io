// Building the site from a content set, and reading back which pages it built.
// Used by the tests and by `npm run shots`; `npm run build` runs Eleventy directly.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, repoPath } from './content.js';

// Builds the site from `contentDir` into a clean `outputDir` (both relative to
// the repo root). Returns true when the build succeeded.
export function buildSite(contentDir, outputDir) {
  // Eleventy never deletes from its output folder, so pages from an earlier
  // build would linger and could make a check pass that should fail.
  fs.rmSync(path.resolve(ROOT, outputDir), { recursive: true, force: true });
  const build = spawnSync(`npm run build -- --quiet --output=${outputDir}`, {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, SITE_CONTENT_DIR: contentDir },
  });
  return build.status === 0;
}

// The path of every page in a built site's sitemap, such as `/about/`.
export function sitemapPaths(outputDir) {
  const file = path.resolve(ROOT, outputDir, 'sitemap.xml');
  if (!fs.existsSync(file)) {
    throw new Error(`${repoPath(file)} is missing: the site was not built into ${outputDir}/.`);
  }
  const locs = [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  return locs.map((loc) => new URL(loc).pathname);
}
