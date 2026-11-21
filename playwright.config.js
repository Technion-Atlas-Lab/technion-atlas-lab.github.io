// Slice tests: build the site from the test content set (tests/content/),
// serve the build the way GitHub Pages does, and assert in a real browser.
// Real content (content/) never affects these tests.
import { defineConfig, devices } from '@playwright/test';

const PORT = 8181;

export default defineConfig({
  testDir: 'tests',
  // The site-wide checks have their own config (playwright.site.config.js).
  testIgnore: 'site-wide/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Off CI, one dot per passing test: a run's output is then its failures, not a line per pass.
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'dot',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // An action on an element that is not there (a click, a measurement) gives
    // up after 5 s, as an assertion does, instead of the test's full 30 s: the
    // pages are static, so waiting longer only slows a failing run.
    actionTimeout: 5000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node tests/support/build-and-serve.js ${PORT} tests/content .builds/test`,
    url: `http://localhost:${PORT}/`,
    // Always build fresh: a server left running would serve a stale site.
    reuseExistingServer: false,
  },
});
