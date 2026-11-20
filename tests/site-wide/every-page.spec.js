// Site-wide checks: every page in the sitemap, built from the real content, at
// every width in playwright.site.config.js. They hold for any content, so they
// assert nothing about what a page says: only that every visitor can reach and
// read it, on any screen, without the site contacting anyone else.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sitemapPaths } from '../../lib/build.js';
import { CHECKED_BUILD_DIR } from '../../playwright.site.config.js';
import { doubleEscaped } from '../support/double-escaped.js';

// axe's tags for the WCAG 2.0, 2.1 and 2.2 success criteria at levels A and AA.
const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

// A web address on a site other than `own` (an origin such as http://localhost:8282).
const isForeign = (url, own) => (url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== own;

// Any issue page of a repository in the Lab's GitHub organization.
const ISSUE_TRACKER = /^https?:\/\/(www\.)?github\.com\/Technion-Atlas-Lab\/[^/]+\/issues\b/i;

for (const path of sitemapPaths(CHECKED_BUILD_DIR)) {
  test.describe(path, () => {
    test('has no accessibility violations at WCAG 2.2 AA', async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
      const found = violations.map((v) => `${v.id} (${v.help}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(found).toEqual([]);
    });

    test('does not scroll sideways', async ({ page }) => {
      await page.goto(path);
      const width = page.viewportSize().width;
      // The page's full width, and the elements that stick out past the screen's edge.
      const { scrollWidth, wide } = await page.evaluate((screenWidth) => ({
        scrollWidth: document.documentElement.scrollWidth,
        wide: [...document.body.querySelectorAll('*')]
          .filter((el) => el.getBoundingClientRect().right > screenWidth + 1)
          .slice(0, 5)
          .map((el) => el.outerHTML.slice(0, 120)),
      }), width);
      expect(scrollWidth, `elements wider than the screen:\n${wide.join('\n')}`).toBeLessThanOrEqual(width);
    });

    test('makes no request to another origin', async ({ page, baseURL }) => {
      const own = new URL(baseURL).origin;
      const foreign = [];
      // Nothing may leave the machine, even when the check fails.
      await page.route((url) => isForeign(url, own), (route) => route.abort());
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (isForeign(url, own)) foreign.push(url.href);
      });
      // The content security policy stops most foreign requests before they
      // are made; an attempt it stops counts too.
      await page.addInitScript(() => {
        window.__blockedByPolicy = [];
        document.addEventListener('securitypolicyviolation', (e) => window.__blockedByPolicy.push(e.blockedURI));
      });
      // Wait until the network is quiet, so a late request is caught too.
      // eslint-disable-next-line playwright/no-networkidle -- the quiet network is what this check needs
      await page.goto(path, { waitUntil: 'networkidle' });
      const blocked = await page.evaluate(() => window.__blockedByPolicy);
      foreign.push(...blocked.filter((uri) => URL.canParse(uri) && isForeign(new URL(uri), own)));
      expect([...new Set(foreign)]).toEqual([]);
    });

    test('has no broken internal links or files', async ({ page, baseURL }) => {
      const own = new URL(baseURL).origin;
      const broken = [];
      page.on('response', (response) => {
        if (new URL(response.url()).origin === own && response.status() >= 400) {
          broken.push(`${response.url()} (${response.status()})`);
        }
      });
      await page.goto(path);
      const links = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.href));
      const internal = [...new Set(links)].filter((href) => new URL(href).origin === own);
      // Follow each link from the page, as the browser would, and read what it leads to.
      broken.push(...await page.evaluate((hrefs) => Promise.all(hrefs.map(async (href) => {
        const response = await fetch(href);
        if (!response.ok) return `${href} (${response.status})`;
        // A link that names a place on a page (#id) needs an element with that id there.
        const id = decodeURIComponent(new URL(href).hash.slice(1));
        if (!id) return null;
        const target = new DOMParser().parseFromString(await response.text(), 'text/html');
        return target.getElementById(id) ? null : `${href} (no element with id "${id}")`;
      })).then((problems) => problems.filter(Boolean)), internal));
      // A link's fetch is seen as a response too, so a broken link can be reported twice.
      expect([...new Set(broken)]).toEqual([]);
    });

    test('has exactly one main heading, inside the main content', async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveCount(1);
    });

    test('opens with a skip link that moves focus to the main content', async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press('Tab');
      const first = page.locator(':focus');
      await expect(first).toHaveRole('link');
      await expect(first).toHaveAttribute('href', /^#./);
      await page.keyboard.press('Enter');
      await expect(page.getByRole('main')).toBeFocused();
    });

    test('shows no character escaped twice', async ({ request }) => {
      expect(doubleEscaped(await (await request.get(path)).text())).toEqual([]);
    });

    test('has no link to the Lab\'s issue tracker', async ({ page }) => {
      // The new-issue link is given to the Lab directly. On the public site it
      // would invite anyone to file issues, and a Member to post a
      // personal-information request in public.
      await page.goto(path);
      const links = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.href));
      expect(links.filter((href) => ISSUE_TRACKER.test(href))).toEqual([]);
    });

    test('declares its language as English', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });
}
