import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckMagicLinkDialog from '../CheckMagicLinkDialog';

// Mock the Image component
vi.mock('components/base/Image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} data-testid="illustration" />,
}));

// Mock IconifyIcon
vi.mock('components/base/IconifyIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

describe('CheckMagicLinkDialog', () => {
  const defaultProps = {
    open: true,
    handleClose: vi.fn(),
    email: 'test@example.com',
    time: 0,
    handleSendAgain: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders correctly', () => {
    it('should display dialog when open is true', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not display dialog when open is false', () => {
      render(<CheckMagicLinkDialog {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display "Check your mailbox!" title', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByText('Check your mailbox!')).toBeInTheDocument();
    });

    it('should display the user email', () => {
      render(<CheckMagicLinkDialog {...defaultProps} email="myemail@example.com" />);
      expect(screen.getByText('myemail@example.com')).toBeInTheDocument();
    });

    it('should display magic link instructions', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(
        screen.getByText(/click the link in the email to sign in instantly/i)
      ).toBeInTheDocument();
    });

    it('should display expiry notice', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByText(/the link will expire in 1 hour/i)).toBeInTheDocument();
    });

    it('should display spam folder reminder', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
    });

    it('should display illustration image', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByTestId('illustration')).toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('should call handleClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(<CheckMagicLinkDialog {...defaultProps} handleClose={handleClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('send again link', () => {
    it('should display "Send again" link when time is 0', () => {
      render(<CheckMagicLinkDialog {...defaultProps} time={0} />);
      expect(screen.getByText(/send again/i)).toBeInTheDocument();
      expect(screen.queryByText(/in \d+s/)).not.toBeInTheDocument();
    });

    it('should display countdown when time is greater than 0', () => {
      render(<CheckMagicLinkDialog {...defaultProps} time={30} />);
      expect(screen.getByText(/send again in 30s/i)).toBeInTheDocument();
    });

    it('should call handleSendAgain when link is clicked and time is 0', async () => {
      const user = userEvent.setup();
      const handleSendAgain = vi.fn();

      render(<CheckMagicLinkDialog {...defaultProps} time={0} handleSendAgain={handleSendAgain} />);

      const sendAgainLink = screen.getByText(/send again/i);
      await user.click(sendAgainLink);

      expect(handleSendAgain).toHaveBeenCalledTimes(1);
    });

    it('should disable send again link when countdown is active', () => {
      render(<CheckMagicLinkDialog {...defaultProps} time={30} />);

      const sendAgainLink = screen.getByText(/send again in 30s/i);
      expect(sendAgainLink).toHaveStyle({ pointerEvents: 'none' });
    });

    it('should prevent default when clicking send again link', async () => {
      const handleSendAgain = vi.fn();

      render(<CheckMagicLinkDialog {...defaultProps} time={0} handleSendAgain={handleSendAgain} />);

      const sendAgainLink = screen.getByText(/send again/i);

      // Create a mock event to check preventDefault
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      fireEvent(sendAgainLink, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have close button with aria-label', () => {
      render(<CheckMagicLinkDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });
});
