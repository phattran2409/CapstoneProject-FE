/// <reference types="jest" />

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLeaderboard, useMyRank } from '../useLeaderboard';
import * as leaderboardApi from '../../api/leaderboardApi';
import { Leaderboard } from '../../types/leaderboard.types';

jest.mock('../../api/leaderboardApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// const mockLeaderboardEntries: Leaderboard[] = [
//   {
//     rank: 1,
//     userId: 'user-1',
//     fullName: 'Nguyễn Văn A',
//     email: 'nva@example.com',
//     avatarUrl: 'https://example.com/avatar1.png',
//     currentElo: 1800,
//     eloChange: 25,
//     totalMatches: 80,
//   },
//   {
//     rank: 2,
//     userId: 'user-2',
//     fullName: 'Trần Thị B',
//     email: 'ttb@example.com',
//     avatarUrl: null,
//     currentElo: 1650,
//     eloChange: -10,
//     totalMatches: 55,
//   },
// ];

// describe('useLeaderboard', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return leaderboard data on success', async () => {
//     const mockResponse = {
//       isSuccess: true,
//       data: { leaderboard: mockLeaderboardEntries },
//     };
//     (leaderboardApi.getLeaderboardPlayers as jest.Mock).mockResolvedValue(mockResponse);

//     const { result } = renderHook(() => useLeaderboard(), {
//       wrapper: createWrapper(),
//     });

//     await waitFor(() => expect(result.current.isSuccess).toBe(true));

//     expect(result.current.data).toEqual(mockResponse);
//     expect(leaderboardApi.getLeaderboardPlayers).toHaveBeenCalledTimes(1);
//   });

//   it('should return error state when API fails', async () => {
//     (leaderboardApi.getLeaderboardPlayers as jest.Mock).mockRejectedValue(
//       new Error('Failed to fetch leaderboard'),
//     );

//     const { result } = renderHook(() => useLeaderboard(), {
//       wrapper: createWrapper(),
//     });

//     await waitFor(() => expect(result.current.isError).toBe(true));

//     expect(result.current.error).toBeTruthy();
//     expect(result.current.data).toBeUndefined();
//   });
// });

describe('useMyRank', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return my rank data on success', async () => {
    const mockRankData = { rank: 7 };
    (leaderboardApi.getMyRank as jest.Mock).mockResolvedValue(mockRankData);

    const { result } = renderHook(() => useMyRank(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRankData);
    expect(leaderboardApi.getMyRank).toHaveBeenCalledTimes(1);
  });

  it('should return error state when API fails', async () => {
    (leaderboardApi.getMyRank as jest.Mock).mockRejectedValue(
      new Error('Unauthorized'),
    );

    const { result } = renderHook(() => useMyRank(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });
});
