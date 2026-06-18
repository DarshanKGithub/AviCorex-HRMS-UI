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

test.describe('Helpdesk End-to-End', () => {
  test('should allow creating and viewing a helpdesk ticket', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Helpdesk
    await page.goto(`${base}/helpdesk`);

    // Verify page header
    await expect(page.getByRole('heading', { name: 'My Helpdesk Tickets' })).toBeVisible();

    // Click "Create New Ticket"
    await page.getByRole('button', { name: 'Create New Ticket' }).click();

    // Fill the modal form
    await page.getByLabel('Subject').fill('Laptop Battery Replacement');
    await page.getByLabel('Description').fill('My laptop battery drains in 10 minutes.');
    
    // Select IT category
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: 'IT' }).click();

    // Select High priority
    await page.getByLabel('Priority').click();
    await page.getByRole('option', { name: 'High' }).click();

    // Submit
    await page.getByRole('button', { name: 'Submit Ticket' }).click();

    // Wait for the modal to close and the table to update
    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify the new ticket is in the table
    await expect(page.getByRole('cell', { name: 'Laptop Battery Replacement' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'IT' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'High' }).first()).toBeVisible();
    await expect(page.getByRole('table').getByText('Open').first()).toBeVisible();
  });
});
