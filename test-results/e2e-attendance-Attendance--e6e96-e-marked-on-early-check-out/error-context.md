# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/attendance.spec.ts >> Attendance Workflows >> Half-day should be marked on early check-out
- Location: e2e/attendance.spec.ts:213:7

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
  174 |     await page.fill('input[type="email"]', 'alice@example.com');
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
> 217 |     await page.fill('input[type="email"]', 'eve@example.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
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
  275 |   });
  276 | });
  277 | 
```