import { test, expect } from '@playwright/test';

const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
const adminEmail = 'admin@hrms.com';
const adminPassword = 'Hrms@12345';

// Helper: login as admin
async function loginAsAdmin(page: any) {
  await page.goto(`${base}/login`);
  await page.getByRole('button', { name: 'Admin' }).click();
  await page.getByLabel('Work email').fill(adminEmail);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
}

test.describe('Leave Management End-to-End', () => {
  test('should display Leave Balances page correctly', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Leave Balances
    await page.goto(`${base}/leaves/balances`);

    // Verify header and UI elements
    await expect(page.getByRole('heading', { name: 'Leave Balances' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
    
    // Check that we have a year selector
    await expect(page.getByRole('combobox')).toBeVisible();

    // Verify card structure elements exist
    const balanceTexts = await page.getByText('Balance').all();
    if (balanceTexts.length > 0) {
       await expect(balanceTexts[0]).toBeVisible();
    }
  });
});
