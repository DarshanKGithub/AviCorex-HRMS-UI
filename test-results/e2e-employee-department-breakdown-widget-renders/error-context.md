# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/employee.spec.ts >> department breakdown widget renders
- Location: e2e/employee.spec.ts:106:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Department')
Expected: visible
Error: strict mode violation: getByText('Department') resolved to 7 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 css-1ikzp7v-MuiTypography-root">Employee count and department breakdown are live …</p> aka getByText('Employee count and department')
    2) <label data-shrink="false" id="dashboard-department-label" class="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-sizeSmall MuiInputLabel-outlined MuiFormLabel-colorPrimary MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-sizeSmall MuiInputLabel-outlined css-1q1mctd-MuiFormLabel-root-MuiInputLabel-root">Department</label> aka locator('#dashboard-department-label')
    3) <span>Department</span> aka locator('span').filter({ hasText: /^Department$/ })
    4) <h6 class="MuiTypography-root MuiTypography-h6 css-v2ua86-MuiTypography-root">Department Breakdown</h6> aka getByRole('heading', { name: 'Department Breakdown' })
    5) <p class="MuiTypography-root MuiTypography-body1 css-18t8brv-MuiTypography-root">Aggregated employee totals grouped by department.</p> aka getByText('Aggregated employee totals')
    6) <th scope="col" class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeSmall css-19q3s7c-MuiTableCell-root">Department</th> aka getByRole('columnheader', { name: 'Department' })
    7) <span class="MuiChip-label MuiChip-labelMedium css-1dybbl5-MuiChip-label">Department distribution</span> aka getByText('Department distribution')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Department')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: Secure HRMS Platform
          - paragraph [ref=e8]: Dashboard
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
      - generic [ref=e85]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - generic [ref=e89]:
              - img [ref=e90]
              - generic [ref=e93]: Phase 3 Dashboard
            - heading "Role-aware reporting kickoff" [level=4] [ref=e94]
            - paragraph [ref=e95]: Employee count and department breakdown are live from backend data, with CSV exports for each widget.
          - generic [ref=e97]: Signed in as Admin
        - generic [ref=e100]:
          - generic [ref=e101]:
            - generic [ref=e102]: Start date
            - generic [ref=e103]:
              - textbox "Start date" [ref=e104]
              - group:
                - generic: Start date
          - generic [ref=e105]:
            - generic [ref=e106]: End date
            - generic [ref=e107]:
              - textbox "End date" [ref=e108]
              - group:
                - generic: End date
          - generic [ref=e109]:
            - generic: Department
            - generic [ref=e110]:
              - combobox "Department" [ref=e111] [cursor=pointer]
              - textbox
              - img
              - group:
                - generic: Department
          - generic [ref=e112]:
            - button "Apply filters" [ref=e113] [cursor=pointer]
            - button "Reset" [ref=e114] [cursor=pointer]
        - generic [ref=e115]:
          - generic [ref=e118]:
            - generic [ref=e119]:
              - paragraph [ref=e120]: Employee Count
              - button "CSV" [ref=e121] [cursor=pointer]:
                - img [ref=e123]
                - text: CSV
            - heading "12" [level=4] [ref=e125]
            - paragraph [ref=e126]: 12 active, 0 inactive
          - generic [ref=e129]:
            - paragraph [ref=e130]: Pending Approvals
            - heading "0" [level=4] [ref=e131]
            - paragraph [ref=e132]: Placeholder until leave and expense workflows are enabled.
          - generic [ref=e135]:
            - paragraph [ref=e136]: Attendance Summary
            - heading "stubbed" [level=5] [ref=e137]
            - paragraph [ref=e138]: Present 0, absent 0, late 0
        - generic [ref=e140]:
          - generic [ref=e141]:
            - generic [ref=e142]:
              - heading "Department Breakdown" [level=6] [ref=e143]
              - paragraph [ref=e144]: Aggregated employee totals grouped by department.
            - button "Export CSV" [ref=e145] [cursor=pointer]:
              - img [ref=e147]
              - text: Export CSV
          - table [ref=e150]:
            - rowgroup [ref=e151]:
              - row "Department Total Active Inactive" [ref=e152]:
                - columnheader "Department" [ref=e153]
                - columnheader "Total" [ref=e154]
                - columnheader "Active" [ref=e155]
                - columnheader "Inactive" [ref=e156]
            - rowgroup [ref=e157]:
              - row "Engineering 0 0 0" [ref=e158]:
                - cell "Engineering" [ref=e159]
                - cell "0" [ref=e160]
                - cell "0" [ref=e161]
                - cell "0" [ref=e162]
              - row "Finance 0 0 0" [ref=e163]:
                - cell "Finance" [ref=e164]
                - cell "0" [ref=e165]
                - cell "0" [ref=e166]
                - cell "0" [ref=e167]
              - row "People Operations 0 0 0" [ref=e168]:
                - cell "People Operations" [ref=e169]
                - cell "0" [ref=e170]
                - cell "0" [ref=e171]
                - cell "0" [ref=e172]
              - row "People Ops 0 0 0" [ref=e173]:
                - cell "People Ops" [ref=e174]
                - cell "0" [ref=e175]
                - cell "0" [ref=e176]
                - cell "0" [ref=e177]
              - row "Unassigned 12 12 0" [ref=e178]:
                - cell "Unassigned" [ref=e179]
                - cell "12" [ref=e180]
                - cell "12" [ref=e181]
                - cell "0" [ref=e182]
        - generic [ref=e184]:
          - heading "Admin view" [level=6] [ref=e185]
          - paragraph [ref=e186]: These role-specific sections are ready for deeper widgets in upcoming phases.
          - generic [ref=e187]:
            - generic [ref=e189]: Global headcount health
            - generic [ref=e191]: Approval queue overview
            - generic [ref=e193]: Department distribution
  - button "Open Next.js Dev Tools" [ref=e199] [cursor=pointer]:
    - img [ref=e200]
  - alert [ref=e203]
```

# Test source

```ts
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
  111 | 
  112 |   // Wait for department breakdown
  113 |   await page.waitForSelector('text=Department Breakdown', { timeout: 5000 });
  114 | 
  115 |   // Verify the table headers exist
> 116 |   await expect(page.getByText('Department')).toBeVisible();
      |                                              ^ Error: expect(locator).toBeVisible() failed
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
  141 | 
  142 |   // Create an employee
  143 |   const uniqueName = `Audit Test ${Date.now()}`;
  144 |   const uniqueEmail = `audit+${Date.now()}@example.com`;
  145 | 
  146 |   await adminPage.goto(`${base}/employees`);
  147 |   await adminPage.getByLabel('Full name').fill(uniqueName);
  148 |   await adminPage.getByLabel('Email').fill(uniqueEmail);
  149 |   await adminPage.getByRole('button', { name: 'Add' }).click();
  150 |   await adminPage.getByRole('button', { name: 'Confirm' }).click();
  151 | 
  152 |   // Wait a moment for audit log to be written
  153 |   await adminPage.waitForTimeout(1000);
  154 | 
  155 |   // Check audit logs
  156 |   await adminPage.goto(`${base}/admin/audit-logs`);
  157 |   await adminPage.waitForSelector('table', { timeout: 5000 });
  158 | 
  159 |   // Verify audit log table has content
  160 |   const rows = adminPage.locator('table tbody tr');
  161 |   const rowCount = await rows.count();
  162 |   
  163 |   // Should have at least some audit log rows
  164 |   expect(rowCount).toBeGreaterThan(0);
  165 | 
  166 |   await adminPage.close();
  167 | });
  168 | 
  169 | 
```