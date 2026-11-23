// The shell every page shares: the header with the logo and the menu, the
// skip link, the footer, and the page a visitor gets for an unknown address.
import { test, expect } from '@playwright/test';
import { backgroundBehind } from './support/background.js';

const MENU = ['About', 'People', 'Research', 'News', 'Projects', 'Positions', 'Collaborating with', 'Contact'];

const menu = (page) => page.getByRole('navigation', { name: 'Main' });

for (const path of ['/about/', '/no-such-page/']) {
  test(`${path} opens with its heading on a banner in the footer's colour`, async ({ page }) => {
    await page.goto(path);
    const heading = page.getByRole('main').getByRole('heading', { level: 1 });
    expect(await backgroundBehind(heading)).toBe(await backgroundBehind(page.getByRole('contentinfo')));
  });
}

test('the logo leads Home from any page', async ({ page }) => {
  await page.goto('/about/');
  await page.getByRole('banner').getByRole('link', { name: 'ATLAS Lab home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ATLAS Lab');
});

test('the logo shows the Lab logo image', async ({ page }) => {
  await page.goto('/');
  const logo = page.getByRole('banner').getByRole('link', { name: 'ATLAS Lab home', exact: true }).getByRole('img');
  await expect(logo).toBeVisible();
  // The image really loaded: a broken image has no natural width.
  expect(await logo.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
});

test('the menu lists the pages in order', async ({ page }) => {
  await page.goto('/');
  await expect(menu(page).getByRole('link')).toHaveText(MENU);
});

test('no menu item is marked current on Home', async ({ page }) => {
  await page.goto('/');
  await expect(menu(page).locator('[aria-current]')).toHaveCount(0);
});

test('the skip link is the first stop for the keyboard and moves focus to the main content', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('the footer carries the copyright line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('contentinfo')).toContainText('© ATLAS Lab, Technion');
});

for (const label of ['Accessibility', 'Privacy']) {
  test(`${label} in the footer opens its page`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(label);
  });
}

test('an unknown address gets a helpful page-not-found page with the menu', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(menu(page).getByRole('link')).toHaveText(MENU);
  await page.getByRole('main').getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL('/');
});

test('the page-not-found page keeps its logo and menu working at a deep unknown address', async ({ page }) => {
  await page.goto('/people/no-one/at/all');
  const logo = page.getByRole('banner').getByRole('img');
  expect(await logo.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await menu(page).getByRole('link', { name: 'Research', exact: true }).click();
  await expect(page).toHaveURL('/research/');
});

for (const label of MENU) {
  test(`${label} in the menu opens its page, marked as the current page`, async ({ page }) => {
    await page.goto('/');
    await menu(page).getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(menu(page).locator('[aria-current="page"]')).toHaveText([label]);
  });
}

test.describe('at tablet width', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    // The current page's item is bold, and so wider: the longest label is the hardest case.
    await page.goto('/collaborating-with/');
  });

  test('the menu fits on one row', async ({ page }) => {
    const links = menu(page).getByRole('link');
    await expect(links).toHaveCount(MENU.length);
    // Every item starts at the same height: none is pushed onto a second row.
    const tops = await links.evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });

  test('the menu keeps one row in a system font a tenth wider', async ({ page }) => {
    // The site uses each visitor's system font, and some are wider than the
    // test browser's: DejaVu Sans, system-ui on some Linux desktops, is 7%
    // wider. The row keeps room for 10%, so that one and a little more fit.
    const links = await menu(page).getByRole('link').evaluateAll((items) => items.map((item) => {
      const box = item.getBoundingClientRect();
      return { left: box.left, right: box.right, width: box.width };
    }));
    const text = links.reduce((sum, link) => sum + link.width, 0);
    const gaps = links.at(-1).right - links[0].left - text;
    // The header's content sits between equal margins, the logo on the left one.
    const logo = await page.getByRole('banner').getByRole('link', { name: 'ATLAS Lab home', exact: true }).boundingBox();
    expect(text * 1.1 + gaps).toBeLessThanOrEqual(768 - 2 * logo.x);
  });
});
