import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL;
const AUTH_STORAGE_KEY = 'hrms_auth_session';
const AUTH_SESSION = {
  token: 'playwright-token',
  user: {
    id: 'user-notify-1',
    full_name: 'Notification User',
    email: 'notify@example.com',
    role: 'Employee',
    avatar_url: null,
  },
};

function seedAuth(page: Page) {
  return page.addInitScript(
    ({ key, session }) => {
      window.localStorage.setItem(key, JSON.stringify(session));
    },
    { key: AUTH_STORAGE_KEY, session: AUTH_SESSION }
  );
}

function createNotification(id: string, status: string, subject: string) {
  const now = new Date().toISOString();
  return {
    id,
    recipient_id: AUTH_SESSION.user.id,
    template_id: null,
    event_type: 'leave_approved',
    channel: 'in_app',
    subject,
    message: `${subject} body`,
    data: null,
    status,
    read_at: status === 'Read' ? now : null,
    sent_at: now,
    error_message: null,
    created_at: now,
    updated_at: now,
  };
}

test.describe('Notification workflows', () => {
  test('shows unread badge in the shell and opens notifications', async ({ page }) => {
    await seedAuth(page);

    await page.route('**/notifications/user/me/unread-count', async (route) => {
      await route.fulfill({ json: { unread_count: 4 } });
    });

    await page.goto(`${BASE_URL}/dashboard`);

    await expect(page.getByText('Workforce Insights')).toBeVisible();
    await expect(page.locator('[data-testid="notification-badge"] .MuiBadge-badge')).toHaveText('4');

    await page.getByLabel('Open notifications').click();
    await page.waitForURL('**/notifications');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  });

  test('notification center can mark read and delete items', async ({ page }) => {
    await seedAuth(page);

    let notifications = [
      createNotification('notif-1', 'Pending', 'Leave approved'),
      createNotification('notif-2', 'Read', 'Payslip ready'),
    ];

    await page.route('**/notifications/user/me/unread-count', async (route) => {
      await route.fulfill({ json: { unread_count: notifications.filter((item) => item.status !== 'Read').length } });
    });

    await page.route('**/notifications/user/me/stats', async (route) => {
      await route.fulfill({
        json: {
          unread_count: notifications.filter((item) => item.status !== 'Read').length,
          total_count: notifications.length,
          by_channel: { in_app: notifications.length },
          by_status: notifications.reduce((accumulator, item) => {
            accumulator[item.status] = (accumulator[item.status] || 0) + 1;
            return accumulator;
          }, {} as Record<string, number>),
        },
      });
    });

    await page.route('**/notifications/user/me/notifications**', async (route) => {
      const url = new URL(route.request().url());
      const unreadOnly = url.searchParams.get('unread_only') === 'true';
      await route.fulfill({ json: notifications.filter((item) => !unreadOnly || item.status !== 'Read') });
    });

    await page.route('**/notifications/**', async (route) => {
      const request = route.request();
      const requestUrl = new URL(request.url());
      const notificationId = requestUrl.pathname.split('/').pop() ?? '';

      if (request.method() === 'PATCH' && notificationId) {
        notifications = notifications.map((item) =>
          item.id === notificationId
            ? { ...item, status: 'Read', read_at: new Date().toISOString() }
            : item
        );
        await route.fulfill({ json: notifications.find((item) => item.id === notificationId) });
        return;
      }

      if (request.method() === 'DELETE' && notificationId) {
        notifications = notifications.filter((item) => item.id !== notificationId);
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.fallback();
    });

    await page.goto(`${BASE_URL}/notifications`);

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByText('Leave approved')).toBeVisible();
    await expect(page.getByText('Payslip ready')).toBeVisible();

    await page.getByRole('button', { name: 'Mark Read' }).click();
    await expect(page.getByText('Leave approved')).toBeVisible();
    await expect(page.getByText('Read').first()).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByText('Leave approved')).not.toBeVisible();
  });

  test('notification settings saves channel preferences', async ({ page }) => {
    await seedAuth(page);

    let preferences = {
      id: 'pref-1',
      user_id: AUTH_SESSION.user.id,
      email_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      push_enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await page.route('**/notifications/preferences/me', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: preferences });
        return;
      }

      if (route.request().method() === 'PATCH') {
        const payload = route.request().postDataJSON() as Partial<typeof preferences>;
        preferences = { ...preferences, ...payload, updated_at: new Date().toISOString() };
        await route.fulfill({ json: preferences });
        return;
      }

      await route.fallback();
    });

    await page.goto(`${BASE_URL}/settings/notifications`);

    await expect(page.getByRole('heading', { name: 'Notification Settings' })).toBeVisible();
    await expect(page.getByLabel('Email Notifications')).toBeChecked();
    await expect(page.getByLabel('SMS Notifications')).not.toBeChecked();

    await page.getByLabel('SMS Notifications').click();
    await page.getByLabel('Push Notifications').click();
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    await expect(page.getByRole('alert')).toContainText('Preferences saved successfully');
    await expect(page.getByLabel('SMS Notifications')).toBeChecked();
    await expect(page.getByLabel('Push Notifications')).not.toBeChecked();
  });
});
