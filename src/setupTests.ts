import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Supabase SSR client to prevent initialization errors in tests
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

// Mock the lib/supabase/client module
vi.mock('lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
  getCookieDomain: vi.fn().mockReturnValue(undefined),
  markAuthAsFailed: vi.fn(),
  resetAuthFailedFlag: vi.fn(),
  isAuthPermanentlyFailed: vi.fn().mockReturnValue(false),
}));
