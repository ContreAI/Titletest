import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Dashboard page (/dashboard)
 */
export class DashboardPage {
  readonly page: Page;

  // Header section
  readonly pageTitle: Locator;
  readonly welcomeMessage: Locator;

  // Summary cards (metrics)
  readonly summaryCardsSection: Locator;
  readonly activeDealsCard: Locator;
  readonly projectedCommissionsCard: Locator;
  readonly preContingencyCard: Locator;
  readonly readyForCloseCard: Locator;
  readonly closedCard: Locator;

  // Lead Sources / Deal Status section
  readonly leadSourcesSection: Locator;
  readonly dealStatusHeader: Locator;
  readonly donutChart: Locator;
  readonly statusItems: Locator;

  // Ongoing Deals section (user home)
  readonly ongoingDealsSection: Locator;
  readonly dealCards: Locator;

  // Activities section
  readonly activitiesSection: Locator;
  readonly activityItems: Locator;
  readonly activitySearchInput: Locator;

  // Add Company Logo card
  readonly addLogoCard: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header section
    this.pageTitle = page.getByRole('heading', { name: /dashboard|welcome/i });
    this.welcomeMessage = page.getByText(/welcome.*back|good.*morning|good.*afternoon|good.*evening/i);

    // Summary cards section
    this.summaryCardsSection = page.locator('[data-testid="summary-cards"]').or(
      page.locator('.summary-cards')
    );
    // Use .first() before .locator('..') to avoid strict mode violations
    this.activeDealsCard = page.locator('[data-testid="active-deals-card"]').or(
      page.getByText(/active.*deals/i).first().locator('..')
    );
    this.projectedCommissionsCard = page.locator('[data-testid="projected-commissions-card"]').or(
      page.getByText(/projected.*commission/i).first().locator('..')
    );
    this.preContingencyCard = page.locator('[data-testid="pre-contingency-card"]').or(
      page.getByText(/pre.*contingency|contingency.*clear/i).first().locator('..')
    );
    this.readyForCloseCard = page.locator('[data-testid="ready-for-close-card"]').or(
      page.getByText(/ready.*close/i).first().locator('..')
    );
    this.closedCard = page.locator('[data-testid="closed-card"]').or(
      page.getByText(/closed/i).first().locator('..')
    );

    // Lead Sources / Deal Status section
    this.leadSourcesSection = page.locator('[data-testid="lead-sources"]').or(
      page.getByText(/deal.*status/i).first().locator('..')
    );
    this.dealStatusHeader = page.getByText(/deal.*status/i).first();
    this.donutChart = page.locator('[data-testid="donut-chart"]').or(
      page.locator('canvas').or(page.locator('svg').filter({ hasText: /active|pending/i }))
    );
    this.statusItems = page.locator('[data-testid="status-item"]').or(
      page.locator('.status-bar')
    );

    // Ongoing Deals section
    this.ongoingDealsSection = page.locator('[data-testid="ongoing-deals"]').or(
      page.getByText(/ongoing.*deals/i).locator('..')
    );
    this.dealCards = page.locator('[data-testid="deal-card"]').or(
      page.locator('[role="article"]')
    );

    // Activities section
    this.activitiesSection = page.locator('[data-testid="activities"]').or(
      page.getByText(/activities|recent.*activity/i).locator('..')
    );
    this.activityItems = page.locator('[data-testid="activity-item"]').or(
      page.locator('[role="listitem"]')
    );
    this.activitySearchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/search.*activities/i)
    );

    // Add Company Logo card
    this.addLogoCard = page.getByText(/add.*company.*logo|add.*logo/i).locator('..').or(
      page.locator('[data-testid="add-logo-card"]')
    );
  }

  /**
   * Navigate to the dashboard page
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for the primary dashboard indicator - the page title or welcome message
    const primaryIndicator = this.pageTitle.or(this.welcomeMessage);
    await primaryIndicator.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Check if summary cards are visible
   */
  async hasSummaryCards(): Promise<boolean> {
    // Wait for cards to potentially appear, then check
    // Use .first() to avoid strict mode violation when .or() chain matches multiple elements
    const summaryCard = this.activeDealsCard.or(this.projectedCommissionsCard);
    try {
      await summaryCard.first().waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the active deals count from the card
   */
  async getActiveDealsValue(): Promise<string> {
    const text = await this.activeDealsCard.textContent();
    // Extract numeric value from the card text
    const match = text?.match(/\d+/);
    return match ? match[0] : '0';
  }

  /**
   * Check if deal status section is visible
   */
  async hasDealStatusSection(): Promise<boolean> {
    try {
      await this.dealStatusHeader.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if chart is rendered
   */
  async hasChart(): Promise<boolean> {
    try {
      // Use .first() to avoid strict mode violation when .or() chain matches multiple elements
      await this.donutChart.first().waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the count of deal cards
   */
  async getDealCardCount(): Promise<number> {
    // Wait for deal cards container to stabilize
    // Either cards are visible or the section exists but is empty
    try {
      await this.dealCards.first().waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // No cards present - that's valid, return 0
    }
    return this.dealCards.count();
  }

  /**
   * Get the count of activity items
   */
  async getActivityItemCount(): Promise<number> {
    return this.activityItems.count();
  }

  /**
   * Search activities
   */
  async searchActivities(query: string): Promise<void> {
    try {
      await this.activitySearchInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.activitySearchInput.fill(query);
      // Wait for results to update - use a brief DOM stability wait
      await this.page.waitForLoadState('domcontentloaded');
    } catch {
      // Search input not available
    }
  }

  /**
   * Click on a deal card by index
   */
  async clickDealCard(index: number): Promise<void> {
    await this.dealCards.nth(index).click();
  }

  /**
   * Check if add logo card is visible
   */
  async hasAddLogoCard(): Promise<boolean> {
    try {
      // Use .first() to avoid strict mode violation when .or() chain matches multiple elements
      await this.addLogoCard.first().waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
