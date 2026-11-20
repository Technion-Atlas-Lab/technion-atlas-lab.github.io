// Screenshots for review (npm run shots): builds the site from the real content
// and saves a full-page screenshot of every page in the sitemap at phone, tablet
// and desktop widths, to .shots/<page>@<width>.png. They are for looking at, by
// a person or an agent; nothing compares them.
//
// Usage: npm run shots [-- /about/ /people/ ...]   (default: every page)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { buildSite, sitemapPaths } from '../lib/build.js';
import { ROOT, repoPath } from '../lib/content.js';
import { serve } from '../lib/serve.js';

const WIDTHS = [390, 768, 1280];
// The build these screenshots are taken of, kept apart from the site-wide checks' build.
const SHOTS_BUILD_DIR = '.builds/shots';
const SHOTS_DIR = path.join(ROOT, '.shots');

if (!buildSite('content', SHOTS_BUILD_DIR)) process.exit(1);
const paths = process.argv.length > 2 ? process.argv.slice(2) : sitemapPaths(SHOTS_BUILD_DIR);

fs.rmSync(SHOTS_DIR, { recursive: true, force: true });
fs.mkdirSync(SHOTS_DIR);

const server = serve(path.join(ROOT, SHOTS_BUILD_DIR), 0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const pagePath of paths) {
      await page.goto(base + pagePath);
      const name = pagePath.replace(/^\/|\/$/g, '').replaceAll('/', '_') || 'home';
      const file = path.join(SHOTS_DIR, `${name}@${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`Saved ${repoPath(file)}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
