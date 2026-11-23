// Home: the banner with the Lab's name and mission, the Research Areas, the
// latest News, the featured Publications and the way to Positions. Built from
// the test content set (tests/content/).
import { test, expect } from '@playwright/test';
import { backgroundBehind } from './support/background.js';

// A section of Home, found by its heading.
const section = (page, name) => page.getByRole('main').getByRole('region', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Home shows the Lab name as its main heading', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ATLAS Lab');
});

test('Home opens with the Lab name and mission on a banner in the footer\'s navy', async ({ page }) => {
  const heading = page.getByRole('main').getByRole('heading', { level: 1 });
  const mission = page.getByRole('main').getByText('Test mission line for the slice tests.', { exact: true });
  await expect(mission).toBeVisible();
  const navy = await backgroundBehind(page.getByRole('contentinfo'));
  expect(await backgroundBehind(heading)).toBe(navy);
  expect(await backgroundBehind(mission)).toBe(navy);
  // The mission comes straight after the name, before any section.
  await expect(page.getByRole('main')).toHaveText(/^\s*ATLAS Lab\s*Test mission line for the slice tests\./);
});

test('the banner is static: nothing on Home is animated', async ({ page }) => {
  await expect(page.getByRole('main').getByText('Test mission line for the slice tests.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('Home lists the Research Areas in their set order, each with its description', async ({ page }) => {
  const areas = section(page, 'Research Areas');
  // By file name, Formal Methods would come second.
  await expect(areas.getByRole('heading', { level: 3 })).toHaveText(['AI Agent Security', 'Trusted Hardware', 'Formal Methods']);
  await expect(areas.getByText('Hardware that software can trust, from enclaves to attestation.', { exact: true })).toBeVisible();
});

for (const [name, address] of [
  ['AI Agent Security', '/research/#agent-security'],
  ['Trusted Hardware', '/research/#trusted-hardware'],
  ['Formal Methods', '/research/#formal-methods'],
]) {
  test(`the Research Area "${name}" leads to its section of Research`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await section(page, 'Research Areas').getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(address);
    await expect(page.getByRole('heading', { name, level: 2 })).toBeInViewport();
  });
}

test('Home shows the 3 latest News items, newest first', async ({ page }) => {
  const news = section(page, 'Latest News');
  // The fourth and oldest, "The Lab's Paper Accepted & Awarded", is left out.
  await expect(news.getByRole('article').getByRole('heading')).toHaveText([
    'The Lab Held Its Annual Retreat', // 2 June 2025
    'A Visit from Example University', // 14 March 2025
    'Invited Talk at the Example Symposium', // 14 March 2025
  ]);
  await expect(news.getByRole('article').first().getByText('2 June 2025', { exact: true })).toBeVisible();
});

test('the latest News leads to the News page', async ({ page }) => {
  await section(page, 'Latest News').getByRole('link', { name: 'All News', exact: true }).click();
  await expect(page).toHaveURL('/news/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('News');
});

test('Home shows only the featured Publications', async ({ page }) => {
  const featured = section(page, 'Featured Publications');
  // One of the five Publications is featured.
  await expect(featured.getByRole('article').getByRole('heading')).toHaveText(['Sandbox Escapes in Tool-Using Agents']);
  await expect(page.getByRole('main').getByText('Early Work on Agent Isolation')).toHaveCount(0);
  await expect(page.getByRole('main').getByText('A Survey of Prompt Injection & Its Defences')).toHaveCount(0);
});

test('a featured Publication leads to its Research Area, and the section to every Publication', async ({ page }) => {
  const featured = section(page, 'Featured Publications');
  await expect(featured.getByRole('article').getByRole('link', { name: 'AI Agent Security', exact: true }))
    .toHaveAttribute('href', '/research/#agent-security');
  await featured.getByRole('link', { name: 'All Publications', exact: true }).click();
  await expect(page).toHaveURL('/research/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research');
});

test('a call-to-action band leads to Positions', async ({ page }) => {
  const band = section(page, 'Join the Lab');
  await expect(band.getByRole('paragraph').first())
    .toHaveText('We are always glad to hear from strong students, in the test content set too.');
  // The band stands out from the page: it is on the footer's navy.
  expect(await backgroundBehind(band.getByRole('heading'))).toBe(await backgroundBehind(page.getByRole('contentinfo')));
  await band.getByRole('link', { name: 'See Positions', exact: true }).click();
  await expect(page).toHaveURL('/positions/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Positions');
});

test('Home\'s sections come in order under the Lab name', async ({ page }) => {
  await expect(page.getByRole('main').getByRole('heading', { level: 2 }))
    .toHaveText(['Research Areas', 'Latest News', 'Featured Publications', 'Join the Lab']);
});

for (const width of [320, 390, 768]) {
  test(`at ${width} px Home does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(section(page, 'Join the Lab')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('a Research Area card leads to its section from its very edge, the coloured top border included', async ({ page }) => {
  const card = section(page, 'Research Areas').getByRole('listitem').filter({ hasText: 'Trusted Hardware' });
  const box = await card.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + 1);
  await expect(page).toHaveURL('/research/#trusted-hardware');
});
