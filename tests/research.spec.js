// The Research page: one section per Research Area, and under each a card per
// Publication, newest first. Built from the Research Areas and Publications in
// the test content set (tests/content/research-areas/, tests/content/publications/).
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const LONG_NAME = 'Maximiliana Alexandrina Wolfeschlegelsteinhausenbergerdorff-Featherstonehaugh de la Fuente y Montgomery the Third';

// A Research Area: the part of the page under that area's heading.
const area = (page, name) => page.getByRole('region', { name, exact: true });
// A Publication's card, found by its title.
const card = (page, title) => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('Research shows one section per Research Area, in the areas\' set order', async ({ page }) => {
  await page.goto('/research/');
  // By file name, Formal Methods would come second.
  await expect(page.getByRole('main').getByRole('heading', { level: 2 }))
    .toHaveText(['AI Agent Security', 'Trusted Hardware', 'Formal Methods']);
});

test('each Research Area shows its description', async ({ page }) => {
  await page.goto('/research/');
  await expect(area(page, 'AI Agent Security').getByRole('paragraph').first())
    .toHaveText('How AI agents are attacked, and how to contain them. A second sentence of the description.');
  await expect(area(page, 'Trusted Hardware').getByRole('paragraph').first())
    .toHaveText('Hardware that software can trust, from enclaves to attestation.');
});

test('a Research Area with no Publications still shows its heading and description', async ({ page }) => {
  await page.goto('/research/');
  const empty = area(page, 'Formal Methods');
  await expect(empty.getByRole('heading', { level: 2 })).toHaveText('Formal Methods');
  await expect(empty.getByRole('paragraph'))
    .toHaveText(['Proving that systems do what they claim. Nothing is published here yet.']);
  await expect(empty.getByRole('article')).toHaveCount(0);
});

test('each Research Area has a stable anchor that leads to its section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('/research/#trusted-hardware');
  await expect(page.getByRole('heading', { name: 'Trusted Hardware', level: 2 })).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'AI Agent Security', level: 2 })).not.toBeInViewport();
  await page.goto('/research/#formal-methods');
  await expect(page.getByRole('heading', { name: 'Formal Methods', level: 2 })).toBeInViewport();
});

test('a Research Area lists its Publications newest first, and same-year ones by title', async ({ page }) => {
  await page.goto('/research/');
  await expect(area(page, 'AI Agent Security').getByRole('heading', { level: 3 })).toHaveText([
    'A Survey of Prompt Injection & Its Defences', // 2025
    'Sandbox Escapes in Tool-Using Agents', // 2024
    'Early Work on Agent Isolation', // 2022
  ]);
  // Both 2023; by file name the other would come first.
  await expect(area(page, 'Trusted Hardware').getByRole('heading', { level: 3 }))
    .toHaveText(['Auditing Side Channels', 'Zero-Trust Attestation for Enclaves']);
});

test('a card shows the authors in order, then the venue and year', async ({ page }) => {
  await page.goto('/research/');
  const sandbox = card(page, 'Sandbox Escapes in Tool-Using Agents');
  await expect(sandbox.getByRole('paragraph').filter({ hasText: 'Casey Collaborator' }))
    .toHaveText('Full Member, Alumnus Example, Casey Collaborator, Prof. Test Director');
  await expect(sandbox.getByText('Example Security Symposium, 2024', { exact: true })).toBeVisible();
});

test('an author who is a Member links to their Profile; an Alumnus and a Collaborator are named without a link', async ({ page }) => {
  await page.goto('/research/');
  const authors = card(page, 'Sandbox Escapes in Tool-Using Agents').getByRole('paragraph').filter({ hasText: 'Casey Collaborator' });
  await expect(authors.getByRole('link')).toHaveText(['Full Member', 'Prof. Test Director']);
  await authors.getByRole('link', { name: 'Full Member' }).click();
  await expect(page).toHaveURL('/people/full-member/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Full Member');
});

test('a Preprint is badged, and a published Publication is not', async ({ page }) => {
  await page.goto('/research/');
  await expect(card(page, 'A Survey of Prompt Injection & Its Defences').getByText('Preprint', { exact: true })).toBeVisible();
  await expect(card(page, 'Sandbox Escapes in Tool-Using Agents')).toBeVisible();
  await expect(card(page, 'Sandbox Escapes in Tool-Using Agents').getByText('Preprint', { exact: true })).toHaveCount(0);
});

test('a card links to the paper, PDF, arXiv, code and video it has, each named for its Publication', async ({ page }) => {
  await page.goto('/research/');
  const links = card(page, 'Sandbox Escapes in Tool-Using Agents').getByRole('list').getByRole('link');
  // The Publication's title is in each link's name, so a screen reader's list of links tells one "Paper" from another.
  await expect(links).toHaveText(['Paper', 'PDF', 'arXiv', 'Code', 'Video']);
  for (const [i, label] of ['Paper', 'PDF', 'arXiv', 'Code', 'Video'].entries()) {
    await expect(links.nth(i)).toHaveAccessibleName(`${label}: Sandbox Escapes in Tool-Using Agents`);
  }
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    'https://doi.org/10.5555/example.2024%23001%3Fa',
    'https://example.org/papers/sandbox-escapes.pdf',
    'https://arxiv.example.org/abs/2401.00001',
    'https://example.org/code/sandbox-escapes',
    'https://example.org/video/sandbox-escapes',
  ]);
});

test('a card shows only the links its Publication has', async ({ page }) => {
  await page.goto('/research/');
  // A paper link in place of a DOI.
  const early = card(page, 'Early Work on Agent Isolation').getByRole('list').getByRole('link');
  await expect(early).toHaveAccessibleName('Paper: Early Work on Agent Isolation');
  await expect(early).toHaveAttribute('href', 'https://example.org/papers/early-agents');
  await expect(card(page, 'A Survey of Prompt Injection & Its Defences').getByRole('list').getByRole('link'))
    .toHaveAccessibleName('arXiv: A Survey of Prompt Injection & Its Defences');
  // No link at all: no empty list is left behind.
  const bare = card(page, 'Auditing Side Channels');
  await expect(bare).toBeVisible();
  await expect(bare.getByRole('list')).toHaveCount(0);
  // Its one link is its author's Profile.
  await expect(bare.getByRole('link')).toHaveText(['Prof. Test Director']);
});

test('a card shows its Publication\'s summary and figure when it has them', async ({ page }) => {
  await page.goto('/research/');
  const sandbox = card(page, 'Sandbox Escapes in Tool-Using Agents');
  await expect(sandbox.getByText('We show how an agent that may call tools can leave its sandbox, and how to stop it.', { exact: true }))
    .toBeVisible();
  const figure = sandbox.getByRole('img', { name: 'Diagram of an agent leaving its sandbox through a tool call.' });
  await figure.scrollIntoViewIfNeeded();
  expect(await figure.evaluate((img) => img.decode().then(() => img.naturalWidth))).toBeGreaterThan(0);
  // Without them: the title, the authors, the venue and year, and nothing more.
  const bare = card(page, 'Auditing Side Channels');
  await expect(bare).toHaveText(/^\s*Auditing Side Channels\s*Prof\. Test Director\s*Example Hardware Conference, 2023\s*$/);
  await expect(bare.getByRole('img')).toHaveCount(0);
});

test('Research has no search or filter controls', async ({ page }) => {
  await page.goto('/research/');
  const main = page.getByRole('main');
  await expect(main.getByRole('article')).toHaveCount(5);
  for (const role of ['button', 'textbox', 'searchbox', 'combobox', 'checkbox', 'radio']) {
    await expect(main.getByRole(role)).toHaveCount(0);
  }
});

test('a title and a name reach their card as written, ampersand and apostrophe included', async ({ page }) => {
  await page.goto('/research/');
  const survey = card(page, 'A Survey of Prompt Injection & Its Defences');
  await expect(survey.getByRole('heading')).toHaveText('A Survey of Prompt Injection & Its Defences');
  await expect(survey.getByRole('link', { name: "Dr. Zoë O'Neil & Co" })).toHaveAttribute('href', '/people/zoe-oneil/');
});

for (const width of [320, 390]) {
  test(`at ${width} px a very long author name wraps inside its card`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/research/');
    const early = card(page, 'Early Work on Agent Isolation');
    const box = await early.boundingBox();
    const name = await early.getByRole('link', { name: LONG_NAME }).boundingBox();
    expect(name.x).toBeGreaterThanOrEqual(box.x);
    expect(name.x + name.width).toBeLessThanOrEqual(box.x + box.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

// The test content set's one figure, tests/content/publications/sandbox-escapes.jpg,
// is 1600 x 900 px and names a camera and a photographer in its metadata.
test('a served figure is resized, keeps its shape, and carries no embedded metadata', async ({ page, request }) => {
  const committed = await sharp(fs.readFileSync('tests/content/publications/sandbox-escapes.jpg')).metadata();
  // Without this, the checks below would pass on a figure that had nothing to strip.
  expect(committed.exif.includes('TestCam')).toBe(true);
  expect([committed.width, committed.height]).toEqual([1600, 900]);

  await page.goto('/research/');
  const figure = page.getByRole('img', { name: 'Diagram of an agent leaving its sandbox through a tool call.' });
  const addresses = await figure.evaluate((el) => [...new Set(
    [el.getAttribute('src'), ...(el.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(/\s+/)[0])]
      .filter(Boolean))]);
  expect(addresses.length).toBeGreaterThan(0);
  for (const address of addresses) {
    const response = await request.get(address);
    expect(response.ok(), address).toBe(true);
    const bytes = await response.body();
    const served = await sharp(bytes).metadata();
    for (const block of ['exif', 'icc', 'iptc', 'xmp', 'tifftagPhotoshop', 'comments']) {
      expect(served[block], `${address} carries ${block}`).toBeUndefined();
    }
    expect(bytes.includes('TestCam'), `${address} names the camera`).toBe(false);
    expect(bytes.includes('Test Photographer'), `${address} names the photographer`).toBe(false);
    expect(served.width, address).toBeLessThanOrEqual(800);
    expect(served.width / served.height, address).toBeCloseTo(16 / 9, 1);
  }
});

test('the figure as it was committed is not published', async ({ request }) => {
  for (const address of ['/publications/sandbox-escapes.jpg', '/research/sandbox-escapes.jpg', '/figures/sandbox-escapes.jpg', '/sandbox-escapes.jpg']) {
    expect((await request.get(address)).status(), address).toBe(404);
  }
});

test('a Research Area opened by its anchor has room above its heading', async ({ page }) => {
  // Flush against the top edge of the window, the heading reads as cut off.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/research/#trusted-hardware');
  const heading = page.getByRole('heading', { name: 'Trusted Hardware', level: 2 });
  await expect(heading).toBeInViewport();
  expect((await heading.boundingBox()).y).toBeGreaterThanOrEqual(16);
});
