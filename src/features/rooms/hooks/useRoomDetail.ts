import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

/**
 * Hook to fetch full room information
 * Includes venue, teams, and players
 * 
 * @param roomId - Room ID to fetch
 * 
 * @example
 * const { data: room, isLoading, error, refetch } = useRoomDetail('123');
 */
export const useRoomDetail = (roomId: string) => {
  return useQuery({
    queryKey: roomsKeys.detail(roomId),
    queryFn: () => roomsApi.getRoomFullInfo(roomId),
    enabled: !!roomId,  // Only fetch if roomId exists
    staleTime: 2 * 60 * 1000,  // 2 minutes
    gcTime: 5 * 60 * 1000,      // 5 minutes
  });
};

