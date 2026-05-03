# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/attendance.spec.ts >> Attendance Workflows >> Employee should be able to check in
- Location: e2e/attendance.spec.ts:15:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e9]: Phase 1 Authentication
        - heading "HRMS built for serious operations." [level=1] [ref=e10]
        - paragraph [ref=e11]: A neat, clean SaaS surface for admin, HR, manager, employee, and CEO workflows, designed to grow into payroll, attendance, compliance, and analytics.
      - generic [ref=e12]:
        - paragraph [ref=e15]: Role-based access
        - paragraph [ref=e18]: Attendance-ready workflows
        - paragraph [ref=e21]: Payroll-safe structure
        - paragraph [ref=e24]: SaaS-ready UI system
    - generic [ref=e27]:
      - paragraph [ref=e28]: Phase 1 focuses on a secure, role-aware login experience with a premium SaaS look.
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: Secure access
          - heading "Sign in to HRMS" [level=2] [ref=e33]
          - paragraph [ref=e34]: A polished entry point for your HRMS SaaS with a clean, enterprise-grade feel.
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: Work email
            - generic [ref=e39]:
              - img [ref=e41]
              - textbox "Work email" [ref=e43]:
                - /placeholder: name@company.com
                - text: hr@hrms.com
              - group:
                - generic: Work email
            - paragraph [ref=e44]: Use your HRMS account email.
          - generic [ref=e45]:
            - generic [ref=e46]: Password
            - generic [ref=e47]:
              - img [ref=e49]
              - textbox "Password" [ref=e51]:
                - /placeholder: Enter your password
                - text: Hrms@12345
              - group:
                - generic: Password
            - paragraph [ref=e52]: "Demo password: Hrms@12345"
          - generic [ref=e53]:
            - paragraph [ref=e54]: Select role preview
            - generic [ref=e55]:
              - button "Admin" [ref=e56] [cursor=pointer]:
                - img [ref=e58]
                - text: Admin
              - button "HR" [ref=e60] [cursor=pointer]:
                - img [ref=e62]
                - text: HR
              - button "Manager" [ref=e64] [cursor=pointer]:
                - img [ref=e66]
                - text: Manager
              - button "Employee" [ref=e68] [cursor=pointer]:
                - img [ref=e70]
                - text: Employee
              - button "CEO" [ref=e72] [cursor=pointer]:
                - img [ref=e74]
                - text: CEO
            - paragraph [ref=e76]: "Demo account: HR using hr@hrms.com"
          - generic [ref=e77]:
            - generic [ref=e78] [cursor=pointer]:
              - checkbox "Remember me" [checked] [ref=e81]
              - generic [ref=e84]: Remember me
            - link "Forgot password?" [ref=e85] [cursor=pointer]:
              - /url: /forgot-password
          - button "Sign in" [ref=e86] [cursor=pointer]
          - separator [ref=e87]
          - paragraph [ref=e88]:
            - text: New here?
            - link "Create an account" [ref=e89] [cursor=pointer]:
              - /url: /register
  - button "Open Next.js Dev Tools" [ref=e95] [cursor=pointer]:
    - img [ref=e96]
  - alert [ref=e99]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  4   | const API_BASE_URL = process.env.PLAYWRIGHT_TEST_API_URL || 'http://localhost:8000';
  5   | 
  6   | test.describe('Attendance Workflows', () => {
  7   |   let authToken: string;
  8   |   let employeeId: string;
  9   | 
  10  |   test.beforeAll(async () => {
  11  |     // This would be set up by a test fixture in real scenario
  12  |     // For now, we document the expected flow
  13  |   });
  14  | 
  15  |   test('Employee should be able to check in', async ({ page }) => {
  16  |     // Navigate to login page
  17  |     await page.goto(`${BASE_URL}/login`);
  18  | 
  19  |     // Fill login credentials
> 20  |     await page.fill('input[type="email"]', 'alice@example.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  21  |     await page.fill('input[type="password"]', 'password123');
  22  | 
  23  |     // Click login button
  24  |     await page.click('button:has-text("Login")');
  25  | 
  26  |     // Wait for redirect to dashboard
  27  |     await page.waitForURL(`${BASE_URL}/dashboard`);
  28  | 
  29  |     // Navigate to attendance page
  30  |     await page.goto(`${BASE_URL}/attendance`);
  31  | 
  32  |     // Check in button should be visible and enabled
  33  |     const checkInButton = page.locator('button:has-text("Check In")');
  34  |     await expect(checkInButton).toBeVisible();
  35  |     await expect(checkInButton).toBeEnabled();
  36  | 
  37  |     // Click check in
  38  |     await checkInButton.click();
  39  | 
  40  |     // Success message should appear
  41  |     const successAlert = page.locator('[role="alert"]:has-text("Checked in")');
  42  |     await expect(successAlert).toBeVisible();
  43  | 
  44  |     // Check in time should be displayed
  45  |     const checkInTime = page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/');
  46  |     await expect(checkInTime).toBeVisible();
  47  | 
  48  |     // Check in button should be disabled
  49  |     await expect(checkInButton).toBeDisabled();
  50  | 
  51  |     // Check out button should be enabled
  52  |     const checkOutButton = page.locator('button:has-text("Check Out")');
  53  |     await expect(checkOutButton).toBeEnabled();
  54  |   });
  55  | 
  56  |   test('Employee should be able to check out', async ({ page }) => {
  57  |     // Login
  58  |     await page.goto(`${BASE_URL}/login`);
  59  |     await page.fill('input[type="email"]', 'bob@example.com');
  60  |     await page.fill('input[type="password"]', 'password123');
  61  |     await page.click('button:has-text("Login")');
  62  |     await page.waitForURL(`${BASE_URL}/dashboard`);
  63  | 
  64  |     // Navigate to attendance
  65  |     await page.goto(`${BASE_URL}/attendance`);
  66  | 
  67  |     // Manually check in first
  68  |     let checkInButton = page.locator('button:has-text("Check In")');
  69  |     await checkInButton.click();
  70  |     await page.waitForSelector('[role="alert"]:has-text("Checked in")');
  71  | 
  72  |     // Now check out
  73  |     const checkOutButton = page.locator('button:has-text("Check Out")');
  74  |     await expect(checkOutButton).toBeEnabled();
  75  |     await checkOutButton.click();
  76  | 
  77  |     // Success message should appear
  78  |     const successAlert = page.locator('[role="alert"]');
  79  |     await expect(successAlert).toContainText('Checked out');
  80  | 
  81  |     // Check out time should be displayed
  82  |     await page.waitForSelector('text=/Check Out/');
  83  |     const checkOutTime = page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/');
  84  |     await expect(checkOutTime.nth(1)).toBeVisible(); // Second occurrence is check out time
  85  | 
  86  |     // Check out button should be disabled
  87  |     const checkOutButtonDisabled = page.locator('button:has-text("Check Out")');
  88  |     await expect(checkOutButtonDisabled).toBeDisabled();
  89  |   });
  90  | 
  91  |   test('Employee should see attendance history', async ({ page }) => {
  92  |     // Login
  93  |     await page.goto(`${BASE_URL}/login`);
  94  |     await page.fill('input[type="email"]', 'carol@example.com');
  95  |     await page.fill('input[type="password"]', 'password123');
  96  |     await page.click('button:has-text("Login")');
  97  |     await page.waitForURL(`${BASE_URL}/dashboard`);
  98  | 
  99  |     // Navigate to attendance
  100 |     await page.goto(`${BASE_URL}/attendance`);
  101 | 
  102 |     // Recent attendance table should be visible
  103 |     const attendanceTable = page.locator('table');
  104 |     await expect(attendanceTable).toBeVisible();
  105 | 
  106 |     // Table should have headers
  107 |     await expect(page.locator('text=Date')).toBeVisible();
  108 |     await expect(page.locator('text=Check In')).toBeVisible();
  109 |     await expect(page.locator('text=Check Out')).toBeVisible();
  110 |     await expect(page.locator('text=Status')).toBeVisible();
  111 | 
  112 |     // If no records, should show info message
  113 |     const infoAlert = page.locator('[role="alert"]:has-text("No attendance records yet")');
  114 |     const tableRows = page.locator('table tbody tr');
  115 |     const rowCount = await tableRows.count();
  116 | 
  117 |     if (rowCount === 0) {
  118 |       await expect(infoAlert).toBeVisible();
  119 |     } else {
  120 |       // Table rows should be visible
```