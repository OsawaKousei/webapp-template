import { expect, test } from '@playwright/test';

test('dashboard renders and demo counter increments', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Frontend Workspace Rebuild Starter' }),
  ).toBeVisible();

  await expect(page.getByText('Result: 12 / 3 = 4.00')).toBeVisible();

  await page.getByRole('button', { name: 'Increment' }).click();

  await expect(page.getByText('Result: 13 / 3 = 4.33')).toBeVisible();
});
