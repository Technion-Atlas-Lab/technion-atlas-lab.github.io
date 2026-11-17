// The shell every page shares: the header with the logo and the menu, the
// skip link, the footer, and the page a visitor gets for an unknown address.
import { test, expect } from '@playwright/test';

const MENU = ['About', 'People', 'Research', 'News', 'Projects', 'Positions', 'Funding', 'Contact'];

const menu = (page) => page.getByRole('navigation', { name: 'Main' });

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
