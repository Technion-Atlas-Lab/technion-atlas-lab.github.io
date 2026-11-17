// Slice tests: build the site from the test content set (tests/content/),
// serve the build the way GitHub Pages does, and assert in a real browser.
// Real content (content/) never affects these tests.
import { defineConfig, devices } from '@playwright/test';

const PORT = 8181;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node tests/support/test-site.js ${PORT}`,
    url: `http://localhost:${PORT}/`,
    // Always build fresh: a server left running would serve a stale site.
    reuseExistingServer: false,
  },
});
