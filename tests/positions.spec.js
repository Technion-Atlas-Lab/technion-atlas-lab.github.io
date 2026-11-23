// The Positions page: the Lab's standing message to prospective students, how
// to apply, and the way to the Offered Student Projects. Built from the site
// settings in the test content set (tests/content/site.yaml).
import { test, expect } from '@playwright/test';

// A section of the page, found by its heading.
const section = (page, name) => page.getByRole('main').getByRole('region', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/positions/');
});

test('Positions opens with the standing message from the site settings', async ({ page }) => {
  await expect(page.getByRole('main').getByRole('paragraph').first())
    .toHaveText('We are always glad to hear from strong students, in the test content set too.');
});

test('Positions says how to apply: a CV and a short statement, emailed to the Lab mailbox', async ({ page }) => {
  const apply = section(page, 'How to apply');
  await expect(apply).toContainText('your CV');
  await expect(apply).toContainText('a short statement');
  await expect(apply.getByRole('link', { name: 'test-mailbox@example.org', exact: true }))
    .toHaveAttribute('href', 'mailto:test-mailbox@example.org');
});

test('Positions leads an undergraduate to the Offered Student Projects', async ({ page }) => {
  await section(page, 'Undergraduate students').getByRole('link', { name: 'Offered Student Projects', exact: true }).click();
  await expect(page).toHaveURL('/projects/#offered');
  await expect(page.getByRole('heading', { name: 'Offered Student Projects', exact: true })).toBeInViewport();
});

for (const width of [320, 390]) {
  test(`at ${width} px Positions does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(section(page, 'How to apply')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
