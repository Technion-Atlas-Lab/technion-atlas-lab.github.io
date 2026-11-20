// A Member's Profile page: who they are, and only the fields they shared.
// Built from the Members in the test content set (tests/content/members/).
import { test, expect } from '@playwright/test';

const LONG_NAME = 'Maximiliana Alexandrina Wolfeschlegelsteinhausenbergerdorff-Featherstonehaugh de la Fuente y Montgomery the Third';

test('a Member card on People opens that Member\'s Profile', async ({ page }) => {
  await page.goto('/people/');
  await page.getByRole('link', { name: 'Full Member', exact: true }).click();
  await expect(page).toHaveURL('/people/full-member/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Full Member');
});

test('a Profile shows the role, bio and research interests', async ({ page }) => {
  await page.goto('/people/full-member/');
  const main = page.getByRole('main');
  await expect(main.getByText('PhD Student', { exact: true })).toBeVisible();
  await expect(main.getByRole('paragraph').filter({ hasText: 'studies how AI agents fail' }))
    .toHaveText('Full Member studies how AI agents fail under attack.');
  await expect(main.getByRole('paragraph').filter({ hasText: 'built compilers' }))
    .toHaveText('Before joining the Lab, Full built compilers.');
  const interests = main.getByRole('region', { name: 'Research interests' });
  await expect(interests.getByRole('listitem')).toHaveText(['Agent sandboxing', 'Prompt injection']);
});

test('a Profile shows every contact field present, each a working link', async ({ page }) => {
  await page.goto('/people/full-member/');
  const contact = page.getByRole('region', { name: 'Contact details' });
  await expect(contact.getByRole('link', { name: 'full.member@example.org' }))
    .toHaveAttribute('href', 'mailto:full.member@example.org');
  await expect(contact.getByRole('link', { name: '+972 4 000 0000' })).toHaveAttribute('href', 'tel:+97240000000');
  await expect(contact.getByRole('link', { name: '0000-0002-1825-0097' }))
    .toHaveAttribute('href', 'https://orcid.org/0000-0002-1825-0097');
  await expect(contact.getByRole('term')).toHaveText(['Email', 'Phone', 'ORCID iD']);
});

test('a Profile shows the Member\'s links', async ({ page }) => {
  await page.goto('/people/full-member/');
  const links = page.getByRole('region', { name: 'Links' }).getByRole('link');
  await expect(links).toHaveText(['Google Scholar', 'DBLP', 'GitHub', 'LinkedIn', 'Personal site']);
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    'https://example.org/scholar/full-member',
    'https://example.org/dblp/full-member',
    'https://example.org/github/full-member',
    'https://example.org/linkedin/full-member',
    'https://full-member.example.org/',
  ]);
});

test('a Profile with no optional field shows the name, role and initials avatar, and no empty labels', async ({ page }) => {
  await page.goto('/people/bare-member/');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Bare Member');
  await expect(main.getByText('MSc Student', { exact: true })).toBeVisible();
  await expect(main.getByText('BM', { exact: true })).toBeVisible();
  // Nothing but the name is a heading, and there is no label or list for a field that is absent.
  await expect(main.getByRole('heading')).toHaveCount(1);
  for (const role of ['term', 'definition', 'list', 'listitem']) await expect(main.getByRole(role)).toHaveCount(0);
  for (const label of ['Research interests', 'Contact', 'Links', 'Email', 'Phone', 'ORCID']) {
    await expect(main.getByText(label)).toHaveCount(0);
  }
});

test('a Profile leads back to People', async ({ page }) => {
  await page.goto('/people/bare-member/');
  await page.getByRole('main').getByRole('link', { name: 'All people' }).click();
  await expect(page).toHaveURL('/people/');
});

test('a Profile has a title and description of its own, and is in the sitemap', async ({ page, request }) => {
  await page.goto('/people/full-member/');
  await expect(page).toHaveTitle('Full Member · ATLAS Lab');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Full Member, PhD Student at ATLAS Lab.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://test-site.example.org/people/full-member/');
  expect(await (await request.get('/sitemap.xml')).text()).toContain('<loc>https://test-site.example.org/people/full-member/</loc>');
});

test('an Alumnus has no Profile page', async ({ request }) => {
  expect((await request.get('/people/alumnus-example/')).status()).toBe(404);
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('alumnus-example');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a Profile with a very long name does not scroll sideways', async ({ page }) => {
    await page.goto('/people/maximiliana/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(LONG_NAME);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test('on a Profile the menu marks People as the section the visitor is in', async ({ page }) => {
  await page.goto('/people/full-member/');
  const menu = page.getByRole('navigation', { name: 'Main' });
  // Not "the current page": that is the Profile itself, which the menu does not list.
  await expect(menu.locator('[aria-current]')).toHaveText(['People']);
  await expect(menu.getByRole('link', { name: 'People', exact: true })).toHaveAttribute('aria-current', 'true');
  // It looks the same as the current page's item does on People.
  const look = (link) => link.evaluate((a) => {
    const { color, fontWeight, borderBottomColor } = getComputedStyle(a);
    return { color, fontWeight, borderBottomColor };
  });
  const onProfile = await look(menu.getByRole('link', { name: 'People', exact: true }));
  await page.goto('/people/');
  expect(onProfile).toEqual(await look(menu.getByRole('link', { name: 'People', exact: true })));
});

test('a name with an apostrophe and an ampersand reaches the Profile as written', async ({ page }) => {
  await page.goto('/people/zoe-oneil/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Dr. Zoë O'Neil & Co");
  await expect(page).toHaveTitle("Dr. Zoë O'Neil & Co · ATLAS Lab");
  await expect(page.locator('meta[name="description"]'))
    .toHaveAttribute('content', "Dr. Zoë O'Neil & Co, Research Staff at ATLAS Lab.");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', "Dr. Zoë O'Neil & Co · ATLAS Lab");
});

test('no two headings on a Profile read the same', async ({ page }) => {
  // A screen reader's list of headings must tell the Member's contact details from the Lab's in the footer.
  await page.goto('/people/full-member/');
  const headings = await page.getByRole('heading').allTextContents();
  expect(new Set(headings).size).toBe(headings.length);
});

test.describe('on a narrow phone', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test('the contact fields are all laid out alike, each value under its label', async ({ page }) => {
    await page.goto('/people/full-member/');
    const contact = page.getByRole('region', { name: 'Contact details' });
    const labels = await contact.getByRole('term').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
    const values = await contact.getByRole('definition').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
    expect(values).toHaveLength(3);
    for (const [i, value] of values.entries()) {
      expect(value.top, `value ${i + 1} sits under its label`).toBeGreaterThanOrEqual(labels[i].bottom);
      expect(value.left).toBe(labels[i].left);
    }
  });
});
