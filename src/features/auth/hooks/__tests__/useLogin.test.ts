/// <reference types="jest" />

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogin } from '../useLogin';
import { authApi } from '../../api/authApi';
import { setAuthToken, setRefreshToken } from '@/shared/api/client';
import { useAuthStore } from '../../store/authStore';

// Mock dependencies
jest.mock('../../api/authApi');
jest.mock('@/shared/api/client', () => ({
  apiClient: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setRefreshToken: jest.fn(),
}));
jest.mock('../../store/authStore');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLogin', () => {
  const mockSetUser = jest.fn();
  const mockSetToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
      setToken: mockSetToken,
    });
  });

  it('should call authApi.login and upate store on success', async () => {
    const mockResponse = {
      data: {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        id: 'user-1',
        email: 'user@example.com',
      },
    };
    (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'user@example.com', password: 'Password1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password1',
    });
    expect(setAuthToken).toHaveBeenCalledWith('access-token-123');
    expect(setRefreshToken).toHaveBeenCalledWith('refresh-token-456');
    expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data);
    expect(mockSetToken).toHaveBeenCalledWith('access-token-123');
  });

  it('should clear auth state on error', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'bad@example.com', password: 'wrong123' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setAuthToken).toHaveBeenCalledWith(null);
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockSetToken).toHaveBeenCalledWith(null);
  });
});