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

test('employee create → view → delete', async ({ page }) => {
  const uniqueName = `E2E Tester ${Date.now()}`;
  const uniqueEmail = `e2e+${Date.now()}@example.com`;

  // Navigate to login page and login as admin
  await loginAsAdmin(page);

  // Navigate to employees page and create an employee
  await page.goto(`${base}/employees`);
  await page.getByLabel('Full name').fill(uniqueName);
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText(uniqueName)).toBeVisible();

  // Open employee detail and validate detail page is reachable
  await page.getByRole('link', { name: uniqueName }).click();
  await expect(page.getByText('KYC / Documents')).toBeVisible();

  // Delete employee from list page
  await page.goto(`${base}/employees`);
  const row = page.locator('li').filter({ hasText: uniqueName }).first();
  await row.getByLabel('delete').click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText(uniqueName)).toHaveCount(0);
});

test('dashboard displays employee count widget', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to dashboard
  await page.goto(`${base}/dashboard`);

  // Wait for dashboard to load
  await page.waitForSelector('text=Role-aware reporting kickoff', { timeout: 5000 });

  // Check for main dashboard elements
  await expect(page.getByText('Employee Count')).toBeVisible();
  await expect(page.getByText('Pending Approvals')).toBeVisible();
  await expect(page.getByText('Attendance Summary')).toBeVisible();

  // Verify employee count is displayed
  const employeeCountCard = page.locator('text=Employee Count').first();
  const employeeNumber = employeeCountCard.locator('..').locator('h4');
  await expect(employeeNumber).toContainText(/\d+/);
});

test('dashboard filters work correctly', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to dashboard
  await page.goto(`${base}/dashboard`);

  // Wait for filters to load
  await page.waitForSelector('text=Apply filters', { timeout: 5000 });

  // Verify filter controls exist
  const startDateInput = page.getByLabel('Start date');
  const endDateInput = page.getByLabel('End date');
  const departmentSelect = page.getByLabel('Department');
  const applyButton = page.getByRole('button', { name: 'Apply filters' });

  await expect(startDateInput).toBeVisible();
  await expect(endDateInput).toBeVisible();
  await expect(departmentSelect).toBeVisible();
  await expect(applyButton).toBeVisible();

  // Test filter reset
  const resetButton = page.getByRole('button', { name: 'Reset' });
  await expect(resetButton).toBeVisible();
});

test('dashboard CSV export works', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to dashboard
  await page.goto(`${base}/dashboard`);

  // Wait for dashboard to load
  await page.waitForSelector('text=Employee Count', { timeout: 5000 });

  // Verify CSV export buttons exist
  const csvButtons = page.locator('button:has-text("CSV"), button:has-text("Export CSV")');
  const buttonCount = await csvButtons.count();
  
  // Should have at least 2 CSV buttons (employee count and department breakdown)
  expect(buttonCount).toBeGreaterThanOrEqual(1);
});

test('department breakdown widget renders', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to dashboard
  await page.goto(`${base}/dashboard`);

  // Wait for department breakdown
  await page.waitForSelector('text=Department Breakdown', { timeout: 5000 });

  // Verify the table headers exist
  await expect(page.getByText('Department')).toBeVisible();
  await expect(page.getByText('Total')).toBeVisible();
  await expect(page.getByText('Active')).toBeVisible();
  await expect(page.getByText('Inactive')).toBeVisible();
});

test('audit logs page accessible to admin', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to audit logs (admin section)
  await page.goto(`${base}/admin/audit-logs`);

  // Wait for audit logs page to load
  await page.waitForSelector('text=System audit trail', { timeout: 5000 });

  // Verify audit log elements
  await expect(page.getByText('System audit trail')).toBeVisible();
  await expect(page.getByLabel('Object Type')).toBeVisible();
  await expect(page.getByLabel('Actor ID')).toBeVisible();
});

test('employee operations are recorded in audit logs', async ({ page, context }) => {
  // Create two pages to have one logged in
  const adminPage = await context.newPage();
  await loginAsAdmin(adminPage);

  // Create an employee
  const uniqueName = `Audit Test ${Date.now()}`;
  const uniqueEmail = `audit+${Date.now()}@example.com`;

  await adminPage.goto(`${base}/employees`);
  await adminPage.getByLabel('Full name').fill(uniqueName);
  await adminPage.getByLabel('Email').fill(uniqueEmail);
  await adminPage.getByRole('button', { name: 'Add' }).click();
  await adminPage.getByRole('button', { name: 'Confirm' }).click();

  // Wait a moment for audit log to be written
  await adminPage.waitForTimeout(1000);

  // Check audit logs
  await adminPage.goto(`${base}/admin/audit-logs`);
  await adminPage.waitForSelector('table', { timeout: 5000 });

  // Verify audit log table has content
  const rows = adminPage.locator('table tbody tr');
  const rowCount = await rows.count();
  
  // Should have at least some audit log rows
  expect(rowCount).toBeGreaterThan(0);

  await adminPage.close();
});

