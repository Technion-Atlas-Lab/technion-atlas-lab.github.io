// The Privacy page: what happens to a visitor's data, who is responsible for
// personal data on the site, and how a person asks to change or remove theirs.
import { test, expect } from '@playwright/test';

// A section of the page, found by its heading.
const section = (page, name) => page.getByRole('main').getByRole('region', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/privacy/');
});

test('Privacy says the site sets no cookies and uses no analytics', async ({ page }) => {
  await expect(section(page, 'No cookies, no analytics')).toContainText('sets no cookies and uses no analytics');
});

test('Privacy says GitHub hosts the site in the United States and logs visitor IP addresses', async ({ page }) => {
  const hosting = section(page, 'Hosting');
  await expect(hosting).toContainText('GitHub, Inc., in the United States');
  await expect(hosting).toContainText('logs the IP address of every visitor');
  await expect(hosting.getByRole('link', { name: "GitHub's privacy statement", exact: true }))
    .toHaveAttribute('href', 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement');
});

test('Privacy names the Technion as the responsible body, with its data protection officer', async ({ page }) => {
  const responsible = section(page, 'Who is responsible');
  await expect(responsible).toContainText('The Technion – Israel Institute of Technology is the body responsible');
  await expect(responsible.getByRole('link', { name: "the Technion's privacy policy", exact: true }))
    .toHaveAttribute('href', 'https://www.technion.ac.il/en/privacy-policy/');
  await expect(responsible).toContainText('data protection officer');
  await expect(responsible.getByRole('link', { name: 'dpo@technion.ac.il', exact: true }))
    .toHaveAttribute('href', 'mailto:dpo@technion.ac.il');
});

test('Privacy sends a request to change or remove personal data to the Lab mailbox', async ({ page }) => {
  const change = section(page, 'Change or remove your information');
  await expect(change).toContainText('change or remove');
  await expect(change.getByRole('link', { name: 'test-mailbox@example.org', exact: true }))
    .toHaveAttribute('href', 'mailto:test-mailbox@example.org');
});

test('Privacy says when the page was last updated', async ({ page }) => {
  await expect(page.getByRole('main').getByText('This page was last updated on 22 November 2026.')).toBeVisible();
});

for (const width of [320, 390]) {
  test(`at ${width} px Privacy does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(section(page, 'Change or remove your information')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('opened at one of its sections, Privacy keeps some room above that heading', async ({ page }) => {
  await page.goto('/privacy/#cookies');
  const heading = page.getByRole('heading', { name: 'No cookies, no analytics', exact: true });
  await expect(heading).toBeInViewport();
  expect((await heading.boundingBox()).y).toBeGreaterThanOrEqual(16);
});
