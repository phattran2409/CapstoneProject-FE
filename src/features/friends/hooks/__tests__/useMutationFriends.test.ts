/// <reference types="jest" />

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRespondToFriendRequest, useRemoveFriend } from '../useMutationFriends';
import * as friendsApi from '../../api/friendsApi';
import { friendKeys } from '../../api/friendKeys';

jest.mock('../../api/friendsApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
};

describe('useRespondToFriendRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mutate successfully and invalidate requests', async () => {
    const mockResponse = {
      friendshipId: 'friendship-1',
      requesterId: 'user-2',
      status: 'Accepted',
      respondedAt: '2026-03-26T10:00:00Z',
    };
    (friendsApi.respondToFriendRequest as jest.Mock).mockResolvedValue(mockResponse);
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRespondToFriendRequest(), { wrapper });

    act(() => {
      result.current.mutate({ requesterId: 'user-2', accept: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(friendsApi.respondToFriendRequest).toHaveBeenCalledWith('user-2', true);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: friendKeys.requests() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: friendKeys.list() });
  });

  it('should return error when request mutation fails', async () => {
    (friendsApi.respondToFriendRequest as jest.Mock).mockRejectedValue(
      new Error('Server error'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useRespondToFriendRequest(), { wrapper });

    act(() => {
      result.current.mutate({ requesterId: 'user-2', accept: true });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useRemoveFriend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mutate successfully and invalidate related keys', async () => {
    const mockResponse = {
      friendId: 'user-2',
      removedAt: '2026-03-26T10:00:00Z',
    };
    (friendsApi.removeFriend as jest.Mock).mockResolvedValue(mockResponse);
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRemoveFriend(), { wrapper });

    act(() => {
      result.current.mutate('user-2');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(friendsApi.removeFriend).toHaveBeenCalledWith('user-2');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: friendKeys.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: friendKeys.status('user-2') });
  });

  it('should return error when remove mutation fails', async () => {
    (friendsApi.removeFriend as jest.Mock).mockRejectedValue(
      new Error('User not found'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useRemoveFriend(), { wrapper });

    act(() => {
      result.current.mutate('user-999');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});
