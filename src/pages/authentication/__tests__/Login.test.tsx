import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import Login from '../Login';

// Mock supabase client
const mockSignInWithPassword = vi.fn();
const mockSignInWithOtp = vi.fn();

vi.mock('lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
    },
  },
}));

// Mock auth store
const mockInitSession = vi.fn();
vi.mock('modules/auth/store/auth.store', () => ({
  useAuthStore: () => ({
    initSession: mockInitSession,
  }),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

// Helper to render component with router
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockReset();
    mockSignInWithOtp.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('renders correctly', () => {
    it('should display welcome message', () => {
      renderLogin();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your dashboard')).toBeInTheDocument();
    });

    it('should display both login method tabs', () => {
      renderLogin();
      expect(screen.getByRole('tab', { name: /password/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /magic link/i })).toBeInTheDocument();
    });

    it('should default to password login tab', () => {
      renderLogin();
      const passwordTab = screen.getByRole('tab', { name: /password/i });
      expect(passwordTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show email and password fields for password login', () => {
      renderLogin();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      // Password field exists (use getByLabelText with exact match to avoid "Show password" button)
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });

  describe('tab switching', () => {
    it('should switch to magic link tab when clicked', async () => {
      const user = userEvent.setup();
      renderLogin();

      const magicLinkTab = screen.getByRole('tab', { name: /magic link/i });
      await user.click(magicLinkTab);

      expect(magicLinkTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show magic link description when on magic link tab', async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));

      expect(
        screen.getByText(/enter your email and we'll send you a magic link/i)
      ).toBeInTheDocument();
    });

    it('should hide password field when on magic link tab', async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));

      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    });

    it('should clear error when switching tabs', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      renderLogin();

      // Fill in form and submit to trigger error
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Switch to magic link tab
      await user.click(screen.getByRole('tab', { name: /magic link/i }));

      // Error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('password login', () => {
    it('should call signInWithPassword when submitting password form', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null,
      });
      mockInitSession.mockResolvedValueOnce(undefined);

      renderLogin();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null,
      });
      mockInitSession.mockResolvedValueOnce(undefined);

      renderLogin();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should display error message on failed login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials'),
      });

      renderLogin();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      });
    });
  });

  describe('magic link login', () => {
    it('should call signInWithOtp when submitting magic link form', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      renderLogin();

      // Switch to magic link tab
      await user.click(screen.getByRole('tab', { name: /magic link/i }));

      // Fill in email and submit
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledWith({
          email: 'test@example.com',
          options: {
            shouldCreateUser: false,
          },
        });
      });
    });

    it('should show confirmation dialog after sending magic link', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText('Check your mailbox!')).toBeInTheDocument();
      });
    });

    it('should display email in confirmation dialog', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));
      await user.type(screen.getByLabelText(/email/i), 'myemail@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText('myemail@example.com')).toBeInTheDocument();
      });
    });

    it('should disable send button after sending magic link', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');

      const sendButton = screen.getByRole('button', { name: /send magic link/i });
      await user.click(sendButton);

      // After sending, the same button should be disabled (text changes to countdown)
      await waitFor(() => {
        expect(sendButton).toBeDisabled();
      });
    });

    it('should display error message on failed magic link send', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: new Error('User not found'),
      });

      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));
      await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('should not create new users (shouldCreateUser: false)', async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      renderLogin();

      await user.click(screen.getByRole('tab', { name: /magic link/i }));
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              shouldCreateUser: false,
            }),
          })
        );
      });
    });
  });

  describe('sign up link', () => {
    it('should display sign up link', () => {
      renderLogin();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });
  });
});
