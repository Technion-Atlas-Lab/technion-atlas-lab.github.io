// Member photos: resized at build time and served with no embedded metadata,
// so a photo never reveals where or with what it was taken.
// The test content set's one photo, tests/content/members/full-member.jpg, is
// 1200 x 1600 px and carries camera, author and GPS metadata.
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import sharp from 'sharp';

// The widest photo the site serves: enough for a 14rem picture on a dense screen.
const WIDEST = 800;

// Every address a picture may be loaded from: its src and each srcset candidate.
const addressesOf = (img) => img.evaluate((el) => [...new Set(
  [el.getAttribute('src'), ...(el.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(/\s+/)[0])]
    .filter(Boolean))]);

const cardOf = (page, name) => page.getByRole('listitem').filter({ hasText: name });

test('the photo in the test content set does carry camera and location metadata', async () => {
  // Without this, the checks below would pass on a photo that had nothing to strip.
  const { exif, width, height } = await sharp(fs.readFileSync('tests/content/members/full-member.jpg')).metadata();
  expect(exif.includes('TestCam')).toBe(true);
  expect(exif.includes(Buffer.from([0x88, 0x25])) || exif.includes(Buffer.from([0x25, 0x88])), 'GPS block').toBe(true);
  expect([width, height]).toEqual([1200, 1600]);
});

test('a Member with a photo shows it on their card, in place of the initials avatar', async ({ page }) => {
  await page.goto('/people/');
  const card = cardOf(page, 'Full Member');
  // The card's photo is decoration beside the written name, so it has no role or name to find it by.
  await expect(card.locator('img')).toBeVisible();
  expect(await card.locator('img').evaluate((img) => img.decode().then(() => img.naturalWidth))).toBeGreaterThan(0);
  await expect(card.getByText('FM', { exact: true })).toHaveCount(0);
});

test('a Profile shows the Member\'s photo, named for a screen reader', async ({ page }) => {
  await page.goto('/people/full-member/');
  const photo = page.getByRole('main').getByRole('img', { name: 'Portrait of Full Member' });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((img) => img.decode().then(() => img.naturalWidth))).toBeGreaterThan(0);
});

test('a served photo is resized, square, and carries no embedded metadata', async ({ page, request }) => {
  await page.goto('/people/full-member/');
  const addresses = await addressesOf(page.getByRole('main').getByRole('img', { name: 'Portrait of Full Member' }));
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
    expect(served.width, address).toBeLessThanOrEqual(WIDEST);
    expect(served.height, address).toBe(served.width);
  }
});

test('the photo as it was committed is not published', async ({ request }) => {
  for (const address of ['/members/full-member.jpg', '/people/full-member.jpg', '/photos/full-member.jpg', '/full-member.jpg']) {
    expect((await request.get(address)).status(), address).toBe(404);
  }
});

test.describe('on a narrow, dense phone screen', () => {
  // One card across at this width, so the photo is drawn at its widest.
  test.use({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 2 });

  test('the card loads a photo with enough pixels for the size it is drawn at', async ({ page }) => {
    await page.goto('/people/');
    const photo = cardOf(page, 'Full Member').locator('img');
    await expect(photo).toBeVisible();
    const { drawn, loaded } = await photo.evaluate(async (img) => {
      await img.decode();
      const file = new Image();
      file.src = img.currentSrc;
      await file.decode();
      return { drawn: img.getBoundingClientRect().width * devicePixelRatio, loaded: file.naturalWidth };
    });
    expect(loaded).toBeGreaterThanOrEqual(drawn);
  });
});
