import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { RoomFilters } from '../types/room.types';

/**
 * Hook to fetch list of rooms
 * 
 * @param filters - Optional filters for rooms
 * @param options - React Query options
 * 
 * @example
 * const { data: rooms, isLoading, error, refetch } = useRooms({ status: 'open' });
 */
export const useRooms = (filters?: RoomFilters) => {
  return useQuery({
    queryKey: roomsKeys.list(filters || {}),
    queryFn: () => roomsApi.getRooms(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes (formerly cacheTime)
  });
};

