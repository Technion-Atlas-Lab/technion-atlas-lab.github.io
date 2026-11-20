// The People page: who is in the Lab, grouped by role, and its Alumni.
// Built from the Members in the test content set (tests/content/members/).
import { test, expect } from '@playwright/test';

const LONG_NAME = 'Maximiliana Alexandrina Wolfeschlegelsteinhausenbergerdorff-Featherstonehaugh de la Fuente y Montgomery the Third';

// A role group: the part of the page under that group's heading.
const group = (page, name) => page.getByRole('region', { name, exact: true });

test('People shows the role groups in their fixed order, leaving out roles nobody holds', async ({ page }) => {
  await page.goto('/people/');
  // The test content set has no Postdoctoral Researcher.
  await expect(page.getByRole('main').getByRole('heading', { level: 2 }))
    .toHaveText(['Lab Director', 'PhD Students', 'MSc Students', 'Research Staff', 'Alumni']);
});

test('a group lists its Members by display order', async ({ page }) => {
  await page.goto('/people/');
  await expect(group(page, 'PhD Students').getByRole('link')).toHaveText([LONG_NAME, 'Full Member']);
});

test('People has no sort or filter controls', async ({ page }) => {
  await page.goto('/people/');
  const main = page.getByRole('main');
  await expect(main.getByText('Full Member')).toBeVisible();
  for (const role of ['button', 'textbox', 'searchbox', 'combobox', 'checkbox', 'radio']) {
    await expect(main.getByRole(role)).toHaveCount(0);
  }
});

test('a Member without a photo gets an avatar of their initials, skipping a title', async ({ page }) => {
  await page.goto('/people/');
  await expect(group(page, 'Lab Director').getByRole('listitem').getByText('TD', { exact: true })).toBeVisible();
  await expect(group(page, 'MSc Students').getByRole('listitem').getByText('BM', { exact: true })).toBeVisible();
  await expect(group(page, 'Research Staff').getByRole('listitem').getByText('ZC', { exact: true })).toBeVisible();
});

test('a name reaches its card as written, apostrophe and ampersand included', async ({ page }) => {
  await page.goto('/people/');
  await expect(group(page, 'Research Staff').getByRole('link')).toHaveText(["Dr. Zoë O'Neil & Co"]);
});

test('each card shows the Member\'s role', async ({ page }) => {
  await page.goto('/people/');
  await expect(group(page, 'PhD Students').getByRole('listitem').filter({ hasText: 'Full Member' }))
    .toContainText('PhD Student');
});

test.describe('at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the Lab Director gets a wide card and the other groups a grid of cards', async ({ page }) => {
    await page.goto('/people/');
    const director = await group(page, 'Lab Director').getByRole('listitem').boundingBox();
    const [first, second] = await group(page, 'PhD Students').getByRole('listitem').evaluateAll(
      (cards) => cards.map((card) => card.getBoundingClientRect().toJSON()));
    // Grid cards sit side by side; the Lab Director's card is wider than two of them.
    expect(second.top).toBe(first.top);
    expect(second.left).toBeGreaterThanOrEqual(first.right);
    expect(director.width).toBeGreaterThan(2 * first.width);
  });

  test('an Alumni row is compact: shorter than a Member card, its avatar beside the name', async ({ page }) => {
    await page.goto('/people/');
    const row = group(page, 'Alumni').getByRole('listitem').filter({ hasText: 'Alumnus Example' });
    const rowBox = await row.boundingBox();
    const card = await group(page, 'MSc Students').getByRole('listitem').boundingBox();
    expect(rowBox.height).toBeLessThan(card.height / 2);
    const avatar = await row.getByText('AE', { exact: true }).boundingBox();
    const name = await row.getByText('Alumnus Example').boundingBox();
    expect(name.x).toBeGreaterThanOrEqual(avatar.x + avatar.width);
  });
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a very long name wraps inside its card', async ({ page }) => {
    await page.goto('/people/');
    const card = await group(page, 'PhD Students').getByRole('listitem').first().boundingBox();
    const name = await page.getByRole('link', { name: LONG_NAME }).boundingBox();
    expect(name.x).toBeGreaterThanOrEqual(card.x);
    expect(name.x + name.width).toBeLessThanOrEqual(card.x + card.width);
    expect(card.x + card.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test('Alumni appear as rows with their avatar, name, former role and year, and current position', async ({ page }) => {
  await page.goto('/people/');
  const rows = group(page, 'Alumni').getByRole('listitem');
  await expect(rows).toHaveCount(2);
  const former = rows.filter({ hasText: 'Alumnus Example' });
  await expect(former.getByText('AE', { exact: true })).toBeVisible();
  await expect(former.getByText('MSc Student, 2024', { exact: true })).toBeVisible();
  await expect(former.getByText('Research Engineer at Example Corp', { exact: true })).toBeVisible();
});

test('an Alumnus with no current position shows only the former role and year', async ({ page }) => {
  await page.goto('/people/');
  // A last initial counts as a name: only a leading title is left out of the avatar.
  const ada = group(page, 'Alumni').getByRole('listitem').filter({ hasText: 'Ada B.' });
  await expect(ada).toHaveText(/^\s*AB\s*Ada B\.\s*PhD Student, 2021\s*$/);
});

test('Alumni rows open no Profile', async ({ page }) => {
  await page.goto('/people/');
  await expect(group(page, 'Alumni').getByText('Alumnus Example')).toBeVisible();
  await expect(group(page, 'Alumni').getByRole('link')).toHaveCount(0);
});
