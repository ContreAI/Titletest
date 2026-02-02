import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Notifications page (/notifications)
 */
export class NotificationsPage {
  readonly page: Page;

  // Header section
  readonly pageTitle: Locator;
  readonly breadcrumb: Locator;
  readonly markAllReadButton: Locator;

  // Tab navigation
  readonly allTab: Locator;
  readonly documentsTab: Locator;
  readonly agentActivityTab: Locator;

  // Notification list
  readonly notificationItems: Locator;
  readonly emptyState: Locator;
  readonly loadMoreButton: Locator;

  // Date group headers
  readonly todayHeader: Locator;
  readonly olderHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header section - be flexible about page title
    this.pageTitle = page.getByRole('heading', { name: /notifications/i }).or(
      page.getByText(/notifications/i).first()
    );
    this.breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    this.markAllReadButton = page.getByRole('button', { name: /mark all as read/i }).or(
      page.getByRole('button', { name: /mark.*read/i })
    );

    // Tab navigation - using role and text patterns
    this.allTab = page.getByRole('tab', { name: /all/i }).or(
      page.getByRole('button', { name: /all/i })
    );
    this.documentsTab = page.getByRole('tab', { name: /documents/i }).or(
      page.getByRole('button', { name: /documents/i })
    );
    this.agentActivityTab = page.getByRole('tab', { name: /agent activity/i }).or(
      page.getByRole('button', { name: /agent/i })
    );

    // Notification list items
    this.notificationItems = page.locator('[data-testid="notification-item"]').or(
      page.locator('[role="listitem"]')
    );
    this.emptyState = page.getByText(/no notifications/i).or(
      page.locator('[data-testid="empty-state"]')
    );
    this.loadMoreButton = page.getByRole('button', { name: /load more/i });

    // Date group headers
    this.todayHeader = page.getByText(/today/i);
    this.olderHeader = page.getByText(/older/i);
  }

  /**
   * Navigate to the notifications page
   */
  async goto(): Promise<void> {
    await this.page.goto('/notifications');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for any page content indicator - be flexible about page structure
    // Use .first() to avoid strict mode violation when multiple elements match
    const pageReady = this.pageTitle
      .or(this.notificationItems.first())
      .or(this.emptyState)
      .or(this.allTab);
    await pageReady.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Click on a tab by name
   */
  async clickTab(tabName: 'all' | 'documents' | 'agent'): Promise<void> {
    let tab: Locator;
    switch (tabName) {
      case 'all':
        tab = this.allTab;
        break;
      case 'documents':
        tab = this.documentsTab;
        break;
      case 'agent':
        tab = this.agentActivityTab;
        break;
    }
    // Use .first() to avoid strict mode violation when .or() chain matches multiple elements
    await tab.first().waitFor({ state: 'visible', timeout: 5000 });
    await tab.first().click();
    // Wait for tab content to update
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if a tab is active
   */
  async isTabActive(tabName: 'all' | 'documents' | 'agent'): Promise<boolean> {
    let tab: Locator;
    switch (tabName) {
      case 'all':
        tab = this.allTab;
        break;
      case 'documents':
        tab = this.documentsTab;
        break;
      case 'agent':
        tab = this.agentActivityTab;
        break;
    }
    // Use .first() to avoid strict mode violation when .or() chain matches multiple elements
    // Check for aria-selected or active class
    const ariaSelected = await tab.first().getAttribute('aria-selected').catch(() => null);
    if (ariaSelected === 'true') return true;

    const className = await tab.first().getAttribute('class').catch(() => '');
    return className?.includes('active') || className?.includes('selected') || false;
  }

  /**
   * Get the count of notification items
   */
  async getNotificationCount(): Promise<number> {
    // Wait for notifications to load or empty state
    try {
      await this.notificationItems.first().waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // No notifications - that's valid
    }
    return this.notificationItems.count();
  }

  /**
   * Click on a notification by index
   */
  async clickNotification(index: number): Promise<void> {
    await this.notificationItems.nth(index).click();
  }

  /**
   * Click mark all as read button
   */
  async markAllAsRead(): Promise<void> {
    // Use .first() to avoid strict mode violation when .or() chain matches multiple elements
    await this.markAllReadButton.first().waitFor({ state: 'visible', timeout: 5000 });
    await this.markAllReadButton.first().click();
    // Wait for the UI to update - notifications should change state
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if the page is showing the empty state
   */
  async isShowingEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  /**
   * Get notification text by index
   */
  async getNotificationText(index: number): Promise<string> {
    return this.notificationItems.nth(index).textContent() || '';
  }

  /**
   * Check if load more button is visible
   */
  async hasLoadMoreButton(): Promise<boolean> {
    try {
      await this.loadMoreButton.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click load more button
   */
  async loadMore(): Promise<void> {
    const countBefore = await this.notificationItems.count();
    await this.loadMoreButton.click();
    // Wait for new items to appear
    await this.page.waitForFunction(
      (prevCount) => document.querySelectorAll('[data-testid="notification-item"], [role="listitem"]').length > prevCount,
      countBefore,
      { timeout: 10000 }
    );
  }
}
