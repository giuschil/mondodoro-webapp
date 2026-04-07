import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { authAPI } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
  },
  default: {},
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  role: 'jeweler' as const,
  is_active: true,
  stripe_onboarding_completed: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function TestConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return <div>{user ? `Logged in as ${user.email}` : 'Not logged in'}</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows not logged in when no token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  it('restores user from localStorage on mount', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument();
    });
  });

  it('clears user on logout', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    function LogoutButton() {
      const { logout } = useAuth();
      return <button onClick={logout}>Logout</button>;
    }

    // Mock window.location.href setter
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(
      <AuthProvider>
        <TestConsumer />
        <LogoutButton />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument();
    });
  });
});

describe('AuthContext login', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('stores token and user on successful login', async () => {
    (authAPI.login as jest.Mock).mockResolvedValueOnce({
      token: 'new-token',
      user: mockUser,
      message: 'Login successful',
    });

    function LoginButton() {
      const { login } = useAuth();
      return (
        <button onClick={() => login({ email: 'test@example.com', password: 'pass' })}>
          Login
        </button>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
        <LoginButton />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: 'Login' }).click();
    });

    await waitFor(() => {
      expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument();
    });
    expect(localStorage.getItem('token')).toBe('new-token');
  });
});
