import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '@/app/forgot-password/page';
import { authAPI } from '@/lib/api';

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

// Mock the API
jest.mock('@/lib/api', () => ({
  authAPI: {
    forgotPassword: jest.fn(),
  },
  default: {},
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Password dimenticata?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invia istruzioni/i })).toBeInTheDocument();
  });

  it('shows validation error on empty submit', async () => {
    render(<ForgotPasswordPage />);
    fireEvent.click(screen.getByRole('button', { name: /invia istruzioni/i }));
    await waitFor(() => {
      expect(screen.getByText('Inserisci la tua email')).toBeInTheDocument();
    });
  });

  it('shows success state after API call', async () => {
    (authAPI.forgotPassword as jest.Mock).mockResolvedValueOnce({
      message: 'Email inviata',
    });

    render(<ForgotPasswordPage />);

    const input = screen.getByPlaceholderText('La tua email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /invia istruzioni/i }));

    await waitFor(() => {
      expect(screen.getByText('Email inviata!')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    (authAPI.forgotPassword as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ForgotPasswordPage />);

    const input = screen.getByPlaceholderText('La tua email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /invia istruzioni/i }));

    await waitFor(() => {
      expect(screen.getByText(/si è verificato un errore/i)).toBeInTheDocument();
    });
  });

  it('has a link back to login', () => {
    render(<ForgotPasswordPage />);
    const loginLink = screen.getByRole('link', { name: /torna al login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
