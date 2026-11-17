import { test, expect } from '@playwright/test';

test('Home shows the Lab name as its main heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ATLAS Lab');
});
