# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/employee.spec.ts >> audit logs page accessible to admin
- Location: e2e/employee.spec.ts:122:5

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('text=System audit trail') to be visible

```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - navigation [ref=e6]:
            - button "previous" [disabled] [ref=e7]:
              - img "previous" [ref=e8]
            - generic [ref=e10]:
              - generic [ref=e11]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e12]:
              - img "next" [ref=e13]
          - img
        - generic [ref=e15]:
          - link "Next.js 15.5.15 (outdated) Webpack" [ref=e16] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
            - img [ref=e17]
            - generic "An outdated version detected (latest is 16.2.4), upgrade is highly recommended!" [ref=e19]: Next.js 15.5.15 (outdated)
            - generic [ref=e20]: Webpack
          - img
      - dialog "Build Error" [ref=e22]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e29]: Build Error
              - generic [ref=e30]:
                - button "Copy Error Info" [ref=e31] [cursor=pointer]:
                  - img [ref=e32]
                - link "Go to related documentation" [ref=e34] [cursor=pointer]:
                  - /url: https://nextjs.org/docs/messages/module-not-found
                  - img [ref=e35]
                - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools" [ref=e37] [cursor=pointer]:
                  - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
                  - img [ref=e38]
            - paragraph [ref=e47]: "Module not found: Can't resolve '@mui/icons-material/AuditRounded'"
          - generic [ref=e49]:
            - generic [ref=e51]:
              - img [ref=e53]
              - generic [ref=e56]: ./app/admin/audit-logs/page.tsx (27:1)
              - button "Open in editor" [ref=e57] [cursor=pointer]:
                - img [ref=e59]
            - generic [ref=e62]:
              - generic [ref=e63]: Module not found
              - generic [ref=e64]: ": Can't resolve '"
              - text: "@mui/icons-material/AuditRounded"
              - generic [ref=e65]: "'"
              - generic [ref=e66]: 25 |
              - text: import Typography from '@mui/material/Typography';
              - generic [ref=e67]: 26 |
              - text: import Alert from '@mui/material/Alert'; >
              - generic [ref=e68]: 27 |
              - text: import AuditIcon from '@mui/icons-material/AuditRounded';
              - generic [ref=e69]: "|"
              - text: ^
              - generic [ref=e70]: 28 |
              - text: import
              - generic [ref=e71]: "{ useAuth }"
              - text: from '@/components/auth/AuthContext';
              - generic [ref=e72]: 29 |
              - text: import
              - generic [ref=e73]: "{ useRouter }"
              - text: from 'next/navigation';
              - generic [ref=e74]: 30 |
              - link "https://nextjs.org/docs/messages/module-not-found" [ref=e76] [cursor=pointer]:
                - /url: https://nextjs.org/docs/messages/module-not-found
        - generic [ref=e77]:
          - generic [ref=e78]: "1"
          - generic [ref=e79]: "2"
    - generic [ref=e84] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e85]:
        - img [ref=e86]
      - button "Open issues overlay" [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e92]: "0"
          - generic [ref=e93]: "1"
        - generic [ref=e94]: Issue
  - alert [ref=e95]
```

# Test source

```ts
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
> 129 |   await page.waitForSelector('text=System audit trail', { timeout: 5000 });
      |              ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
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