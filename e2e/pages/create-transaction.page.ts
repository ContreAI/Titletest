import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Create Transaction page (/transactions/new)
 */
export class CreateTransactionPage {
  readonly page: Page;

  // Header
  readonly pageTitle: Locator;
  readonly breadcrumb: Locator;

  // Stepper
  readonly stepper: Locator;
  readonly stepLabels: Locator;
  readonly activeStep: Locator;

  // Step 1: Transaction Details Form
  readonly customNameCheckbox: Locator;
  readonly transactionNameInput: Locator;
  readonly propertyTypeSelector: Locator;
  readonly representationSelector: Locator;

  // Address fields
  readonly streetAddressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly countryInput: Locator;

  // Buttons
  readonly cancelButton: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly createButton: Locator;

  // Review step
  readonly reviewSection: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header - page shows "CREATE TRANSACTION" in uppercase
    this.pageTitle = page.getByRole('heading', { name: /create transaction/i });
    this.breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    // Stepper
    this.stepper = page.getByRole('group').or(page.locator('.MuiStepper-root'));
    this.stepLabels = page.locator('.MuiStepLabel-label');
    this.activeStep = page.locator('.MuiStepLabel-active');

    // Step 1: Transaction Details Form
    // Transaction name - now hidden by default, with checkbox to enable custom name
    this.customNameCheckbox = page.getByRole('checkbox', { name: /custom transaction name/i });
    // The form shows "Transaction Name *" label (only visible when custom name checkbox is checked)
    // Use specific text input locator to avoid matching the checkbox
    this.transactionNameInput = page.getByRole('textbox', { name: /transaction name/i }).or(
      page.locator('input[type="text"][name="transactionName"]')
    );
    // Property type may not exist - UI shows "Transaction Type" at the bottom
    this.propertyTypeSelector = page.getByLabel(/property type|transaction type/i).or(
      page.locator('[data-testid="property-type-selector"]')
    );
    // UI shows "I'm Representing *" with Buyer/Seller/Both buttons (not radio buttons)
    this.representationSelector = page.getByText(/i'm representing/i).locator('..').or(
      page.locator('[data-testid="representation-selector"]')
    );

    // Address fields - UI shows "Property Address" section with placeholders
    this.streetAddressInput = page.getByPlaceholder(/street address/i).or(
      page.getByLabel(/street address/i).or(
        page.locator('input[name="propertyAddress.streetAddress"]')
      )
    );
    this.cityInput = page.getByPlaceholder(/city/i).or(
      page.getByLabel(/city/i).or(
        page.locator('input[name="propertyAddress.city"]')
      )
    );
    // State is a combobox (dropdown) with "State" placeholder
    this.stateInput = page.getByRole('combobox', { name: /state/i }).or(
      page.locator('[role="combobox"]').filter({ hasText: /state/i }).or(
        page.locator('input[name="propertyAddress.state"]')
      )
    );
    this.zipCodeInput = page.getByPlaceholder(/zip code/i).or(
      page.getByLabel(/zip/i).or(
        page.locator('input[name="propertyAddress.zipCode"]')
      )
    );
    this.countryInput = page.getByLabel(/country/i).or(
      page.locator('input[name="propertyAddress.country"]')
    );

    // Buttons
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.nextButton = page.getByRole('button', { name: /next|continue/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.createButton = page.getByRole('button', { name: /create|confirm/i });

    // Review step
    this.reviewSection = page.locator('[data-testid="review-section"]').or(
      page.getByText(/review.*confirm/i).locator('..')
    );
  }

  /**
   * Navigate to the create transaction page
   */
  async goto(): Promise<void> {
    await this.page.goto('/transactions/new');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for main content to appear
    await this.page.waitForSelector('main', { state: 'attached', timeout: 10000 }).catch(() => {});
    // Give React time to render
    await this.page.waitForTimeout(500);
    // Wait for any of: page title, form input, or stepper to be visible
    const pageIndicator = this.pageTitle
      .or(this.transactionNameInput)
      .or(this.page.getByText(/create transaction/i).first());
    await pageIndicator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  /**
   * Check if custom name checkbox is checked
   */
  async isCustomNameEnabled(): Promise<boolean> {
    return this.customNameCheckbox.isChecked();
  }

  /**
   * Enable custom transaction name (check the checkbox)
   */
  async enableCustomName(): Promise<void> {
    if (!(await this.isCustomNameEnabled())) {
      await this.customNameCheckbox.check();
    }
  }

  /**
   * Disable custom transaction name (uncheck the checkbox)
   */
  async disableCustomName(): Promise<void> {
    if (await this.isCustomNameEnabled()) {
      await this.customNameCheckbox.uncheck();
    }
  }

  /**
   * Fill in the transaction name (enables custom name checkbox first)
   */
  async fillTransactionName(name: string): Promise<void> {
    await this.enableCustomName();
    await this.transactionNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.transactionNameInput.fill(name);
  }

  /**
   * Get the current transaction name value
   * When custom name is enabled, reads from the visible input
   * When disabled, the value is managed internally by react-hook-form (synced to street address)
   */
  async getTransactionNameValue(): Promise<string> {
    // Check if the transaction name input is visible (custom name mode)
    if (await this.transactionNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      return this.transactionNameInput.inputValue();
    }
    // When in auto-sync mode, return the street address value as that's what will be used
    return this.streetAddressInput.inputValue();
  }

  /**
   * Select property type
   */
  async selectPropertyType(type: string): Promise<void> {
    await this.propertyTypeSelector.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  /**
   * Select representation (buyer/seller/dual)
   */
  async selectRepresentation(representation: 'buyer' | 'seller' | 'dual'): Promise<void> {
    const label = representation.charAt(0).toUpperCase() + representation.slice(1);
    await this.page.getByRole('radio', { name: new RegExp(label, 'i') }).click();
  }

  /**
   * Fill in the property address
   */
  async fillAddress(address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  }): Promise<void> {
    await this.streetAddressInput.fill(address.street);
    await this.cityInput.fill(address.city);
    // State is an autocomplete dropdown - type to filter, then select
    await this.stateInput.click();
    await this.stateInput.fill(address.state);
    // Wait for options to filter, then click the first matching option
    await this.page.getByRole('option').first().click();
    await this.zipCodeInput.fill(address.zip);
    if (address.country) {
      await this.countryInput.fill(address.country);
    }
  }

  /**
   * Fill in the complete transaction form (step 1)
   */
  async fillTransactionForm(data: {
    name: string;
    propertyType?: string;
    representation?: 'buyer' | 'seller' | 'dual';
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country?: string;
    };
  }): Promise<void> {
    await this.fillTransactionName(data.name);

    if (data.propertyType) {
      await this.selectPropertyType(data.propertyType);
    }

    if (data.representation) {
      await this.selectRepresentation(data.representation);
    }

    await this.fillAddress(data.address);
  }

  /**
   * Click the Next button to proceed to review step
   */
  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  /**
   * Click the Back button to go back to form step
   */
  async clickBack(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * Click the Cancel button
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Click the Create button to submit the form
   */
  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Complete the full transaction creation flow
   */
  async createTransaction(data: {
    name: string;
    propertyType?: string;
    representation?: 'buyer' | 'seller' | 'dual';
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country?: string;
    };
  }): Promise<void> {
    await this.fillTransactionForm(data);
    await this.clickNext();
    await this.clickCreate();
  }

  /**
   * Get the current step number (0-indexed)
   */
  async getCurrentStep(): Promise<number> {
    const activeStepText = await this.activeStep.textContent();
    const steps = ['Create Transaction', 'Review & Confirm'];
    return steps.findIndex((step) => activeStepText?.includes(step)) || 0;
  }

  /**
   * Check if there are validation errors visible
   */
  async hasValidationErrors(): Promise<boolean> {
    const errorMessages = this.page.locator('.MuiFormHelperText-root.Mui-error');
    return (await errorMessages.count()) > 0;
  }

  /**
   * Get validation error messages
   */
  async getValidationErrors(): Promise<string[]> {
    const errorMessages = this.page.locator('.MuiFormHelperText-root.Mui-error');
    return errorMessages.allTextContents();
  }
}
