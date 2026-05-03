# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/employee.spec.ts >> employee create → view → delete
- Location: e2e/employee.spec.ts:17:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Confirm' })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: Secure HRMS Platform
          - paragraph [ref=e8]: Employees
        - generic [ref=e9]:
          - generic [ref=e11]: Admin
          - generic [ref=e12]:
            - generic [ref=e13]: AS
            - generic [ref=e14]:
              - paragraph [ref=e15]: Aditi Sharma
              - paragraph [ref=e16]: admin@hrms.com
          - button "Logout" [ref=e17] [cursor=pointer]:
            - img [ref=e19]
            - text: Logout
    - generic [ref=e24]:
      - generic [ref=e26]:
        - img [ref=e28]
        - generic [ref=e30]:
          - paragraph [ref=e31]: HRMS
          - paragraph [ref=e32]: Admin workspace
      - separator [ref=e33]
      - list [ref=e34]:
        - button "Dashboard" [ref=e35] [cursor=pointer]:
          - img [ref=e37]
          - generic [ref=e40]: Dashboard
        - button "Employees" [ref=e41] [cursor=pointer]:
          - img [ref=e43]
          - generic [ref=e46]: Employees
        - button "Attendance" [ref=e47] [cursor=pointer]:
          - img [ref=e49]
          - generic [ref=e52]: Attendance
        - button "Payroll" [ref=e53] [cursor=pointer]:
          - img [ref=e55]
          - generic [ref=e58]: Payroll
        - button "Leaves" [ref=e59] [cursor=pointer]:
          - img [ref=e61]
          - generic [ref=e64]: Leaves
        - button "My Profile" [ref=e65] [cursor=pointer]:
          - img [ref=e67]
          - generic [ref=e70]: My Profile
        - button "Settings" [ref=e71] [cursor=pointer]:
          - img [ref=e73]
          - generic [ref=e76]: Settings
      - generic [ref=e79]:
        - paragraph [ref=e80]: Phase 1 coverage
        - paragraph [ref=e81]: Authentication, protected navigation, and dashboard-ready app structure.
    - main [ref=e82]:
      - generic [ref=e84]:
        - generic [ref=e86]:
          - generic [ref=e87]: Employees
          - generic [ref=e88]: Manage employee master data
        - generic [ref=e89]:
          - generic [ref=e90]:
            - generic [ref=e91]:
              - heading "Employees" [level=6] [ref=e92]
              - separator [ref=e93]
              - list [ref=e94]:
                - listitem [ref=e95]:
                  - link "Aditi Sharma admin@hrms.com • Active" [ref=e96] [cursor=pointer]:
                    - /url: /employees/bada46d3-695d-4167-9dbd-91c323dd8e56
                    - generic [ref=e97]:
                      - generic [ref=e98]: Aditi Sharma
                      - paragraph [ref=e99]: admin@hrms.com • Active
                  - generic [ref=e100]:
                    - button "edit" [ref=e101] [cursor=pointer]:
                      - img [ref=e102]
                    - button "delete" [ref=e104] [cursor=pointer]:
                      - img [ref=e105]
                - listitem [ref=e107]:
                  - link "Alice Manager alice.manager@example.com • Active" [ref=e108] [cursor=pointer]:
                    - /url: /employees/dabf8bf7-5021-47aa-a0a0-a5ca81f3009c
                    - generic [ref=e109]:
                      - generic [ref=e110]: Alice Manager
                      - paragraph [ref=e111]: alice.manager@example.com • Active
                  - generic [ref=e112]:
                    - button "edit" [ref=e113] [cursor=pointer]:
                      - img [ref=e114]
                    - button "delete" [ref=e116] [cursor=pointer]:
                      - img [ref=e117]
                - listitem [ref=e119]:
                  - link "Arjun Mehta manager@hrms.com • Active" [ref=e120] [cursor=pointer]:
                    - /url: /employees/7b510619-4f5e-4635-9e82-cb481dd65dca
                    - generic [ref=e121]:
                      - generic [ref=e122]: Arjun Mehta
                      - paragraph [ref=e123]: manager@hrms.com • Active
                  - generic [ref=e124]:
                    - button "edit" [ref=e125] [cursor=pointer]:
                      - img [ref=e126]
                    - button "delete" [ref=e128] [cursor=pointer]:
                      - img [ref=e129]
                - listitem [ref=e131]:
                  - link "Bob Lead bob.lead@example.com • Active" [ref=e132] [cursor=pointer]:
                    - /url: /employees/d9f562ce-4647-4198-8f0b-39d3daefba83
                    - generic [ref=e133]:
                      - generic [ref=e134]: Bob Lead
                      - paragraph [ref=e135]: bob.lead@example.com • Active
                  - generic [ref=e136]:
                    - button "edit" [ref=e137] [cursor=pointer]:
                      - img [ref=e138]
                    - button "delete" [ref=e140] [cursor=pointer]:
                      - img [ref=e141]
                - listitem [ref=e143]:
                  - link "Carol IC carol.ic@example.com • Active" [ref=e144] [cursor=pointer]:
                    - /url: /employees/95760d6d-38d7-4106-9114-55b6757f6e50
                    - generic [ref=e145]:
                      - generic [ref=e146]: Carol IC
                      - paragraph [ref=e147]: carol.ic@example.com • Active
                  - generic [ref=e148]:
                    - button "edit" [ref=e149] [cursor=pointer]:
                      - img [ref=e150]
                    - button "delete" [ref=e152] [cursor=pointer]:
                      - img [ref=e153]
                - listitem [ref=e155]:
                  - link "E2E Tester 1777612651567 e2e+1777612651567@example.com • Active" [ref=e156] [cursor=pointer]:
                    - /url: /employees/fa0937d3-a730-4368-82f4-01aaa966eae1
                    - generic [ref=e157]:
                      - generic [ref=e158]: E2E Tester 1777612651567
                      - paragraph [ref=e159]: e2e+1777612651567@example.com • Active
                  - generic [ref=e160]:
                    - button "edit" [ref=e161] [cursor=pointer]:
                      - img [ref=e162]
                    - button "delete" [ref=e164] [cursor=pointer]:
                      - img [ref=e165]
                - listitem [ref=e167]:
                  - link "E2E Tester 1777612693015 e2e+1777612693015@example.com • Active" [ref=e168] [cursor=pointer]:
                    - /url: /employees/83ecc4a4-5f3d-41ee-8ee1-a1936b6dae12
                    - generic [ref=e169]:
                      - generic [ref=e170]: E2E Tester 1777612693015
                      - paragraph [ref=e171]: e2e+1777612693015@example.com • Active
                  - generic [ref=e172]:
                    - button "edit" [ref=e173] [cursor=pointer]:
                      - img [ref=e174]
                    - button "delete" [ref=e176] [cursor=pointer]:
                      - img [ref=e177]
                - listitem [ref=e179]:
                  - link "E2E Tester 1777612730256 e2e+1777612730256@example.com • Active" [ref=e180] [cursor=pointer]:
                    - /url: /employees/1adc3762-f101-44d7-821a-40dddbf516b7
                    - generic [ref=e181]:
                      - generic [ref=e182]: E2E Tester 1777612730256
                      - paragraph [ref=e183]: e2e+1777612730256@example.com • Active
                  - generic [ref=e184]:
                    - button "edit" [ref=e185] [cursor=pointer]:
                      - img [ref=e186]
                    - button "delete" [ref=e188] [cursor=pointer]:
                      - img [ref=e189]
                - listitem [ref=e191]:
                  - link "E2E Tester 1777647109545 e2e+1777647109545@example.com • Active" [ref=e192] [cursor=pointer]:
                    - /url: /employees/07728793-4104-4e2a-9ae9-b742bd8408f2
                    - generic [ref=e193]:
                      - generic [ref=e194]: E2E Tester 1777647109545
                      - paragraph [ref=e195]: e2e+1777647109545@example.com • Active
                  - generic [ref=e196]:
                    - button "edit" [ref=e197] [cursor=pointer]:
                      - img [ref=e198]
                    - button "delete" [active] [ref=e200] [cursor=pointer]:
                      - img [ref=e201]
                - listitem [ref=e203]:
                  - link "Neha Kapoor employee@hrms.com • Active" [ref=e204] [cursor=pointer]:
                    - /url: /employees/b5375da9-feab-49d8-841c-f092c804be9b
                    - generic [ref=e205]:
                      - generic [ref=e206]: Neha Kapoor
                      - paragraph [ref=e207]: employee@hrms.com • Active
                  - generic [ref=e208]:
                    - button "edit" [ref=e209] [cursor=pointer]:
                      - img [ref=e210]
                    - button "delete" [ref=e212] [cursor=pointer]:
                      - img [ref=e213]
            - generic [ref=e215]:
              - heading "Create employee" [level=6] [ref=e216]
              - separator [ref=e217]
              - generic [ref=e218]:
                - generic [ref=e219]:
                  - generic: Full name
                  - generic [ref=e220]:
                    - textbox "Full name" [ref=e221]
                    - group:
                      - generic: Full name
                - generic [ref=e222]:
                  - generic: Email
                  - generic [ref=e223]:
                    - textbox "Email" [ref=e224]
                    - group:
                      - generic: Email
                - generic [ref=e225]:
                  - generic: Manager
                  - generic [ref=e226]:
                    - combobox "Manager" [ref=e227] [cursor=pointer]
                    - textbox
                    - img
                    - group:
                      - generic: Manager
                - generic [ref=e228]:
                  - generic: Department
                  - generic [ref=e229]:
                    - combobox "Department" [ref=e230] [cursor=pointer]
                    - textbox
                    - img
                    - group:
                      - generic: Department
                - generic [ref=e231]:
                  - generic: Designation
                  - generic [ref=e232]:
                    - combobox "Designation" [ref=e233] [cursor=pointer]
                    - textbox
                    - img
                    - group:
                      - generic: Designation
                - generic [ref=e234]:
                  - button "Add" [disabled]:
                    - generic:
                      - img
                    - text: Add
          - generic [ref=e235]:
            - generic [ref=e237]:
              - img [ref=e238]
              - textbox "Search name or email" [ref=e241]
              - group
            - button "Search" [ref=e242] [cursor=pointer]
            - paragraph [ref=e243]: Page 1 • 12 total
            - button "Prev" [disabled]
            - button "Next" [ref=e244] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e250] [cursor=pointer]:
    - img [ref=e251]
  - alert [ref=e254]
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
  10  |   await page.getByRole('button', { name: 'Admin' }).click();
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
> 40  |   await page.getByRole('button', { name: 'Confirm' }).click();
      |                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  111 | 
  112 |   // Wait for department breakdown
  113 |   await page.waitForSelector('text=Department Breakdown', { timeout: 5000 });
  114 | 
  115 |   // Verify the table headers exist
  116 |   await expect(page.getByText('Department')).toBeVisible();
  117 |   await expect(page.getByText('Total')).toBeVisible();
  118 |   await expect(page.getByText('Active')).toBeVisible();
  119 |   await expect(page.getByText('Inactive')).toBeVisible();
  120 | });
  121 | 
  122 | test('audit logs page accessible to admin', async ({ page }) => {
  123 |   await loginAsAdmin(page);
  124 | 
  125 |   // Navigate to audit logs (admin section)
  126 |   await page.goto(`${base}/admin/audit-logs`);
  127 | 
  128 |   // Wait for audit logs page to load
  129 |   await page.waitForSelector('text=System audit trail', { timeout: 5000 });
  130 | 
  131 |   // Verify audit log elements
  132 |   await expect(page.getByText('System audit trail')).toBeVisible();
  133 |   await expect(page.getByLabel('Object Type')).toBeVisible();
  134 |   await expect(page.getByLabel('Actor ID')).toBeVisible();
  135 | });
  136 | 
  137 | test('employee operations are recorded in audit logs', async ({ page, context }) => {
  138 |   // Create two pages to have one logged in
  139 |   const adminPage = await context.newPage();
  140 |   await loginAsAdmin(adminPage);
```