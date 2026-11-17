// What search engines, link previews and the browser's security checks see:
// titles, descriptions, canonical addresses, Open Graph tags, the sitemap, the
// robots file, and the content security policy.
import { test, expect } from '@playwright/test';

// The site address in the test content set (tests/content/site.yaml).
const SITE = 'https://test-site.example.org';

// Every page the shell links to: Home, the menu, and the footer.
const PAGES = ['/', '/about/', '/people/', '/research/', '/news/', '/projects/', '/positions/',
  '/funding/', '/contact/', '/accessibility/', '/privacy/'];

// The content of the one tag matching `selector`; a duplicated tag fails the test.
const metaContent = (page, selector) => page.locator(selector).getAttribute('content');

test('every page has a title and a description of its own', async ({ page }) => {
  const titles = new Set();
  const descriptions = new Set();
  for (const path of PAGES) {
    await page.goto(path);
    const title = await page.title();
    const description = await metaContent(page, 'meta[name="description"]');
    expect(title, path).toMatch(/\S/);
    expect(description, path).toMatch(/\S/);
    titles.add(title);
    descriptions.add(description);
  }
  expect(titles.size).toBe(PAGES.length);
  expect(descriptions.size).toBe(PAGES.length);
});

for (const path of PAGES) {
  test(`${path} names its canonical address and carries Open Graph tags`, async ({ page }) => {
    await page.goto(path);
    const canonical = `${SITE}${path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    expect(await metaContent(page, 'meta[property="og:url"]')).toBe(canonical);
    expect(await metaContent(page, 'meta[property="og:title"]')).toMatch(/\S/);
    expect(await metaContent(page, 'meta[property="og:description"]')).toBe(await metaContent(page, 'meta[name="description"]'));
    expect(await metaContent(page, 'meta[property="og:type"]')).toBe('website');
    expect(await metaContent(page, 'meta[property="og:site_name"]')).toBe('ATLAS Lab');
  });

  test(`${path} is open to search engines`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });
}

for (const path of [...PAGES, '/no-such-page/']) {
  test(`${path} blocks content from other origins`, async ({ page }) => {
    // If the policy fails, the request must still never leave the machine.
    await page.route((url) => url.hostname !== 'localhost', (route) => route.abort());
    await page.goto(path);
    const blocked = await page.evaluate(() => new Promise((resolve) => {
      document.addEventListener('securitypolicyviolation', (e) => resolve(e.blockedURI), { once: true });
      const img = new Image();
      img.onerror = () => setTimeout(() => resolve(null), 100);
      img.src = 'https://third-party.example/pixel.png';
      document.body.append(img);
    }));
    expect(blocked).toBe('https://third-party.example/pixel.png');
  });
}

test('the sitemap lists every page by its canonical address, and not the page-not-found page', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const locs = [...(await response.text()).matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  for (const path of PAGES) expect(locs).toContain(`${SITE}${path}`);
  expect(locs.filter((loc) => loc.includes('404'))).toEqual([]);
});

test('the robots file lets search engines in and points them to the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  const robots = await response.text();
  expect(robots).toMatch(/^User-agent: \*$/m);
  expect(robots).not.toMatch(/^Disallow: *\/\S*$/m);
  expect(robots).toMatch(new RegExp(`^Sitemap: ${SITE}/sitemap\\.xml$`, 'm'));
});
