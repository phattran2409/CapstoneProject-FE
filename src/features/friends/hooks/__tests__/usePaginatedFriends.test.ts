/// <reference types="jest" />

import { renderHook } from '@testing-library/react-native';
import { usePaginatedFriends } from '../usePaginatedFriends';
import { usePagination } from '@/shared/hooks/usePagination';
import { friendKeys } from '../../api/friendKeys';
import { getFriends } from '../../api';
import type { Friend } from '../../types/friends.types';

jest.mock('@/shared/hooks/usePagination');
jest.mock('../../api', () => ({
  ...jest.requireActual('../../api'),
  getFriends: jest.fn(),
}));

const mockPaginationBase = {
  data: [],
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  hasMore: false,
  refresh: jest.fn(),
  loadMore: jest.fn(),
  setData: jest.fn(),
};

describe('usePaginatedFriends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePagination as jest.Mock).mockReturnValue(mockPaginationBase);
  });

  it('should call usePagination with default config', () => {
    renderHook(() => usePaginatedFriends());

    expect(usePagination).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [...friendKeys.list(), ''],
        pageSize: 10,
        enabled: true,
      }),
    );
  });

  it('should call getFriends via fetchFunction', async () => {
    renderHook(() => usePaginatedFriends({ searchTerm: 'Alice' }));
    const { fetchFunction } = (usePagination as jest.Mock).mock.calls[0][0];

    (getFriends as jest.Mock).mockResolvedValue({
      friends: [],
      totalPages: 1,
      totalCount: 0,
    });

    await fetchFunction(2, 10);
    expect(getFriends).toHaveBeenCalledWith(2, 10, 'Alice');
  });

  it('should map pagination data to hook output', () => {
    const mockFriends: Friend[] = [
      {
        userId: 'u1',
        fullName: 'Nguyen A',
        avatarUrl: '',
        friendsSince: '2026-01-01',
        currentElo: 1000,
        preferredPositions: 'Forward',
      },
    ];
    (usePagination as jest.Mock).mockReturnValue({
      ...mockPaginationBase,
      data: mockFriends,
      hasMore: true,
    });

    const { result } = renderHook(() => usePaginatedFriends());

    expect(result.current.friends).toEqual(mockFriends);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.setFriends).toBeDefined();
  });
});
