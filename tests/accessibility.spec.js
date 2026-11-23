// The Accessibility page: the site's accessibility statement. It names the
// standard, the features, the known limitations, whom to tell about a problem,
// and where the Technion's own accessibility information is.
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
  for (const feature of ['skip link', 'keyboard', 'heading', 'text alternative', 'contrast', '320', 'reduced motion', 'JavaScript']) {
    await expect(features.filter({ hasText: feature })).toHaveCount(1);
  }
});

test('Accessibility has five sections, in order', async ({ page }) => {
  await expect(page.getByRole('main').getByRole('heading', { level: 2 }))
    .toHaveText(['Standard', 'Accessibility features', 'Known limitations', 'Report a problem', 'Accessibility at the Technion']);
});

test('Accessibility says what is known not to be accessible, as plain text with no bullet', async ({ page }) => {
  const limitations = section(page, 'Known limitations');
  await expect(limitations).toHaveText('Known limitations Papers, recordings and other pages that this site links to are published by others, and may not be accessible. A recording of a talk may have no captions.');
  await expect(limitations.getByRole('listitem')).toHaveCount(0);
});

test('Accessibility sends reports of a problem to the Lab mailbox', async ({ page }) => {
  await expect(section(page, 'Report a problem').getByRole('link', { name: 'test-mailbox@example.org', exact: true }))
    .toHaveAttribute('href', 'mailto:test-mailbox@example.org');
});

test('Accessibility promises to try to help with a reported problem, not a result', async ({ page }) => {
  await expect(section(page, 'Report a problem')).toContainText('Tell us the page and what went wrong, and we will do our best to help.');
});

test('Accessibility names the Technion accessibility coordinator, with a phone number and an email address', async ({ page }) => {
  const report = section(page, 'Report a problem');
  await expect(report).toContainText('Technion accessibility coordinator');
  await expect(report).toContainText('Dikla Nachman');
  await expect(report.getByRole('link', { name: '073-378-1956', exact: true })).toHaveAttribute('href', 'tel:+972733781956');
  await expect(report.getByRole('link', { name: 'adminlogistic@technion.ac.il', exact: true }))
    .toHaveAttribute('href', 'mailto:adminlogistic@technion.ac.il');
});

test('Accessibility links to the Technion statements in English and Hebrew, and to nothing else', async ({ page }) => {
  const technion = section(page, 'Accessibility at the Technion');
  // What the Technion's statement holds, as read on 22 November 2026: its websites, and a pointer to the campus site.
  await expect(technion).toContainText("The Technion's own statement covers its websites, and points to its campus accessibility site for buildings and access routes.");
  await expect(technion.getByRole('link', { name: "The Technion's accessibility statement, in English", exact: true }))
    .toHaveAttribute('href', 'https://www.technion.ac.il/en/accessaility-statement/');
  await expect(technion.getByRole('link', { name: "The Technion's accessibility statement, in Hebrew", exact: true }))
    .toHaveAttribute('href', 'https://www.technion.ac.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/');
  await expect(technion.getByRole('link')).toHaveCount(2);
});

test('Accessibility says when the statement was last updated', async ({ page }) => {
  await expect(page.getByRole('main').getByText('This statement was last updated on 23 November 2026.')).toBeVisible();
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

test('opened at one of its sections, Accessibility keeps some room above that heading', async ({ page }) => {
  await page.goto('/accessibility/#report');
  const heading = page.getByRole('heading', { name: 'Report a problem', exact: true });
  await expect(heading).toBeInViewport();
  expect((await heading.boundingBox()).y).toBeGreaterThanOrEqual(16);
});
