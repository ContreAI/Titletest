import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Transaction List page (/transactions)
 */
export class TransactionListPage {
  readonly page: Page;

  // Header section
  readonly pageTitle: Locator;
  readonly newTransactionButton: Locator;
  readonly breadcrumb: Locator;

  // Stats banner
  readonly statsBanner: Locator;
  readonly hoursSavedStat: Locator;
  readonly projectedCommissionStat: Locator;
  readonly closingSoonStat: Locator;

  // Deals list section
  readonly dealsListSection: Locator;
  readonly sortDropdown: Locator;
  readonly filterDropdown: Locator;
  readonly dealCards: Locator;
  readonly emptyState: Locator;

  // Deal summary panel
  readonly summaryPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header section - using text content as primary selectors
    this.pageTitle = page.getByRole('heading', { name: /your transactions/i });
    // Use .first() because there may be multiple "New Transaction" buttons (header and empty state)
    this.newTransactionButton = page.getByRole('button', { name: /new transaction/i }).first();
    this.breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    // Stats banner
    this.statsBanner = page.locator('[data-testid="stats-banner"]').or(
      page.locator('text=Hours Saved').locator('..').locator('..')
    );
    this.hoursSavedStat = page.getByText(/hours saved/i);
    this.projectedCommissionStat = page.getByText(/projected commission/i);
    this.closingSoonStat = page.getByText(/closing soon/i);

    // Deals list section
    this.dealsListSection = page.locator('[data-testid="deals-list-section"]').or(
      page.locator('text=Your Deals').locator('..')
    );
    this.sortDropdown = page.getByRole('combobox', { name: /sort/i }).or(
      page.locator('[data-testid="sort-dropdown"]')
    );
    this.filterDropdown = page.getByRole('combobox', { name: /filter/i }).or(
      page.locator('[data-testid="filter-dropdown"]')
    );
    this.dealCards = page.locator('[data-testid="deal-card"]').or(
      page.locator('[role="article"]')
    );
    this.emptyState = page.getByText(/no transactions/i).or(
      page.locator('[data-testid="empty-state"]')
    );

    // Deal summary panel
    this.summaryPanel = page.locator('[data-testid="deal-summary-panel"]').or(
      page.locator('aside')
    );
  }

  /**
   * Navigate to the transaction list page
   */
  async goto(): Promise<void> {
    await this.page.goto('/transactions');
    // Use domcontentloaded - networkidle can timeout due to Supabase client activity
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for main content to appear with a reasonable timeout
    await this.page.waitForSelector('main', { state: 'attached', timeout: 10000 }).catch(() => {});
    // Give React a moment to render
    await this.page.waitForTimeout(500);
  }

  /**
   * Click the New Transaction button
   */
  async clickNewTransaction(): Promise<void> {
    await this.newTransactionButton.click();
  }

  /**
   * Get the number of deal cards displayed
   */
  async getDealCardCount(): Promise<number> {
    await this.dealCards.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return this.dealCards.count();
  }

  /**
   * Click on a deal card by index
   */
  async clickDealCard(index: number): Promise<void> {
    await this.dealCards.nth(index).click();
  }

  /**
   * Click on a deal card by name
   */
  async clickDealCardByName(name: string): Promise<void> {
    await this.page.getByText(name).click();
  }

  /**
   * Sort deals by a specific option
   */
  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.click();
    await this.page.getByRole('option', { name: option }).click();
  }

  /**
   * Filter deals by stage
   */
  async filterByStage(stage: string): Promise<void> {
    await this.filterDropdown.click();
    await this.page.getByRole('option', { name: stage }).click();
  }

  /**
   * Hover over a deal card
   */
  async hoverDealCard(index: number): Promise<void> {
    await this.dealCards.nth(index).hover();
  }

  /**
   * Check if the page is showing the empty state
   */
  async isShowingEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible();
  }
}
