import { test, expect } from '../fixtures/auth.fixture';
import { setupApiMocks } from '../mocks/api-handlers';
import { AccountSettingsPage } from '../pages/account-settings.page';

test.describe('Billing & Subscription', () => {
  test.describe('Subscription Tab', () => {
    test('should navigate to subscription page', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/account-settings/subscription');
      await authenticatedPage.waitForLoadState('domcontentloaded');
      // Wait for page content to confirm load - use .first() on entire chain to avoid strict mode violation
      const pageContent = authenticatedPage.getByText(/account settings|subscription/i).first()
        .or(authenticatedPage.getByRole('heading').first());
      await expect(pageContent.first()).toBeVisible({ timeout: 10000 });

      // URL should reflect subscription tab
      expect(authenticatedPage.url()).toContain('/subscription');
    });

    test('should display subscription content', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/account-settings/subscription');
      await authenticatedPage.waitForLoadState('domcontentloaded');

      // Page should have loaded (check for account settings title or subscription content)
      // Use .first() on entire chain to avoid strict mode violation
      const pageContent = authenticatedPage.getByText(/account settings/i).first()
        .or(authenticatedPage.getByText(/subscription/i).first())
        .or(authenticatedPage.getByRole('heading').first());

      // Use Playwright's expect with auto-retry instead of isVisible()
      await expect(pageContent.first()).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/subscription');
    });
  });

  test.describe('Billing History Tab', () => {
    test('should navigate to billing history page', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/account-settings/billing-history');
      await authenticatedPage.waitForLoadState('domcontentloaded');
      // Wait for page content to confirm load - use .first() on entire chain to avoid strict mode violation
      const pageContent = authenticatedPage.getByText(/account settings|billing/i).first()
        .or(authenticatedPage.getByRole('heading').first());
      await expect(pageContent.first()).toBeVisible({ timeout: 10000 });

      // URL should reflect billing-history tab
      expect(authenticatedPage.url()).toContain('/billing-history');
    });

    test('should display billing history content', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/account-settings/billing-history');
      await authenticatedPage.waitForLoadState('domcontentloaded');

      // Page should have loaded (check for account settings title or billing content)
      // Use .first() on entire chain to avoid strict mode violation
      const pageContent = authenticatedPage.getByText(/account settings/i).first()
        .or(authenticatedPage.getByText(/billing/i).first())
        .or(authenticatedPage.getByRole('heading').first());

      // Use Playwright's expect with auto-retry instead of isVisible()
      await expect(pageContent.first()).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/billing-history');
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate between subscription and billing tabs', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/account-settings/subscription');
      await authenticatedPage.waitForLoadState('domcontentloaded');
      // Wait for page content to confirm load - use .first() on entire chain to avoid strict mode violation
      const pageContent = authenticatedPage.getByText(/account settings|subscription/i).first()
        .or(authenticatedPage.getByRole('heading').first());
      await expect(pageContent.first()).toBeVisible({ timeout: 10000 });

      // Find billing history tab and click it
      const billingTab = authenticatedPage.getByRole('button', { name: /billing history/i });
      await expect(billingTab).toBeVisible({ timeout: 5000 });
      await billingTab.click();
      await authenticatedPage.waitForURL('**/billing-history', { timeout: 10000 });
      await authenticatedPage.waitForLoadState('domcontentloaded');
      expect(authenticatedPage.url()).toContain('/billing-history');

      // Navigate back to subscription
      const subscriptionTab = authenticatedPage.getByRole('button', { name: /subscription/i });
      await expect(subscriptionTab).toBeVisible({ timeout: 5000 });
      await subscriptionTab.click();
      await authenticatedPage.waitForURL('**/subscription', { timeout: 10000 });
      await authenticatedPage.waitForLoadState('domcontentloaded');
      expect(authenticatedPage.url()).toContain('/subscription');
    });
  });
});
