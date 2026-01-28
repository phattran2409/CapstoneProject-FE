import { usePagination } from '@/shared/hooks/usePagination';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { MatchRoom, MatchRoomFilters } from '../types/room.types';

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
    queryKey: roomsKeys.matchRooms(),
    fetchFunction: async (page, pageSize) => {
      const result = await roomsApi.getMatchRooms({ 
        page, 
        pageSize,
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




