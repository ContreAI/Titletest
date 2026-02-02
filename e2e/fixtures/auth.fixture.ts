import { test as base, Page } from '@playwright/test';

/**
 * Test user data for authenticated tests
 */
export const testUser = {
  id: 'test-user-123',
  email: 'test@contre.ai',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  role: 'user',
  avatar: null,
  designation: 'Software Engineer',
  phone: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock user profile API response format (matches backend response)
 */
export const mockProfileResponse = {
  id: testUser.id,
  user_id: testUser.id,
  email: testUser.email,
  first_name: testUser.firstName,
  last_name: testUser.lastName,
  role: testUser.role,
  profile_image: testUser.avatar,
  designation: testUser.designation,
  phone: testUser.phone,
  created_at: testUser.createdAt,
  updated_at: testUser.updatedAt,
};

/**
 * Auth storage state for E2E bypass (matches auth.store.ts persist format)
 */
const mockAuthStorage = {
  state: {
    user: {
      id: testUser.id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      name: testUser.name,
      role: testUser.role,
      avatar: testUser.avatar,
      designation: testUser.designation,
      phone: testUser.phone,
      createdAt: testUser.createdAt,
      updatedAt: testUser.updatedAt,
    },
    token: null,
    refreshToken: null,
    isAuthenticated: true,
    isLoading: false,
  },
  version: 0,
};

/**
 * Helper to set up authentication cookies and mock the profile API
 */
export async function setupAuthentication(page: Page): Promise<void> {
  const apiBase = process.env.VITE_API_URL || 'https://api.example.com';
  const apiUrl = `${apiBase}/api/v1`;
  const supabaseUrl = 'https://test-project.supabase.co';

  // Set up E2E auth bypass flag and localStorage BEFORE page loads
  // This allows the auth store to skip cookie validation
  await page.addInitScript((authStorage) => {
    // Set the E2E bypass flag
    (window as any).__E2E_AUTH_BYPASS__ = true;
    // Pre-populate localStorage with auth state
    localStorage.setItem('auth-storage', JSON.stringify(authStorage));
  }, mockAuthStorage);

  // Mock Supabase auth API calls to prevent session validation errors
  await page.route(`${supabaseUrl}/auth/**`, async (route) => {
    const url = route.request().url();

    // Mock token refresh endpoint
    if (url.includes('/token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: testUser.id,
            email: testUser.email,
            aud: 'authenticated',
            role: 'authenticated',
          },
        }),
      });
    } else if (url.includes('/user')) {
      // Mock user endpoint
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: testUser.id,
          email: testUser.email,
          aud: 'authenticated',
          role: 'authenticated',
        }),
      });
    } else {
      // For other auth endpoints, return success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }
  });

  // Mock the /users/profile endpoint to return authenticated user
  await page.route(`${apiUrl}/users/profile`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: mockProfileResponse,
      }),
    });
  });

  // Set up Supabase auth cookies
  // The auth store checks for cookies that match: sb-*-auth-token
  // Use 'test-project' to match the VITE_SUPABASE_URL in playwright.config.ts
  const projectRef = 'test-project';

  // Create a mock auth token (base64 encoded JSON)
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    user: {
      id: testUser.id,
      email: testUser.email,
    },
  };
  const encodedSession = Buffer.from(JSON.stringify(mockSession)).toString('base64');

  // Set the Supabase auth cookies (split into chunks as Supabase does)
  await page.context().addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: encodedSession,
      domain: 'localhost',
      path: '/',
    },
    {
      name: `sb-${projectRef}-auth-token.0`,
      value: encodedSession.substring(0, 100),
      domain: 'localhost',
      path: '/',
    },
  ]);
}

/**
 * Helper to clear authentication
 */
export async function clearAuthentication(page: Page): Promise<void> {
  await page.context().clearCookies();

  // Clear localStorage auth state - must be on a valid page first
  try {
    await page.evaluate(() => {
      localStorage.removeItem('auth-storage');
    });
  } catch {
    // Ignore - page may not be on a valid origin for localStorage access
  }
}

/**
 * Extended test fixture with authenticated page
 */
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication before test
    await setupAuthentication(page);

    // Use the authenticated page
    await use(page);

    // Clean up after test
    await clearAuthentication(page);
  },
});

export { expect } from '@playwright/test';
