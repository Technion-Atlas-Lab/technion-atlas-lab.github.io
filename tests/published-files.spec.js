// Repo docs and agent files are for Maintainers and coding agents, never for
// visitors: none of them is reachable on the site, as a raw file or as a page.
import { test, expect } from '@playwright/test';

const PRIVATE_FILES = [
  'CLAUDE.md',
  'README.md',
  'GLOSSARY.md',
  'CODING_STANDARDS.md',
  'docs/adr/0001-static-site-on-github-pages.md',
  '.claude/settings.json',
  'package.json',
];

for (const file of PRIVATE_FILES) {
  test(`${file} is not published`, async ({ request }) => {
    const asFile = await request.get(`/${file}`, { maxRedirects: 0 });
    expect(asFile.status()).toBe(404);
    const asPage = await request.get(`/${file.replace(/\.[^./]+$/, '')}/`, { maxRedirects: 0 });
    expect(asPage.status()).toBe(404);
  });
}
