// The Accessibility page: the site's accessibility statement. It names the
// standard, the features, the known limitations, the last check, whom to tell
// about a problem, and where the Technion's own accessibility information is.
import { test, expect } from '@playwright/test';

// A section of the page, found by its heading.
const section = (page, name) => page.getByRole('main').getByRole('region', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/accessibility/');
});

test('Accessibility names the standard the site aims to meet', async ({ page }) => {
  await expect(section(page, 'Standard'))
    .toContainText('Israeli Standard 5568 and the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA');
});

test('Accessibility lists the accessibility features, each built into the pages', async ({ page }) => {
  const features = section(page, 'Accessibility features').getByRole('listitem');
  for (const feature of ['skip link', 'keyboard', 'heading', 'text alternative', 'contrast', '320', 'reduced motion']) {
    await expect(features.filter({ hasText: feature })).toHaveCount(1);
  }
});

test('Accessibility says what is known not to be accessible', async ({ page }) => {
  await expect(section(page, 'Known limitations').getByRole('listitem').filter({ hasText: 'captions' })).toHaveCount(1);
});

test('Accessibility gives the last check: its date, the browsers and the screen reader', async ({ page }) => {
  const check = section(page, 'Last check');
  // Placeholders until the accessibility check of the finished site (ticket #56).
  await expect(check.getByRole('term')).toHaveText(['Date of the last check', 'Browsers', 'Screen reader']);
  await expect(check.getByRole('definition')).toHaveText(['Not yet checked', 'To be confirmed', 'To be confirmed']);
});

test('Accessibility sends reports of a problem to the Lab mailbox', async ({ page }) => {
  await expect(section(page, 'Report a problem').getByRole('link', { name: 'test-mailbox@example.org', exact: true }))
    .toHaveAttribute('href', 'mailto:test-mailbox@example.org');
});

test('Accessibility names the Technion accessibility coordinator, with a phone number and an email address', async ({ page }) => {
  const report = section(page, 'Report a problem');
  await expect(report).toContainText('Technion accessibility coordinator');
  await expect(report).toContainText('Dikla Nachman');
  await expect(report.getByRole('link', { name: '073-378-1956', exact: true })).toHaveAttribute('href', 'tel:+972733781956');
  await expect(report.getByRole('link', { name: 'adminlogistic@technion.ac.il', exact: true }))
    .toHaveAttribute('href', 'mailto:adminlogistic@technion.ac.il');
});

test('Accessibility links to the Technion statements in English and Hebrew, and to campus accessibility', async ({ page }) => {
  const technion = section(page, 'Accessibility at the Technion');
  await expect(technion.getByRole('link', { name: "The Technion's accessibility statement, in English", exact: true }))
    .toHaveAttribute('href', 'https://www.technion.ac.il/en/accessaility-statement/');
  await expect(technion.getByRole('link', { name: "The Technion's accessibility statement, in Hebrew", exact: true }))
    .toHaveAttribute('href', 'https://www.technion.ac.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/');
  await expect(technion.getByRole('link', { name: 'Physical accessibility on the Technion campus, in Hebrew', exact: true }))
    .toHaveAttribute('href', 'https://accessibility.net.technion.ac.il/');
});

test('Accessibility says when the statement was last updated', async ({ page }) => {
  await expect(page.getByRole('main').getByText('This statement was last updated on 22 November 2026.')).toBeVisible();
});

test('Accessibility has no accessibility toolbar or overlay', async ({ page }) => {
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Accessibility');
  // On a desktop the Menu button is not shown, so a button, toolbar or dialog
  // here could only be a widget laid over the page.
  for (const role of ['button', 'toolbar', 'dialog', 'checkbox', 'switch', 'slider']) {
    await expect(page.getByRole(role)).toHaveCount(0);
  }
});

for (const width of [320, 390]) {
  test(`at ${width} px Accessibility does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(section(page, 'Accessibility at the Technion')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
