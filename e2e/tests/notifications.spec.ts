import { test, expect } from '../fixtures/auth.fixture';
import { setupApiMocks, setupEmptyNotificationsMock } from '../mocks/api-handlers';
import { NotificationsPage } from '../pages/notifications.page';

test.describe('Notifications', () => {
  test.describe('Notifications Page', () => {
    test('should navigate to notifications page', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // URL should reflect notifications page
      expect(authenticatedPage.url()).toContain('/notifications');
    });

    test('should display notifications content', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Verify page loaded with content using Playwright's auto-retry
      await expect(authenticatedPage.locator('body')).not.toBeEmpty();
      expect(authenticatedPage.url()).toContain('/notifications');
    });

    test('should display notification tabs or content area', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Check for tabs - use a specific tab selector instead of .or() chain
      const tab = authenticatedPage.getByRole('tab').first();

      // Use Playwright's expect with auto-retry
      await expect(tab).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/notifications');
    });

    test('should display mark all as read button', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Check for mark all button specifically - it exists even if disabled
      const markAllButton = authenticatedPage.getByRole('button', { name: /mark all as read/i });

      await expect(markAllButton).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/notifications');
    });
  });

  test.describe('Tab Navigation', () => {
    test('should have clickable tabs', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Try to find and click tabs
      const tabs = await authenticatedPage.getByRole('tab').all();

      if (tabs.length > 1) {
        // Click the second tab (documents)
        await tabs[1].waitFor({ state: 'visible' });
        await tabs[1].click();
        // Wait for tab panel content to update
        await authenticatedPage.waitForLoadState('domcontentloaded');
      }

      // Page should still be functional
      expect(authenticatedPage.url()).toContain('/notifications');
    });

    test('should navigate between tabs', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Get all tabs
      const tabs = await authenticatedPage.getByRole('tab').all();

      // Navigate through available tabs
      for (const tab of tabs) {
        await tab.click();
        // Wait for the tab to become selected
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 5000 });
      }

      // Page should still be functional
      expect(authenticatedPage.url()).toContain('/notifications');
    });
  });

  test.describe('Empty State', () => {
    test('should handle empty notifications', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);
      await setupEmptyNotificationsMock(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Page should load without errors
      expect(authenticatedPage.url()).toContain('/notifications');
    });
  });

  test.describe('Mark As Read', () => {
    test('should have mark all as read button', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const notificationsPage = new NotificationsPage(authenticatedPage);
      await notificationsPage.goto();
      await notificationsPage.waitForPageLoad();

      // Check for mark all button specifically - it exists even if disabled
      const markAllButton = authenticatedPage.getByRole('button', { name: /mark all as read/i });

      await expect(markAllButton).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/notifications');
    });
  });
});
