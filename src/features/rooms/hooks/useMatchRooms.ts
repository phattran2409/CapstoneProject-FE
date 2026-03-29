import { usePagination } from '@/shared/hooks/usePagination';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { MatchRoom, MatchRoomFilters, MyRoom } from '../types/room.types';

/**
 * Hook to fetch paginated list of match rooms
 * 
 * @param filters - Optional filters for match rooms
 * 
 * @example
 * const { 
 *   matchRooms, 
 *   loading, 
 *   refreshing, 
 *   loadingMore,
 *   hasMore,
 *   refresh,
 *   loadMore 
 * } = useMatchRooms({ status: 'Open' });
 */
export const useMatchRooms = (filters?: Omit<MatchRoomFilters, 'page' | 'pageSize'>) => {
  const pagination = usePagination<MatchRoom>({
    queryKey: roomsKeys.matchRoomsList(filters),
    fetchFunction: async (page, pageSize) => {
      const result = await roomsApi.getMatchRooms({ 
        page, 
        pageSize,
        availableOnly: true,
        ...filters
      });
      return {
        data: result.data.rooms,
        totalPages: result.data.totalPages,
        totalCount: result.data.totalCount,
      };
    },
    pageSize: 10,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
    onError: (error) => {
      console.error('Error fetching match rooms:', error);
    },
  });

  return {
    matchRooms: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    page: pagination.page,
    totalPages: pagination.totalPages,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
  };
};

export const useMyRooms = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const pagination = usePagination<MyRoom>({
    queryKey: roomsKeys.myRooms(),
    fetchFunction: async () => {
      const result = await roomsApi.getMyRooms();
      return {
        data: result.data.rooms,
        totalPages: result.data.totalPages,
        totalCount: result.data.totalCount,
      };
    },
    pageSize: 10,
    staleTime: 5 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching my rooms:", error);
    },
  });
  return {
    myRooms: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    page: pagination.page,
    totalPages: pagination.totalPages,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
  };
};

export const useHistoryRooms = (
  userId: string,
  options?: { enabled?: boolean },
) => {
  const enabled = (options?.enabled ?? true) && !!userId;
  const pagination = usePagination<MyRoom>({
    queryKey: roomsKeys.historyRooms(userId),
    fetchFunction: async () => {
      const result = await roomsApi.getHistoryRooms(userId);
      return {
        data: result.data.rooms,
        totalPages: result.data.totalPages,
        totalCount: result.data.totalCount,
      };
    },
    pageSize: 10,
    staleTime: 5 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching history rooms:", error);
    },
  });
  return {
    myRooms: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    page: pagination.page,
    totalPages: pagination.totalPages,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
  };
};


