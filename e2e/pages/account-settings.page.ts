import { Page, Locator } from '@playwright/test';

type AccountTab = 'profile' | 'subscription' | 'billing-history' | 'notifications' | 'accessibility' | 'preferences';

/**
 * Page object for the Account Settings page (/account-settings)
 */
export class AccountSettingsPage {
  readonly page: Page;

  // Header
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;

  // Navigation tabs
  readonly sidebarNavigation: Locator;
  readonly profileTab: Locator;
  readonly subscriptionTab: Locator;
  readonly billingHistoryTab: Locator;
  readonly notificationsTab: Locator;
  readonly accessibilityTab: Locator;
  readonly preferencesTab: Locator;

  // Content area
  readonly contentArea: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { name: /account settings/i });
    this.pageSubtitle = page.getByText(/manage your profile.*subscription.*billing/i);

    // Navigation tabs - use getByText since ListItemButton renders as <li> not <button>
    this.sidebarNavigation = page.getByRole('list').first();
    this.profileTab = page.getByText('Profile', { exact: true });
    this.subscriptionTab = page.getByText('Subscription', { exact: true });
    this.billingHistoryTab = page.getByText('Billing History', { exact: true });
    this.notificationsTab = page.getByText('Notifications', { exact: true });
    this.accessibilityTab = page.getByText('Accessibility', { exact: true });
    this.preferencesTab = page.getByText('Preferences', { exact: true });

    // Content area
    this.contentArea = page.locator('[data-testid="settings-content"]').or(
      page.locator('main').or(page.locator('.MuiPaper-root').nth(1))
    );
  }

  /**
   * Navigate to the account settings page
   */
  async goto(tab?: AccountTab): Promise<void> {
    const path = tab ? `/account-settings/${tab}` : '/account-settings';
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Navigate to a specific tab
   */
  async navigateToTab(tab: AccountTab): Promise<void> {
    const tabButton = this.getTabButton(tab);
    await tabButton.waitFor({ state: 'visible', timeout: 5000 });
    await tabButton.click();
    await this.page.waitForURL(`**/account-settings/${tab}`, { timeout: 10000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get the tab button for a specific tab
   */
  private getTabButton(tab: AccountTab): Locator {
    switch (tab) {
      case 'profile':
        return this.profileTab;
      case 'subscription':
        return this.subscriptionTab;
      case 'billing-history':
        return this.billingHistoryTab;
      case 'notifications':
        return this.notificationsTab;
      case 'accessibility':
        return this.accessibilityTab;
      case 'preferences':
        return this.preferencesTab;
      default:
        return this.profileTab;
    }
  }

  /**
   * Check if a specific tab is active/selected
   * The tab is considered active if:
   * 1. It has the Mui-selected class, OR
   * 2. The current URL matches the tab path, OR
   * 3. The tab has a different background/styling indicating selection
   */
  async isTabActive(tab: AccountTab): Promise<boolean> {
    // First check URL - most reliable indicator
    const url = this.page.url();
    if (url.includes(`/${tab}`)) {
      return true;
    }

    // Check for visual indicators of selection
    const tabButton = this.getTabButton(tab);
    const classes = await tabButton.getAttribute('class').catch(() => '');
    if (classes?.includes('Mui-selected') || classes?.includes('selected') || classes?.includes('active')) {
      return true;
    }

    // Check parent element for selection state (sometimes the ListItem gets the class)
    const parent = tabButton.locator('..');
    const parentClasses = await parent.getAttribute('class').catch(() => '');
    if (parentClasses?.includes('Mui-selected') || parentClasses?.includes('selected') || parentClasses?.includes('active')) {
      return true;
    }

    return false;
  }

  /**
   * Get the current active tab based on URL
   */
  async getCurrentTab(): Promise<AccountTab> {
    const url = this.page.url();
    if (url.includes('/subscription')) return 'subscription';
    if (url.includes('/billing-history')) return 'billing-history';
    if (url.includes('/notifications')) return 'notifications';
    if (url.includes('/accessibility')) return 'accessibility';
    if (url.includes('/preferences')) return 'preferences';
    return 'profile';
  }

  /**
   * Navigate through all tabs in order
   */
  async navigateAllTabs(): Promise<void> {
    const tabs: AccountTab[] = ['profile', 'subscription', 'billing-history', 'notifications', 'accessibility', 'preferences'];
    for (const tab of tabs) {
      await this.navigateToTab(tab);
    }
  }

  // Profile tab specific methods

  /**
   * Get the first name input (profile tab)
   */
  getFirstNameInput(): Locator {
    return this.page.getByLabel(/first name/i).or(
      this.page.locator('input[name="firstName"]')
    );
  }

  /**
   * Get the last name input (profile tab)
   */
  getLastNameInput(): Locator {
    return this.page.getByLabel(/last name/i).or(
      this.page.locator('input[name="lastName"]')
    );
  }

  /**
   * Get the email input (profile tab)
   */
  getEmailInput(): Locator {
    return this.page.getByLabel(/email/i).or(
      this.page.locator('input[name="email"]')
    );
  }

  /**
   * Get the save button (profile tab)
   */
  getSaveButton(): Locator {
    return this.page.getByRole('button', { name: /save|update/i });
  }

  /**
   * Update profile information
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<void> {
    if (data.firstName) {
      await this.getFirstNameInput().fill(data.firstName);
    }
    if (data.lastName) {
      await this.getLastNameInput().fill(data.lastName);
    }
    if (data.email) {
      await this.getEmailInput().fill(data.email);
    }
    await this.getSaveButton().click();
  }
}
