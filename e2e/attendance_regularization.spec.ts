import { test, expect } from '@playwright/test';

const base = process.env.E2E_BASE_URL;
const adminEmail = 'admin@hrms.com';
const adminPassword = 'Hrms@12345';

async function loginAsAdmin(page: any) {
  await page.goto(`${base}/login`);
  await page.getByRole('button', { name: 'Admin' }).click();
  await page.getByLabel('Work email').fill(adminEmail);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
}

test.describe('Advanced Attendance End-to-End', () => {
  test('should allow creating and viewing an attendance regularization request', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Attendance Info
    await page.goto(`${base}/attendance/info`);

    // Click on My Regularizations tab
    await page.getByRole('tab', { name: 'My Regularizations' }).click();

    // Ensure we are on the Apply subtab
    await page.getByRole('button', { name: 'Apply' }).click();

    // Click "New Regularization"
    await page.getByRole('button', { name: 'New Regularization' }).click();

    // Fill the modal form
    const testDate = '2026-05-10';
    await page.getByLabel('Date').fill(testDate);
    await page.getByLabel('Reason').fill('Forgot to clock in due to network issue');
    await page.getByLabel('Requested Check-In (Optional)').fill('09:00');
    
    // Submit
    await page.getByRole('button', { name: 'Submit Request' }).click();

    // The component automatically switches to the 'Pending' tab on successful submit.
    // Wait for the table to load the new item
    await expect(page.getByRole('cell', { name: testDate }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Forgot to clock in due to network issue' }).first()).toBeVisible();
    await expect(page.getByRole('table').getByText('Pending').first()).toBeVisible();
  });
});
