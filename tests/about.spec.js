// The About page: the Lab's mission, its story, an introduction from the Lab
// Director, and where the Lab is. The mission, the address and the Lab
// Director come from the test content set (tests/content/); the story and the
// introduction are the page's own text.
import { test, expect } from '@playwright/test';

// A section of the page, found by its heading.
const section = (page, name) => page.getByRole('main').getByRole('region', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/about/');
});

test('About shows the mission from the site settings', async ({ page }) => {
  await expect(section(page, 'Our mission').getByRole('paragraph')).toHaveText('Test mission line for the slice tests.');
});

test('About tells the story of the Lab', async ({ page }) => {
  await expect(section(page, 'Our story').getByRole('paragraph').first()).toHaveText(/\S/);
});

test('About carries an introduction from the Lab Director, who is named with a link to their Profile', async ({ page }) => {
  const introduction = section(page, 'From the Lab Director');
  await expect(introduction.getByRole('paragraph').first()).toHaveText(/\S/);
  await introduction.getByRole('link', { name: 'Prof. Test Director', exact: true }).click();
  await expect(page).toHaveURL('/people/test-director/');
});

test('About says where the Lab is: the Faculty of Computer Science at the Technion, with the address and the way to Contact', async ({ page }) => {
  const where = section(page, 'Where we are');
  await expect(where).toContainText('Faculty of Computer Science');
  await expect(where).toContainText('Technion');
  await expect(where).toContainText('Test Building, Room 404');
  await expect(where).toContainText('1 Example Road, Testville 1234567');
  await where.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL('/contact/');
});

for (const width of [320, 390]) {
  test(`at ${width} px About does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(section(page, 'Where we are')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
