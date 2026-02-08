import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { MatchRoomFullInfo } from '../types/room.types';

/**
 * Hook to fetch full match room information
 * Includes field, venue, host, and participants
 * 
 * Response structure:
 * - host: { userId, fullName, avatarUrl }
 * - field: { fieldId, fieldName, fieldType, hourlyRate, venue: {...} }
 * - participants: { teamA: [...], teamB: [...], unassigned: [...] }
 * 
 * @param roomId - Match Room ID to fetch
 * 
 * @example
 * const { data: room, isLoading, error, refetch } = useMatchRoomDetail('123');
 */
export const useMatchRoomDetail = (roomId: string, options?: { enabled?: boolean }) => {
  return useQuery<MatchRoomFullInfo>({
    queryKey: roomsKeys.detail(roomId),
    queryFn: () => roomsApi.getRoomFullInfo(roomId),
    enabled: options?.enabled !== false && !!roomId,
    staleTime: 1 * 60 * 1000,  // 1 minute (shorter for real-time room)
    gcTime: 5 * 60 * 1000,     // 5 minutes
  });
};
