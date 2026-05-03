# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/employee.spec.ts >> employee operations are recorded in audit logs
- Location: e2e/employee.spec.ts:137:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Admin' })

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  4   | const adminEmail = 'admin@hrms.com';
  5   | const adminPassword = 'Hrms@12345';
  6   | 
  7   | // Helper: login as admin
  8   | async function loginAsAdmin(page: any) {
  9   |   await page.goto(`${base}/login`);
> 10  |   await page.getByRole('button', { name: 'Admin' }).click();
      |                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  11  |   await page.getByLabel('Work email').fill(adminEmail);
  12  |   await page.getByLabel('Password').fill(adminPassword);
  13  |   await page.getByRole('button', { name: 'Sign in' }).click();
  14  |   await page.waitForURL('**/dashboard');
  15  | }
  16  | 
  17  | test('employee create → view → delete', async ({ page }) => {
  18  |   const uniqueName = `E2E Tester ${Date.now()}`;
  19  |   const uniqueEmail = `e2e+${Date.now()}@example.com`;
  20  | 
  21  |   // Navigate to login page and login as admin
  22  |   await loginAsAdmin(page);
  23  | 
  24  |   // Navigate to employees page and create an employee
  25  |   await page.goto(`${base}/employees`);
  26  |   await page.getByLabel('Full name').fill(uniqueName);
  27  |   await page.getByLabel('Email').fill(uniqueEmail);
  28  |   await page.getByRole('button', { name: 'Add' }).click();
  29  |   await page.getByRole('button', { name: 'Confirm' }).click();
  30  |   await expect(page.getByText(uniqueName)).toBeVisible();
  31  | 
  32  |   // Open employee detail and validate detail page is reachable
  33  |   await page.getByRole('link', { name: uniqueName }).click();
  34  |   await expect(page.getByText('KYC / Documents')).toBeVisible();
  35  | 
  36  |   // Delete employee from list page
  37  |   await page.goto(`${base}/employees`);
  38  |   const row = page.locator('li').filter({ hasText: uniqueName }).first();
  39  |   await row.getByLabel('delete').click();
  40  |   await page.getByRole('button', { name: 'Confirm' }).click();
  41  |   await expect(page.getByText(uniqueName)).toHaveCount(0);
  42  | });
  43  | 
  44  | test('dashboard displays employee count widget', async ({ page }) => {
  45  |   await loginAsAdmin(page);
  46  | 
  47  |   // Navigate to dashboard
  48  |   await page.goto(`${base}/dashboard`);
  49  | 
  50  |   // Wait for dashboard to load
  51  |   await page.waitForSelector('text=Role-aware reporting kickoff', { timeout: 5000 });
  52  | 
  53  |   // Check for main dashboard elements
  54  |   await expect(page.getByText('Employee Count')).toBeVisible();
  55  |   await expect(page.getByText('Pending Approvals')).toBeVisible();
  56  |   await expect(page.getByText('Attendance Summary')).toBeVisible();
  57  | 
  58  |   // Verify employee count is displayed
  59  |   const employeeCountCard = page.locator('text=Employee Count').first();
  60  |   const employeeNumber = employeeCountCard.locator('..').locator('h4');
  61  |   await expect(employeeNumber).toContainText(/\d+/);
  62  | });
  63  | 
  64  | test('dashboard filters work correctly', async ({ page }) => {
  65  |   await loginAsAdmin(page);
  66  | 
  67  |   // Navigate to dashboard
  68  |   await page.goto(`${base}/dashboard`);
  69  | 
  70  |   // Wait for filters to load
  71  |   await page.waitForSelector('text=Apply filters', { timeout: 5000 });
  72  | 
  73  |   // Verify filter controls exist
  74  |   const startDateInput = page.getByLabel('Start date');
  75  |   const endDateInput = page.getByLabel('End date');
  76  |   const departmentSelect = page.getByLabel('Department');
  77  |   const applyButton = page.getByRole('button', { name: 'Apply filters' });
  78  | 
  79  |   await expect(startDateInput).toBeVisible();
  80  |   await expect(endDateInput).toBeVisible();
  81  |   await expect(departmentSelect).toBeVisible();
  82  |   await expect(applyButton).toBeVisible();
  83  | 
  84  |   // Test filter reset
  85  |   const resetButton = page.getByRole('button', { name: 'Reset' });
  86  |   await expect(resetButton).toBeVisible();
  87  | });
  88  | 
  89  | test('dashboard CSV export works', async ({ page }) => {
  90  |   await loginAsAdmin(page);
  91  | 
  92  |   // Navigate to dashboard
  93  |   await page.goto(`${base}/dashboard`);
  94  | 
  95  |   // Wait for dashboard to load
  96  |   await page.waitForSelector('text=Employee Count', { timeout: 5000 });
  97  | 
  98  |   // Verify CSV export buttons exist
  99  |   const csvButtons = page.locator('button:has-text("CSV"), button:has-text("Export CSV")');
  100 |   const buttonCount = await csvButtons.count();
  101 |   
  102 |   // Should have at least 2 CSV buttons (employee count and department breakdown)
  103 |   expect(buttonCount).toBeGreaterThanOrEqual(1);
  104 | });
  105 | 
  106 | test('department breakdown widget renders', async ({ page }) => {
  107 |   await loginAsAdmin(page);
  108 | 
  109 |   // Navigate to dashboard
  110 |   await page.goto(`${base}/dashboard`);
```