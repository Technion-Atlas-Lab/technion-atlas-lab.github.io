// Site-wide checks (npm run test:site): build the site from the real content
// (content/), serve the build the way GitHub Pages does, and check every page
// in the sitemap for accessibility, mobile layout and privacy, at phone, tablet
// and desktop widths, plus iPhone Safari's engine at phone width.
import { defineConfig, devices } from '@playwright/test';

const PORT = 8282;

// Where the build goes; tests/site-wide/ reads the sitemap from here.
export const CHECKED_BUILD_DIR = '.builds/site-check';

const chromiumAt = (width) => ({
  name: `chromium-${width}`,
  use: { ...devices['Desktop Chrome'], viewport: { width, height: 900 } },
});

export default defineConfig({
  testDir: 'tests/site-wide',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-site' }]] : 'dot',
  outputDir: 'test-results-site',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    chromiumAt(390),
    chromiumAt(768),
    chromiumAt(1280),
    // An iPhone 13 is 390 px wide.
    { name: 'webkit-390', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: `node tests/support/build-and-serve.js ${PORT} content ${CHECKED_BUILD_DIR}`,
    url: `http://localhost:${PORT}/`,
    // Always build fresh: a server left running would serve a stale site.
    reuseExistingServer: false,
  },
});
