// The "Collaborating with" page: every Partner, by logo or by name. Built from
// the Partners in the test content set (tests/content/partners/).
// The logo tests/content/partners/example-foundation.png is 1200 x 400 px and
// carries camera and author metadata.
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import sharp from 'sharp';

// The widest logo the site serves.
const WIDEST = 800;

const partners = (page) => page.getByRole('main').getByRole('listitem');

test.beforeEach(async ({ page }) => {
  await page.goto('/collaborating-with/');
});

test('the page is headed "Collaborating with"', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Collaborating with');
});

test('the page lists every Partner, in name order', async ({ page }) => {
  await expect(partners(page)).toHaveCount(4);
  // A Partner with a logo is read by the logo's alt text, one without by its written name.
  await expect(partners(page).nth(0).getByRole('img')).toHaveAccessibleName('Agency for Examples');
  await expect(partners(page).nth(1)).toHaveText("Baker & Daughters' Trust");
  await expect(partners(page).nth(2).getByRole('img')).toHaveAccessibleName('Example Science Foundation');
  await expect(partners(page).nth(3)).toHaveText('Unlinked Partner');
});

test('a Partner with a logo shows the logo, named for the Partner, and not the name as text', async ({ page }) => {
  const partner = partners(page).nth(2);
  const logo = partner.getByRole('img', { name: 'Example Science Foundation', exact: true });
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((img) => img.decode().then(() => img.naturalWidth))).toBeGreaterThan(0);
  await expect(partner).toHaveText('');
});

test('a Partner with a link leads to it, by logo or by name', async ({ page }) => {
  await expect(partners(page).nth(2).getByRole('link', { name: 'Example Science Foundation', exact: true }))
    .toHaveAttribute('href', 'https://example.org/foundation');
  await expect(partners(page).nth(1).getByRole('link', { name: "Baker & Daughters' Trust", exact: true }))
    .toHaveAttribute('href', 'https://example.org/baker-trust');
});

test('a Partner with no link is shown without one', async ({ page }) => {
  await expect(partners(page).nth(0).getByRole('img')).toBeVisible();
  await expect(partners(page).nth(0).getByRole('link')).toHaveCount(0);
  await expect(partners(page).nth(3).getByRole('link')).toHaveCount(0);
});

test('the page shows names and logos only', async ({ page }) => {
  const main = page.getByRole('main');
  await expect(partners(page)).toHaveCount(4);
  await expect(main.getByRole('paragraph')).toHaveCount(0);
  await expect(main.getByRole('heading')).toHaveText(['Collaborating with']);
});

test('the logo in the test content set does carry camera metadata', async () => {
  // Without this, the check below would pass on a logo that had nothing to strip.
  const { exif, width, height } = await sharp(fs.readFileSync('tests/content/partners/example-foundation.png')).metadata();
  expect(exif.includes('TestCam')).toBe(true);
  expect([width, height]).toEqual([1200, 400]);
});

test('a served logo is resized, keeps its shape, and carries no embedded metadata', async ({ page, request }) => {
  const logo = partners(page).nth(2).getByRole('img');
  const addresses = await logo.evaluate((el) => [...new Set(
    [el.getAttribute('src'), ...(el.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(/\s+/)[0])]
      .filter(Boolean))]);
  expect(addresses.length).toBeGreaterThan(0);
  for (const address of addresses) {
    const response = await request.get(address);
    expect(response.ok(), address).toBe(true);
    const bytes = await response.body();
    const served = await sharp(bytes).metadata();
    for (const block of ['exif', 'icc', 'iptc', 'xmp', 'tifftagPhotoshop', 'comments']) {
      expect(served[block], `${address} carries ${block}`).toBeUndefined();
    }
    expect(bytes.includes('TestCam'), `${address} names the camera`).toBe(false);
    expect(served.width, address).toBeLessThanOrEqual(WIDEST);
    // Three times as wide as it is high, as committed.
    expect(served.width / served.height, address).toBeCloseTo(3, 1);
  }
});

test('the logo as it was committed is not published', async ({ request }) => {
  for (const address of ['/partners/example-foundation.png', '/logos/example-foundation.png', '/collaborating-with/example-foundation.png', '/example-foundation.png']) {
    expect((await request.get(address)).status(), address).toBe(404);
  }
});

for (const width of [320, 390]) {
  test(`at ${width} px the page does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(partners(page)).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
