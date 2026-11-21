// The News page: every News item, newest first; a talk shows its recording
// link. Built from the News items in the test content set (tests/content/news/).
import { test, expect } from '@playwright/test';

// A News item, found by its title.
const item = (page, title) => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('News lists every News item, newest first, and same-day ones by title', async ({ page }) => {
  await page.goto('/news/');
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText([
    'The Lab Held Its Annual Retreat', // 2 June 2025
    'A Visit from Example University', // 14 March 2025; by file name it would come after the talk
    'Invited Talk at the Example Symposium', // 14 March 2025
    "The Lab's Paper Accepted & Awarded", // 5 November 2024
  ]);
});

test('a News item shows its date in words, and its body', async ({ page }) => {
  await page.goto('/news/');
  const talk = item(page, 'Invited Talk at the Example Symposium');
  await expect(talk.getByText('14 March 2025', { exact: true })).toBeVisible();
  // A machine reads the same date from the element.
  await expect(talk.getByRole('time')).toHaveAttribute('datetime', '2025-03-14');
  await expect(talk.getByRole('paragraph').filter({ hasText: 'spoke about' }))
    .toHaveText('Full Member spoke about containing tool-using agents.');
  await expect(talk.getByRole('paragraph').filter({ hasText: 'recorded' })).toHaveText('The talk was recorded.');
  await expect(item(page, "The Lab's Paper Accepted & Awarded").getByText('5 November 2024', { exact: true })).toBeVisible();
});

test('a talk is marked as one and links to its recording, named for the talk', async ({ page }) => {
  await page.goto('/news/');
  const talk = item(page, 'Invited Talk at the Example Symposium');
  await expect(talk.getByText('Talk', { exact: true })).toBeVisible();
  // The talk's title is in the link's name, so a screen reader's list of links tells one "Recording" from another.
  const recording = talk.getByRole('link', { name: 'Recording: Invited Talk at the Example Symposium', exact: true });
  await expect(recording).toHaveText('Recording');
  await expect(recording).toHaveAttribute('href', 'https://example.org/video/invited-talk');
});

test('a News item that is not a talk has no talk mark and no recording link', async ({ page }) => {
  await page.goto('/news/');
  const retreat = item(page, 'The Lab Held Its Annual Retreat');
  await expect(retreat).toHaveText(/^\s*The Lab Held Its Annual Retreat\s*2 June 2025\s*Two days of talks and planning in the Galilee\.\s*$/);
  await expect(retreat.getByRole('link')).toHaveCount(0);
});

test('a title reaches its News item as written, ampersand and apostrophe included', async ({ page }) => {
  await page.goto('/news/');
  await expect(item(page, "The Lab's Paper Accepted & Awarded").getByRole('heading'))
    .toHaveText("The Lab's Paper Accepted & Awarded");
});

test('News has no search or filter controls', async ({ page }) => {
  await page.goto('/news/');
  const main = page.getByRole('main');
  await expect(main.getByRole('article')).toHaveCount(4);
  for (const role of ['button', 'textbox', 'searchbox', 'combobox', 'checkbox', 'radio']) {
    await expect(main.getByRole(role)).toHaveCount(0);
  }
});

for (const width of [320, 390]) {
  test(`at ${width} px News does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/news/');
    await expect(page.getByRole('article')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

// The paragraph of a News item that names the people it involves.
const people = (newsItem) => newsItem.getByRole('paragraph').filter({ hasText: /^People:/ });

test('a News item names its related Members, in the order given; a Member links to their Profile, an Alumnus does not', async ({ page }) => {
  await page.goto('/news/');
  await expect(people(item(page, 'Invited Talk at the Example Symposium'))).toHaveText('People: Full Member, Prof. Test Director');
  const accepted = people(item(page, "The Lab's Paper Accepted & Awarded"));
  await expect(accepted).toHaveText('People: Full Member, Alumnus Example');
  await expect(accepted.getByRole('link')).toHaveText(['Full Member']);
  await expect(people(item(page, 'A Visit from Example University')).getByRole('link', { name: "Dr. Zoë O'Neil & Co" }))
    .toHaveAttribute('href', '/people/zoe-oneil/');
  await accepted.getByRole('link', { name: 'Full Member' }).click();
  await expect(page).toHaveURL('/people/full-member/');
});
