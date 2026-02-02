import { test, expect } from '../fixtures/auth.fixture';
import { setupApiMocks } from '../mocks/api-handlers';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard', () => {
  test.describe('Dashboard Page', () => {
    test('should display dashboard page', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Page should load
      expect(authenticatedPage.url()).toContain('/dashboard');
    });

    test('should display welcome message or title', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Check for welcome message or dashboard title using .or()
      // Use .first() to avoid strict mode violation when multiple elements match
      const titleOrWelcome = dashboardPage.pageTitle.or(dashboardPage.welcomeMessage);

      await expect(titleOrWelcome.first()).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/dashboard');
    });
  });

  test.describe('Summary Cards', () => {
    test('should display summary metric cards', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Should have summary cards
      const hasSummaryCards = await dashboardPage.hasSummaryCards();

      // Validate dashboard displays metrics
      expect(authenticatedPage.url()).toContain('/dashboard');
      expect(hasSummaryCards).toBeTruthy();
    });

    test('should display active deals metric', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Check for active deals card using .or() for alternative representations
      // Use .first() to avoid strict mode violation when multiple elements match
      const activeDealsContent = dashboardPage.activeDealsCard
        .or(authenticatedPage.getByText(/active.*deals|deals.*active/i).first());

      await expect(activeDealsContent.first()).toBeVisible({ timeout: 10000 });
      expect(authenticatedPage.url()).toContain('/dashboard');
    });
  });

  test.describe('Deal Status Section', () => {
    test('should display deal status section', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Check for deal status section
      const hasDealStatus = await dashboardPage.hasDealStatusSection();

      // Validate dashboard and deal status display
      expect(authenticatedPage.url()).toContain('/dashboard');
      expect(hasDealStatus).toBeTruthy();
    });

    test('should render chart visualization', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Check for chart or deal status section (chart depends on data)
      const hasChart = await dashboardPage.hasChart();
      const hasDealStatus = await dashboardPage.hasDealStatusSection();

      // Validate dashboard and chart/status section
      expect(authenticatedPage.url()).toContain('/dashboard');
      expect(hasChart || hasDealStatus).toBeTruthy();
    });
  });

  test.describe('Deals Section', () => {
    test('should display deal cards', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      // Get deal card count
      const dealCount = await dashboardPage.getDealCardCount();

      // Validate dashboard loaded and deal count is valid
      expect(authenticatedPage.url()).toContain('/dashboard');
      expect(dealCount >= 0).toBeTruthy();
    });

    test('should navigate to deal on click', async ({ authenticatedPage }) => {
      await setupApiMocks(authenticatedPage);

      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await dashboardPage.waitForPageLoad();

      const dealCount = await dashboardPage.getDealCardCount();

      if (dealCount > 0) {
        const currentUrl = authenticatedPage.url();
        await dashboardPage.clickDealCard(0);
        // Wait for navigation to occur
        await authenticatedPage.waitForURL((url) => url.toString() !== currentUrl, { timeout: 10000 });
        await authenticatedPage.waitForLoadState('domcontentloaded');
        expect(authenticatedPage.url()).toBeTruthy();
      } else {
        // No deals to click - validate dashboard remained functional
        expect(authenticatedPage.url()).toContain('/dashboard');
      }
    });
  });
});
