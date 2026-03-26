/// <reference types="jest" />

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGetFriendshipStatus } from '../useGetFriendshipStatus';
import * as friendsApi from '../../api/friendsApi';
import { FriendshipStatusData } from '../../types/friends.types';

jest.mock('../../api/friendsApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 1 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGetFriendshipStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return status on success', async () => {
    const mockStatus: FriendshipStatusData = {
      otherUserId: 'user-2',
      status: 'Friends',
      friendshipId: 'friendship-abc',
    };
    (friendsApi.getFriendshipStatus as jest.Mock).mockResolvedValue(mockStatus);

    const { result } = renderHook(
      () => useGetFriendshipStatus({ userId: 'user-2' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.friendshipStatus).toEqual(mockStatus);
    expect(result.current.isError).toBe(false);
    expect(friendsApi.getFriendshipStatus).toHaveBeenCalledWith('user-2');
  });

  it('should return error state when API fails', async () => {
    (friendsApi.getFriendshipStatus as jest.Mock).mockRejectedValue(
      new Error('User not found'),
    );

    const { result } = renderHook(
      () => useGetFriendshipStatus({ userId: 'user-2' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.friendshipStatus).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });
});
