// Builds the site from a content set into a clean output folder and serves it
// the way GitHub Pages does. Playwright starts this before its tests:
//   slice tests (playwright.config.js):           the test content set, tests/content/
//   site-wide checks (playwright.site.config.js): the real content, content/
//
// Usage: node tests/support/build-and-serve.js <port> <content-dir> <output-dir>
import path from 'node:path';
import { buildSite } from '../../lib/build.js';
import { ROOT } from '../../lib/content.js';
import { serve } from '../../lib/serve.js';

const [port, contentDir, outputDir] = process.argv.slice(2);
if (!port || !contentDir || !outputDir) {
  console.error('Usage: node tests/support/build-and-serve.js <port> <content-dir> <output-dir>');
  process.exit(2);
}
if (!buildSite(contentDir, outputDir)) process.exit(1);
serve(path.resolve(ROOT, outputDir), port);
