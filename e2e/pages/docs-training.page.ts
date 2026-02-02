import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Docs Training page (/docs-training)
 */
export class DocsTrainingPage {
  readonly page: Page;

  // Header section
  readonly pageTitle: Locator;
  readonly breadcrumb: Locator;

  // Tab navigation
  readonly contractsTab: Locator;
  readonly stateLegalTab: Locator;
  readonly companyDocsTab: Locator;

  // Category cards
  readonly categoryCards: Locator;

  // Training dialog
  readonly trainTemplateDialog: Locator;
  readonly uploadButton: Locator;
  readonly fileInput: Locator;
  readonly closeDialogButton: Locator;

  // Completed jobs section
  readonly completedJobsSection: Locator;
  readonly jobItems: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header section
    this.pageTitle = page.getByRole('heading', { name: /docs.*training|document.*training/i }).or(
      page.getByText(/docs.*training/i)
    );
    this.breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    // Tab navigation - using text patterns
    this.contractsTab = page.getByRole('tab', { name: /contracts/i }).or(
      page.getByRole('button', { name: /contracts/i })
    );
    this.stateLegalTab = page.getByRole('tab', { name: /state.*legal/i }).or(
      page.getByRole('button', { name: /state.*legal/i })
    );
    this.companyDocsTab = page.getByRole('tab', { name: /company/i }).or(
      page.getByRole('button', { name: /company/i })
    );

    // Category cards
    this.categoryCards = page.locator('[data-testid="category-card"]').or(
      page.locator('[role="article"]')
    );

    // Training dialog
    this.trainTemplateDialog = page.getByRole('dialog').or(
      page.locator('[data-testid="train-template-dialog"]')
    );
    this.uploadButton = page.getByRole('button', { name: /upload|train/i });
    this.fileInput = page.locator('input[type="file"]');
    this.closeDialogButton = page.getByRole('button', { name: /close|cancel/i });

    // Completed jobs section
    this.completedJobsSection = page.locator('[data-testid="completed-jobs"]').or(
      page.getByText(/completed/i).locator('..')
    );
    this.jobItems = page.locator('[data-testid="job-item"]').or(
      page.locator('[role="listitem"]')
    );
    this.emptyState = page.getByText(/no.*templates|no.*training/i).or(
      page.locator('[data-testid="empty-state"]')
    );
  }

  /**
   * Navigate to the docs training page
   */
  async goto(): Promise<void> {
    await this.page.goto('/docs-training');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for the primary page indicator
    const primaryIndicator = this.pageTitle.or(this.contractsTab);
    await primaryIndicator.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Click on a tab by name
   */
  async clickTab(tabName: 'contracts' | 'state-legal' | 'company'): Promise<void> {
    let tab: Locator;
    switch (tabName) {
      case 'contracts':
        tab = this.contractsTab;
        break;
      case 'state-legal':
        tab = this.stateLegalTab;
        break;
      case 'company':
        tab = this.companyDocsTab;
        break;
    }
    await tab.waitFor({ state: 'visible', timeout: 5000 });
    await tab.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if a tab is active
   */
  async isTabActive(tabName: 'contracts' | 'state-legal' | 'company'): Promise<boolean> {
    let tab: Locator;
    switch (tabName) {
      case 'contracts':
        tab = this.contractsTab;
        break;
      case 'state-legal':
        tab = this.stateLegalTab;
        break;
      case 'company':
        tab = this.companyDocsTab;
        break;
    }

    const ariaSelected = await tab.getAttribute('aria-selected').catch(() => null);
    if (ariaSelected === 'true') return true;

    const className = await tab.getAttribute('class').catch(() => '');
    return className?.includes('active') || className?.includes('selected') || false;
  }

  /**
   * Get the count of category cards
   */
  async getCategoryCardCount(): Promise<number> {
    try {
      await this.categoryCards.first().waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // No cards - valid state
    }
    return this.categoryCards.count();
  }

  /**
   * Click on a category card by index
   */
  async clickCategoryCard(index: number): Promise<void> {
    await this.categoryCards.nth(index).click();
  }

  /**
   * Open the train template dialog
   */
  async openTrainDialog(): Promise<void> {
    await this.uploadButton.click();
    await this.trainTemplateDialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  /**
   * Check if the dialog is open
   */
  async isDialogOpen(): Promise<boolean> {
    return this.trainTemplateDialog.isVisible().catch(() => false);
  }

  /**
   * Close the dialog
   */
  async closeDialog(): Promise<void> {
    if (await this.isDialogOpen()) {
      await this.closeDialogButton.click();
      await this.trainTemplateDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  }

  /**
   * Get the count of completed job items
   */
  async getCompletedJobCount(): Promise<number> {
    return this.jobItems.count();
  }

  /**
   * Check if showing empty state
   */
  async isShowingEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible().catch(() => false);
  }
}
