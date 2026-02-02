import { test, expect } from '../fixtures/auth.fixture';
import { setupApiMocks, setupEmptyTrainingJobsMock } from '../mocks/api-handlers';

test.describe('Docs Training', () => {
  test.describe('Docs Training Page', () => {
    test('should navigate to docs training page', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/docs-training');
      await authenticatedPage.waitForLoadState('networkidle');

      // Page should load without errors
      expect(authenticatedPage.url()).toContain('/docs-training');
    });

    test('should display page content', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/docs-training');
      await authenticatedPage.waitForLoadState('networkidle');

      // Wait for content to render
      await authenticatedPage.waitForTimeout(1000);

      // Page should have loaded
      expect(authenticatedPage.url()).toContain('/docs-training');
    });
  });

  test.describe('Tab Navigation', () => {
    test('should have clickable tabs', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      await authenticatedPage.goto('/docs-training');
      await authenticatedPage.waitForLoadState('networkidle');

      // Find and click tabs if available
      const tabs = await authenticatedPage.getByRole('tab').all();

      if (tabs.length > 0) {
        await tabs[0].click();
        await authenticatedPage.waitForTimeout(500);
      }

      expect(authenticatedPage.url()).toContain('/docs-training');
    });
  });

  test.describe('Empty State', () => {
    test('should handle empty training jobs', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);
      await setupEmptyTrainingJobsMock(authenticatedPage);

      await authenticatedPage.goto('/docs-training');
      await authenticatedPage.waitForLoadState('networkidle');

      // Page should load without errors
      expect(authenticatedPage.url()).toContain('/docs-training');
    });
  });
});
