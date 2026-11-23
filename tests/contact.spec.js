// The Contact page: the Lab mailbox as an email link, the Lab's address, and a
// plain link to a map. Built from the site settings in the test content set
// (tests/content/site.yaml).
import { test, expect } from '@playwright/test';

// A section of the page, found by its heading.
const section = (page, name) => page.getByRole('main').getByRole('region', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/contact/');
});

test('Contact gives the Lab mailbox as an email link', async ({ page }) => {
  await expect(section(page, 'Email').getByRole('link', { name: 'test-mailbox@example.org', exact: true }))
    .toHaveAttribute('href', 'mailto:test-mailbox@example.org');
});

test('Contact shows the address, each line on a line of its own', async ({ page }) => {
  const address = section(page, 'Address').getByText('Test Building, Room 404');
  await expect(address).toContainText('1 Example Road, Testville 1234567');
  // The building and the street are two lines of the settings, and two lines on the page.
  const lineHeight = await address.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
  expect((await address.boundingBox()).height).toBeGreaterThanOrEqual(2 * lineHeight - 1);
});

test('Contact links to a map, as a plain link', async ({ page }) => {
  await expect(section(page, 'Address').getByRole('link', { name: 'Open the map', exact: true }))
    .toHaveAttribute('href', 'https://example.org/maps/test-building');
});

test('Contact embeds nothing: no map frame, and no picture from another site', async ({ page }) => {
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Address', exact: true })).toBeVisible();
  await expect(main.locator('iframe, embed, object')).toHaveCount(0);
  await expect(main.getByRole('img')).toHaveCount(0);
});

for (const width of [320, 390]) {
  test(`at ${width} px Contact does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(section(page, 'Address')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
