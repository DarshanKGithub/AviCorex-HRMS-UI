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

test.describe('Payroll End-to-End', () => {
  test('should display Payslips page correctly', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Payslips
    await page.goto(`${base}/payroll/payslips`);

    // Verify header
    await expect(page.getByRole('heading', { name: 'My Payslips' })).toBeVisible();
    
    // The payslips table might be empty or populated depending on seeding,
    // so we just verify the headers exist or the empty state exists
    const tableHeader = page.getByRole('cell', { name: 'Gross Salary' });
    const emptyState = page.getByText('No payslips found.');

    const isTableVisible = await tableHeader.isVisible();
    const isEmptyVisible = await emptyState.isVisible();
    
    expect(isTableVisible || isEmptyVisible).toBeTruthy();
  });
});
