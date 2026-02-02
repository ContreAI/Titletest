import { Page } from '@playwright/test';
import { mockProfileResponse, testUser } from '../fixtures/auth.fixture';

const API_BASE = process.env.VITE_API_URL || 'https://api.example.com';
const API_URL = `${API_BASE}/api/v1`;

/**
 * Mock transaction data
 * Field names must match the actual API response format (camelCase)
 */
export const mockTransactions = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    transactionName: '123 Main Street Sale',
    propertyTypeId: 'single_family',
    representation: 'buyer',
    propertyAddress: {
      streetAddress: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
    },
    status: 'active',
    stage: 'Under Contract',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
    userId: testUser.id,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    transactionName: '456 Oak Avenue Purchase',
    propertyTypeId: 'condo',
    representation: 'seller',
    propertyAddress: {
      streetAddress: '456 Oak Avenue',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      country: 'United States',
    },
    status: 'active',
    stage: 'Pending',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
    userId: testUser.id,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    transactionName: '789 Pine Court',
    propertyTypeId: 'multi_family',
    representation: 'both',
    propertyAddress: {
      streetAddress: '789 Pine Court',
      city: 'Berkeley',
      state: 'CA',
      zipCode: '94704',
      country: 'United States',
    },
    status: 'closed',
    stage: 'Closed',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z',
    userId: testUser.id,
  },
];

/**
 * Mock document data
 * Field names must match the actual API response format (camelCase)
 */
export const mockDocuments = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    documentName: 'Purchase Agreement.pdf',
    documentType: 'Purchase and Sale Agreements',
    fileName: 'Purchase Agreement.pdf',
    filePath: '/documents/purchase-agreement.pdf',
    fileUrl: 'https://example.com/documents/purchase-agreement.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    transactionId: '11111111-1111-1111-1111-111111111111',
    uploadedBy: testUser.id,
    parsedStatus: 'completed',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    documentName: 'Inspection Report.pdf',
    documentType: 'Inspection Reports',
    fileName: 'Inspection Report.pdf',
    filePath: '/documents/inspection-report.pdf',
    fileUrl: 'https://example.com/documents/inspection-report.pdf',
    fileSize: 2048000,
    mimeType: 'application/pdf',
    transactionId: '11111111-1111-1111-1111-111111111111',
    uploadedBy: testUser.id,
    parsedStatus: 'completed',
    createdAt: '2024-01-17T00:00:00.000Z',
    updatedAt: '2024-01-17T00:00:00.000Z',
  },
  // Document with address mismatch alert
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    documentName: 'Title Report - Wrong Address.pdf',
    documentType: 'Title Report/Commitment',
    fileName: 'Title Report - Wrong Address.pdf',
    filePath: '/documents/title-report-wrong.pdf',
    fileUrl: 'https://example.com/documents/title-report-wrong.pdf',
    fileSize: 3072000,
    mimeType: 'application/pdf',
    transactionId: '11111111-1111-1111-1111-111111111111',
    uploadedBy: testUser.id,
    parsedStatus: 'completed',
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
    addressMismatch: {
      detected: true,
      transactionAddress: '123 Main Street, San Francisco, CA 94102',
      documentAddress: '456 Oak Avenue, Oakland, CA 94612',
      confidence: 0.45, // Low confidence indicates mismatch
    },
  },
  // Document with corrected document type (AI corrected the type)
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    documentName: 'Seller Disclosure - Corrected.pdf',
    documentType: 'Seller Property Disclosure',
    originalDocumentType: 'Disclosures', // What user originally selected
    documentTypeCorrected: true, // AI corrected the type
    fileName: 'Seller Disclosure - Corrected.pdf',
    filePath: '/documents/seller-disclosure.pdf',
    fileUrl: 'https://example.com/documents/seller-disclosure.pdf',
    fileSize: 1536000,
    mimeType: 'application/pdf',
    transactionId: '11111111-1111-1111-1111-111111111111',
    uploadedBy: testUser.id,
    parsedStatus: 'completed',
    createdAt: '2024-01-19T00:00:00.000Z',
    updatedAt: '2024-01-19T00:00:00.000Z',
  },
  // Document with both address mismatch and corrected type (edge case)
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    documentName: 'Addendum - Multiple Issues.pdf',
    documentType: 'Addenda (Addendums and Amendments)',
    originalDocumentType: 'General/Miscellaneous',
    documentTypeCorrected: true,
    fileName: 'Addendum - Multiple Issues.pdf',
    filePath: '/documents/addendum-issues.pdf',
    fileUrl: 'https://example.com/documents/addendum-issues.pdf',
    fileSize: 768000,
    mimeType: 'application/pdf',
    transactionId: '11111111-1111-1111-1111-111111111111',
    uploadedBy: testUser.id,
    parsedStatus: 'completed',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
    addressMismatch: {
      detected: true,
      transactionAddress: '123 Main Street, San Francisco, CA 94102',
      documentAddress: '789 Pine Court, Berkeley, CA 94704',
      confidence: 0.32, // Very low confidence
    },
  },
];

/**
 * Mock documents with address mismatch - for dedicated address mismatch tests
 */
export const mockDocumentsWithAddressMismatch = mockDocuments.filter(
  (doc) => doc.addressMismatch?.detected
);

/**
 * Mock documents with corrected type - for dedicated type correction tests
 */
export const mockDocumentsWithCorrectedType = mockDocuments.filter(
  (doc) => doc.documentTypeCorrected === true
);

/**
 * Mock transaction report data
 */
export const mockTransactionReport = {
  id: 'report-1',
  transactionId: '11111111-1111-1111-1111-111111111111',
  status: 'completed',
  content: 'Transaction summary report content...',
  createdAt: '2024-01-20T00:00:00.000Z',
  updatedAt: '2024-01-20T00:00:00.000Z',
};

/**
 * Mock team data
 */
export const mockTeamData = {
  members: [
    {
      id: 'member-1',
      userId: testUser.id,
      email: testUser.email,
      name: `${testUser.firstName} ${testUser.lastName}`,
      role: 'owner',
      isMaster: true,
      isCurrentUser: true,
      joinedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  invites: [],
};

/**
 * Mock notification data
 */
export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'document_uploaded',
    title: 'Document Uploaded',
    message: 'Purchase Agreement.pdf has been uploaded successfully',
    read: false,
    readAt: null,
    priority: 'normal',
    createdAt: new Date().toISOString(),
    transactionId: '11111111-1111-1111-1111-111111111111',
    documentId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    actionUrl: '/transactions/11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'notif-2',
    type: 'document_processed',
    title: 'Document Processed',
    message: 'Inspection Report.pdf has been processed',
    read: false,
    readAt: null,
    priority: 'normal',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    transactionId: '11111111-1111-1111-1111-111111111111',
    documentId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    actionUrl: '/transactions/11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'notif-3',
    type: 'agent_commented',
    title: 'Agent Activity',
    message: 'AI Agent has added comments to your transaction',
    read: true,
    readAt: new Date(Date.now() - 7200000).toISOString(),
    priority: 'low',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    transactionId: '22222222-2222-2222-2222-222222222222',
    actionUrl: '/transactions/22222222-2222-2222-2222-222222222222',
  },
  {
    id: 'notif-4',
    type: 'transaction_report_ready',
    title: 'Report Ready',
    message: 'Transaction report for 123 Main Street is ready',
    read: true,
    readAt: new Date(Date.now() - 172800000).toISOString(),
    priority: 'high',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    transactionId: '11111111-1111-1111-1111-111111111111',
    actionUrl: '/transactions/11111111-1111-1111-1111-111111111111',
  },
];

/**
 * Mock OCR training jobs data
 */
export const mockCompletedTrainingJobs = [
  {
    id: 'job-1',
    status: 'completed',
    fileName: 'Purchase_Agreement_Template.pdf',
    fileSize: 524288,
    s3Path: 's3://templates/job-1.pdf',
    category: 'contracts',
    documentType: 'Purchase Agreement',
    templateName: 'Standard Purchase Agreement',
    fieldCount: 15,
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'job-2',
    status: 'completed',
    fileName: 'Disclosure_Form_CA.pdf',
    fileSize: 256000,
    s3Path: 's3://templates/job-2.pdf',
    category: 'state_legal',
    documentType: 'Disclosure Form',
    templateName: 'California Disclosure',
    fieldCount: 22,
    createdAt: '2024-01-10T00:00:00.000Z',
  },
];

/**
 * Mock subscription data - matches actual API format
 */
export const mockSubscription = {
  id: 'sub-1',
  plan: {
    name: 'Pro',
    id: 'plan-pro',
  },
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  price: {
    unitAmount: 9900, // $99.00 in cents
  },
  cancelAtPeriodEnd: false,
  usage: [
    { name: 'documents_analyzed', value: 230, limit: 500 },
    { name: 'time_saved_hours', value: 45, limit: 100 },
    { name: 'critical_errors', value: 3, limit: 50 },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock invoices data
 */
export const mockInvoices = [
  {
    id: 'inv-1',
    amount: 99.0,
    currency: 'USD',
    date: '2024-01-01T00:00:00.000Z',
    status: 'paid',
    description: 'Pro Plan - January 2024',
    downloadUrl: '/invoices/inv-1/download',
  },
  {
    id: 'inv-2',
    amount: 99.0,
    currency: 'USD',
    date: '2023-12-01T00:00:00.000Z',
    status: 'paid',
    description: 'Pro Plan - December 2023',
    downloadUrl: '/invoices/inv-2/download',
  },
  {
    id: 'inv-3',
    amount: 99.0,
    currency: 'USD',
    date: '2023-11-01T00:00:00.000Z',
    status: 'paid',
    description: 'Pro Plan - November 2023',
    downloadUrl: '/invoices/inv-3/download',
  },
];

/**
 * Mock payment methods data
 */
export const mockPaymentMethods = [
  {
    id: 'pm-1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
];

/**
 * Mock user settings data
 */
export const mockUserSettings = {
  id: 'settings-1',
  userId: testUser.id,
  notificationPreferences: {
    emailMarketing: true,
    emailUpdates: true,
    emailAlerts: true,
    pushEnabled: true,
    pushTransactions: true,
    pushDocuments: true,
    pushTeam: true,
    digestFrequency: 'daily',
  },
  accessibilitySettings: {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    fontSize: 16,
    screenReaderOptimized: false,
    keyboardNavigation: true,
  },
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-20T00:00:00.000Z',
};

/**
 * Set up all API mocks for authenticated pages
 */
export async function setupApiMocks(page: Page): Promise<void> {
  // Mock /users/profile
  await page.route(`${API_URL}/users/profile`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockProfileResponse }),
    });
  });

  // Mock GET /transactions
  await page.route(`${API_URL}/transactions`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockTransactions }),
      });
    } else if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      const newTransaction = {
        id: `txn-${Date.now()}`,
        ...body,
        status: 'active',
        stage: 'New',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: testUser.id,
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: newTransaction }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock GET /transactions/:id
  await page.route(`${API_URL}/transactions/*`, async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/\/transactions\/([^/]+)$/);
    const id = idMatch ? idMatch[1] : null;

    if (route.request().method() === 'GET' && id) {
      const transaction = mockTransactions.find((t) => t.id === id);
      if (!transaction) {
        // Return 404 for unknown transaction IDs
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Transaction not found' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: transaction }),
      });
    } else if (route.request().method() === 'PUT' && id) {
      const body = route.request().postDataJSON();
      const transaction = mockTransactions.find((t) => t.id === id) || mockTransactions[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { ...transaction, ...body, updatedAt: new Date().toISOString() },
        }),
      });
    } else if (route.request().method() === 'DELETE' && id) {
      await route.fulfill({
        status: 204,
        body: '',
      });
    } else {
      await route.continue();
    }
  });

  // Mock GET /documents/transaction/:id
  await page.route(`${API_URL}/documents/transaction/*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockDocuments }),
    });
  });

  // Mock POST /documents/upload
  await page.route(`${API_URL}/documents/upload`, async (route) => {
    const newDocument = {
      id: `doc-${Date.now()}`,
      documentName: 'Uploaded Document.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024000,
      transactionId: 'txn-1',
      parsedStatus: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: newDocument }),
    });
  });

  // Mock POST /documents/:id/reassign - for document reassignment
  await page.route(new RegExp(`${API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/documents/[^/]+/reassign$`), async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'doc-reassigned',
            transactionId: body.newTransactionId,
            documentName: 'Reassigned Document.pdf',
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock DELETE and PUT /documents/:id
  await page.route(`${API_URL}/documents/*`, async (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        body: '',
      });
    } else if (method === 'PUT') {
      // Handle address mismatch dismissal and other updates
      const url = route.request().url();
      const idMatch = url.match(/\/documents\/([^/]+)$/);
      const docId = idMatch ? idMatch[1] : 'doc-1';
      const body = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: docId,
            ...body,
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock POST /transaction-reports/generate
  await page.route(`${API_URL}/transaction-reports/generate`, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockTransactionReport }),
    });
  });

  // Mock GET /transaction-reports/transaction/:id
  await page.route(`${API_URL}/transaction-reports/transaction/*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockTransactionReport }),
    });
  });

  // Mock GET /team (team data for broker invite system)
  await page.route(`${API_URL}/team`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockTeamData }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock team invite endpoints
  await page.route(`${API_URL}/team/invites`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { success: true } }),
    });
  });

  await page.route(`${API_URL}/team/invites/*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { success: true } }),
    });
  });

  await page.route(`${API_URL}/team/members/*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { success: true } }),
    });
  });

  // Mock GET /notifications
  await page.route(`${API_URL}/notifications`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockNotifications }),
      });
    } else if (route.request().method() === 'DELETE') {
      // Delete all notifications
      await route.fulfill({
        status: 204,
        body: '',
      });
    } else {
      await route.continue();
    }
  });

  // Mock POST /notifications/:id/read
  await page.route(`${API_URL}/notifications/*/read`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock POST /notifications/mark-all-read
  await page.route(`${API_URL}/notifications/mark-all-read`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock DELETE /notifications/:id
  await page.route(new RegExp(`${API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/notifications/[^/]+$`), async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 204,
        body: '',
      });
    } else {
      await route.continue();
    }
  });

  // Mock GET /ocr-templates/training/completed
  await page.route(`${API_URL}/ocr-templates/training/completed`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockCompletedTrainingJobs }),
    });
  });

  // Mock POST /ocr-templates/train
  await page.route(`${API_URL}/ocr-templates/train`, async (route) => {
    const newJob = {
      id: `job-${Date.now()}`,
      status: 'processing',
      fileName: 'New_Template.pdf',
      fileSize: 100000,
      createdAt: new Date().toISOString(),
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: newJob }),
    });
  });

  // Mock GET /ocr-templates/training/:jobId
  await page.route(`${API_URL}/ocr-templates/training/*`, async (route) => {
    const url = route.request().url();
    // Skip if it's the /completed endpoint
    if (url.includes('/completed')) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'job-1',
          status: 'completed',
          fileName: 'Template.pdf',
          fieldCount: 10,
        },
      }),
    });
  });

  // Mock GET /subscriptions
  await page.route(`${API_URL}/subscriptions`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockSubscription }),
    });
  });

  // Mock GET /invoices
  await page.route(`${API_URL}/invoices`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockInvoices }),
    });
  });

  // Mock GET /payment-methods
  await page.route(`${API_URL}/payment-methods`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockPaymentMethods }),
    });
  });

  // Mock GET/PUT /user-settings (for preferences, accessibility, notifications pages)
  await page.route(`${API_URL}/user-settings`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUserSettings),
      });
    } else {
      await route.continue();
    }
  });

  // Mock PUT /user-settings/notification-preferences
  await page.route(`${API_URL}/user-settings/notification-preferences`, async (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUserSettings.notificationPreferences,
          ...body,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock PUT /user-settings/accessibility-settings
  await page.route(`${API_URL}/user-settings/accessibility-settings`, async (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUserSettings.accessibilitySettings,
          ...body,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock PUT /user-settings/preferences
  await page.route(`${API_URL}/user-settings/preferences`, async (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUserSettings.preferences,
          ...body,
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Set up mock for unauthenticated requests (401 responses)
 */
export async function setupUnauthenticatedMocks(page: Page): Promise<void> {
  await page.route(`${API_URL}/users/profile`, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    });
  });
}

/**
 * Set up mock for empty transactions list
 */
export async function setupEmptyTransactionsMock(page: Page): Promise<void> {
  await page.route(`${API_URL}/transactions`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Set up mock for empty notifications list
 */
export async function setupEmptyNotificationsMock(page: Page): Promise<void> {
  await page.route(`${API_URL}/notifications`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Set up mock for empty training jobs list
 */
export async function setupEmptyTrainingJobsMock(page: Page): Promise<void> {
  await page.route(`${API_URL}/ocr-templates/training/completed`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });
}
