// Builds the site from the test content set into a clean .test-site/ and serves
// it. Playwright starts this before the slice tests (playwright.config.js).
//
// Usage: node tests/support/test-site.js <port>
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../../lib/content.js';
import { serve } from './serve.js';

const OUT = path.join(ROOT, '.test-site');
const port = process.argv[2];

// Eleventy never deletes from its output folder, so pages from an earlier
// build would linger and could make a test pass that should fail.
fs.rmSync(OUT, { recursive: true, force: true });

const build = spawnSync('npm run build -- --quiet --output=.test-site', {
  cwd: ROOT,
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, SITE_CONTENT_DIR: 'tests/content' },
});
if (build.status !== 0) process.exit(build.status ?? 1);

serve(OUT, port);
