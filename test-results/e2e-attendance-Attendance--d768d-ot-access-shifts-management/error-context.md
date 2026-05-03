# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/attendance.spec.ts >> Attendance Workflows >> Non-admin user should not access shifts management
- Location: e2e/attendance.spec.ts:171:7

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
  121 |       await expect(tableRows.first()).toBeVisible();
  122 |     }
  123 |   });
  124 | 
  125 |   test('Admin should be able to manage shifts', async ({ page }) => {
  126 |     // Login as admin
  127 |     await page.goto(`${BASE_URL}/login`);
  128 |     await page.fill('input[type="email"]', 'admin@example.com');
  129 |     await page.fill('input[type="password"]', 'admin123');
  130 |     await page.click('button:has-text("Login")');
  131 |     await page.waitForURL(`${BASE_URL}/dashboard`);
  132 | 
  133 |     // Navigate to shifts management
  134 |     await page.goto(`${BASE_URL}/attendance/shifts`);
  135 | 
  136 |     // Create Shift button should be visible
  137 |     const createShiftButton = page.locator('button:has-text("Create Shift")');
  138 |     await expect(createShiftButton).toBeVisible();
  139 | 
  140 |     // Click create shift
  141 |     await createShiftButton.click();
  142 | 
  143 |     // Dialog should open
  144 |     const dialog = page.locator('[role="dialog"]');
  145 |     await expect(dialog).toBeVisible();
  146 | 
  147 |     // Fill shift form
  148 |     await page.fill('input[placeholder="e.g., Morning Shift"]', 'Afternoon Shift');
  149 |     await page.fill('input[type="time"]', '14:00'); // Start time
  150 | 
  151 |     // Get the second time input for end time
  152 |     const timeInputs = page.locator('input[type="time"]');
  153 |     await timeInputs.nth(1).fill('23:00'); // End time
  154 | 
  155 |     // Click create button
  156 |     await page.click('[role="dialog"] button:has-text("Create")');
  157 | 
  158 |     // Dialog should close
  159 |     await expect(dialog).not.toBeVisible();
  160 | 
  161 |     // Success message should appear
  162 |     const successAlert = page.locator('[role="alert"]:has-text("Shift created")');
  163 |     await expect(successAlert).toBeVisible();
  164 | 
  165 |     // New shift should appear in table
  166 |     const shiftTable = page.locator('table');
  167 |     await expect(shiftTable).toBeVisible();
  168 |     await expect(page.locator('text=Afternoon Shift')).toBeVisible();
  169 |   });
  170 | 
  171 |   test('Non-admin user should not access shifts management', async ({ page }) => {
  172 |     // Login as regular employee
  173 |     await page.goto(`${BASE_URL}/login`);
> 174 |     await page.fill('input[type="email"]', 'alice@example.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  175 |     await page.fill('input[type="password"]', 'password123');
  176 |     await page.click('button:has-text("Login")');
  177 |     await page.waitForURL(`${BASE_URL}/dashboard`);
  178 | 
  179 |     // Try to navigate to shifts management
  180 |     await page.goto(`${BASE_URL}/attendance/shifts`);
  181 | 
  182 |     // Should redirect to attendance main page
  183 |     await page.waitForURL(`${BASE_URL}/attendance`);
  184 |     expect(page.url()).toBe(`${BASE_URL}/attendance`);
  185 |   });
  186 | 
  187 |   test('Late check-in should be marked correctly', async ({ page }) => {
  188 |     // Login
  189 |     await page.goto(`${BASE_URL}/login`);
  190 |     await page.fill('input[type="email"]', 'dan@example.com');
  191 |     await page.fill('input[type="password"]', 'password123');
  192 |     await page.click('button:has-text("Login")');
  193 |     await page.waitForURL(`${BASE_URL}/dashboard`);
  194 | 
  195 |     // Navigate to attendance
  196 |     await page.goto(`${BASE_URL}/attendance`);
  197 | 
  198 |     // Check in
  199 |     const checkInButton = page.locator('button:has-text("Check In")');
  200 |     await checkInButton.click();
  201 |     await page.waitForSelector('[role="alert"]');
  202 | 
  203 |     // Look for late indicator (if check-in is late)
  204 |     const lateChip = page.locator('[role="alert"]:has-text("Late")');
  205 |     
  206 |     // If late chip exists, it should show late minutes
  207 |     if (await lateChip.isVisible()) {
  208 |       const lateText = await lateChip.textContent();
  209 |       expect(lateText).toMatch(/Late by \d+ minutes?/);
  210 |     }
  211 |   });
  212 | 
  213 |   test('Half-day should be marked on early check-out', async ({ page }) => {
  214 |     // This test assumes we can manipulate check-in time for testing
  215 |     // Login
  216 |     await page.goto(`${BASE_URL}/login`);
  217 |     await page.fill('input[type="email"]', 'eve@example.com');
  218 |     await page.fill('input[type="password"]', 'password123');
  219 |     await page.click('button:has-text("Login")');
  220 |     await page.waitForURL(`${BASE_URL}/dashboard`);
  221 | 
  222 |     // Navigate to attendance
  223 |     await page.goto(`${BASE_URL}/attendance`);
  224 | 
  225 |     // Check in
  226 |     const checkInButton = page.locator('button:has-text("Check In")');
  227 |     await checkInButton.click();
  228 |     await page.waitForSelector('[role="alert"]');
  229 | 
  230 |     // Check out early (less than 4 hours)
  231 |     const checkOutButton = page.locator('button:has-text("Check Out")');
  232 |     await checkOutButton.click();
  233 |     await page.waitForSelector('[role="alert"]');
  234 | 
  235 |     // Look for half-day chip
  236 |     const halfDayChip = page.locator('text=Half Day');
  237 |     
  238 |     // Half day chip might appear if worked less than 4 hours
  239 |     // This depends on when check-in was
  240 |   });
  241 | 
  242 |   test('Attendance filter by date range', async ({ page }) => {
  243 |     // Login
  244 |     await page.goto(`${BASE_URL}/login`);
  245 |     await page.fill('input[type="email"]', 'frank@example.com');
  246 |     await page.fill('input[type="password"]', 'password123');
  247 |     await page.click('button:has-text("Login")');
  248 |     await page.waitForURL(`${BASE_URL}/dashboard`);
  249 | 
  250 |     // Navigate to attendance
  251 |     await page.goto(`${BASE_URL}/attendance`);
  252 | 
  253 |     // Check if there are date filters or pagination
  254 |     const dateInputs = page.locator('input[type="date"]');
  255 |     
  256 |     // If date filters exist
  257 |     if (await dateInputs.isVisible()) {
  258 |       const startDate = dateInputs.nth(0);
  259 |       const endDate = dateInputs.nth(1);
  260 | 
  261 |       // Set date range
  262 |       await startDate.fill('2024-05-01');
  263 |       await endDate.fill('2024-05-31');
  264 | 
  265 |       // Apply filter
  266 |       const filterButton = page.locator('button:has-text("Filter")');
  267 |       if (await filterButton.isVisible()) {
  268 |         await filterButton.click();
  269 |         
  270 |         // Table should update
  271 |         const table = page.locator('table');
  272 |         await expect(table).toBeVisible();
  273 |       }
  274 |     }
```