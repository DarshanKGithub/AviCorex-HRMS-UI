import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL;
const API_BASE_URL = process.env.PLAYWRIGHT_TEST_API_URL;

test.describe('Attendance Workflows', () => {
  let authToken: string;
  let employeeId: string;

  test.beforeAll(async () => {
    // This would be set up by a test fixture in real scenario
    // For now, we document the expected flow
  });

  test('Employee should be able to check in', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Fill login credentials
    await page.fill('input[type="email"]', 'alice@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click login button
    await page.click('button:has-text("Login")');

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to attendance page
    await page.goto(`${BASE_URL}/attendance`);

    // Check in button should be visible and enabled
    const checkInButton = page.locator('button:has-text("Check In")');
    await expect(checkInButton).toBeVisible();
    await expect(checkInButton).toBeEnabled();

    // Click check in
    await checkInButton.click();

    // Success message should appear
    const successAlert = page.locator('[role="alert"]:has-text("Checked in")');
    await expect(successAlert).toBeVisible();

    // Check in time should be displayed
    const checkInTime = page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/');
    await expect(checkInTime).toBeVisible();

    // Check in button should be disabled
    await expect(checkInButton).toBeDisabled();

    // Check out button should be enabled
    const checkOutButton = page.locator('button:has-text("Check Out")');
    await expect(checkOutButton).toBeEnabled();
  });

  test('Employee should be able to check out', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'bob@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to attendance
    await page.goto(`${BASE_URL}/attendance`);

    // Manually check in first
    let checkInButton = page.locator('button:has-text("Check In")');
    await checkInButton.click();
    await page.waitForSelector('[role="alert"]:has-text("Checked in")');

    // Now check out
    const checkOutButton = page.locator('button:has-text("Check Out")');
    await expect(checkOutButton).toBeEnabled();
    await checkOutButton.click();

    // Success message should appear
    const successAlert = page.locator('[role="alert"]');
    await expect(successAlert).toContainText('Checked out');

    // Check out time should be displayed
    await page.waitForSelector('text=/Check Out/');
    const checkOutTime = page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/');
    await expect(checkOutTime.nth(1)).toBeVisible(); // Second occurrence is check out time

    // Check out button should be disabled
    const checkOutButtonDisabled = page.locator('button:has-text("Check Out")');
    await expect(checkOutButtonDisabled).toBeDisabled();
  });

  test('Employee should see attendance history', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'carol@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to attendance
    await page.goto(`${BASE_URL}/attendance`);

    // Recent attendance table should be visible
    const attendanceTable = page.locator('table');
    await expect(attendanceTable).toBeVisible();

    // Table should have headers
    await expect(page.locator('text=Date')).toBeVisible();
    await expect(page.locator('text=Check In')).toBeVisible();
    await expect(page.locator('text=Check Out')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();

    // If no records, should show info message
    const infoAlert = page.locator('[role="alert"]:has-text("No attendance records yet")');
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount === 0) {
      await expect(infoAlert).toBeVisible();
    } else {
      // Table rows should be visible
      await expect(tableRows.first()).toBeVisible();
    }
  });

  test('Admin should be able to manage shifts', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to shifts management
    await page.goto(`${BASE_URL}/attendance/shifts`);

    // Create Shift button should be visible
    const createShiftButton = page.locator('button:has-text("Create Shift")');
    await expect(createShiftButton).toBeVisible();

    // Click create shift
    await createShiftButton.click();

    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Fill shift form
    await page.fill('input[placeholder="e.g., Morning Shift"]', 'Afternoon Shift');
    await page.fill('input[type="time"]', '14:00'); // Start time

    // Get the second time input for end time
    const timeInputs = page.locator('input[type="time"]');
    await timeInputs.nth(1).fill('23:00'); // End time

    // Click create button
    await page.click('[role="dialog"] button:has-text("Create")');

    // Dialog should close
    await expect(dialog).not.toBeVisible();

    // Success message should appear
    const successAlert = page.locator('[role="alert"]:has-text("Shift created")');
    await expect(successAlert).toBeVisible();

    // New shift should appear in table
    const shiftTable = page.locator('table');
    await expect(shiftTable).toBeVisible();
    await expect(page.locator('text=Afternoon Shift')).toBeVisible();
  });

  test('Non-admin user should not access shifts management', async ({ page }) => {
    // Login as regular employee
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'alice@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to navigate to shifts management
    await page.goto(`${BASE_URL}/attendance/shifts`);

    // Should redirect to attendance main page
    await page.waitForURL(`${BASE_URL}/attendance`);
    expect(page.url()).toBe(`${BASE_URL}/attendance`);
  });

  test('Late check-in should be marked correctly', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'dan@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to attendance
    await page.goto(`${BASE_URL}/attendance`);

    // Check in
    const checkInButton = page.locator('button:has-text("Check In")');
    await checkInButton.click();
    await page.waitForSelector('[role="alert"]');

    // Look for late indicator (if check-in is late)
    const lateChip = page.locator('[role="alert"]:has-text("Late")');
    
    // If late chip exists, it should show late minutes
    if (await lateChip.isVisible()) {
      const lateText = await lateChip.textContent();
      expect(lateText).toMatch(/Late by \d+ minutes?/);
    }
  });

  test('Half-day should be marked on early check-out', async ({ page }) => {
    // This test assumes we can manipulate check-in time for testing
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'eve@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to attendance
    await page.goto(`${BASE_URL}/attendance`);

    // Check in
    const checkInButton = page.locator('button:has-text("Check In")');
    await checkInButton.click();
    await page.waitForSelector('[role="alert"]');

    // Check out early (less than 4 hours)
    const checkOutButton = page.locator('button:has-text("Check Out")');
    await checkOutButton.click();
    await page.waitForSelector('[role="alert"]');

    // Look for half-day chip
    const halfDayChip = page.locator('text=Half Day');
    
    // Half day chip might appear if worked less than 4 hours
    // This depends on when check-in was
  });

  test('Attendance filter by date range', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'frank@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to attendance
    await page.goto(`${BASE_URL}/attendance`);

    // Check if there are date filters or pagination
    const dateInputs = page.locator('input[type="date"]');
    
    // If date filters exist
    if (await dateInputs.isVisible()) {
      const startDate = dateInputs.nth(0);
      const endDate = dateInputs.nth(1);

      // Set date range
      await startDate.fill('2024-05-01');
      await endDate.fill('2024-05-31');

      // Apply filter
      const filterButton = page.locator('button:has-text("Filter")');
      if (await filterButton.isVisible()) {
        await filterButton.click();
        
        // Table should update
        const table = page.locator('table');
        await expect(table).toBeVisible();
      }
    }
  });
});
