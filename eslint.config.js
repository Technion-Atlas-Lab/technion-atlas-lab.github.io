// The lint (npm run lint): catches bugs in the code itself, such as a typo'd
// or unused variable, unreachable code, or a test assertion missing its
// `await` (which never runs, so the test passes whatever the page shows).
// Formatting is not checked.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default defineConfig([
  // Built sites and test output hold copies of src/, not code of their own.
  globalIgnores(['_site/', '.test-site/', '.test-site-broken/', '.site-check/', '.site-shots/', '.shots/',
    'test-results/', 'test-results-site/', 'playwright-report/', 'playwright-report-site/']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.js'],
    ignores: ['src/assets/**'],
    languageOptions: { globals: globals.node },
  },
  // The site's own script runs in the visitor's browser.
  {
    files: ['src/assets/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['tests/**/*.spec.js'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Blank lines are formatting, which the lint leaves alone.
      'playwright/consistent-spacing-between-blocks': 'off',
    },
    // Callbacks passed to page.evaluate() run in the browser.
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
]);
