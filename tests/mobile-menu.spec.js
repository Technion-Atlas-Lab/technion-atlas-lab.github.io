// Below tablet width the menu collapses behind a labelled button. Without
// JavaScript there is no button and the menu stays open, so nothing is lost.
import { test, expect } from '@playwright/test';

const menu = (page) => page.getByRole('navigation', { name: 'Main' });
const menuButton = (page) => page.getByRole('button', { name: 'Menu' });

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu starts closed behind a Menu button', async ({ page }) => {
    await page.goto('/');
    await expect(menuButton(page)).toBeVisible();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page).getByRole('link', { name: 'About', exact: true })).toBeHidden();
  });

  test('the Menu button opens the menu, and a menu link leads to its page', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
    await menu(page).getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL('/contact/');
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('the Menu button closes the open menu', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page).getByRole('link', { name: 'About', exact: true })).toBeHidden();
  });

  test('Escape closes the open menu and returns focus to the Menu button', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await menu(page).getByRole('link', { name: 'About', exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(menu(page).getByRole('link', { name: 'About', exact: true })).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });
});

test.describe('on a phone without JavaScript', () => {
  test.use({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });

  test('the whole menu is shown and there is no Menu button', async ({ page }) => {
    await page.goto('/');
    await expect(menuButton(page)).toHaveCount(0);
    for (const link of await menu(page).getByRole('link').all()) await expect(link).toBeVisible();
  });
});

test.describe('on a tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('the whole menu is shown and there is no Menu button', async ({ page }) => {
    await page.goto('/');
    await expect(menuButton(page)).toBeHidden();
    for (const link of await menu(page).getByRole('link').all()) await expect(link).toBeVisible();
  });
});
