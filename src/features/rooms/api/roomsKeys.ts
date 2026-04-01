import type { RoomFilters, MatchRoomFilters } from '../types/room.types';

type MyRoomsFilters = Pick<MatchRoomFilters, 'availableOnly'>;

/**
 * Query keys for React Query
 * Hierarchical structure for easy invalidation
 */
export const roomsKeys = {
  // All rooms-related queries
  all: ['rooms'] as const,
  
  // Lists of rooms
  lists: () => [...roomsKeys.all, 'list'] as const,
  list: (filters: RoomFilters) => [...roomsKeys.lists(), filters] as const,

  // myRooms: () => [...roomsKeys.all, 'my-rooms'] as const,
  historyRooms: (userId: string) => [...roomsKeys.all, 'history-rooms', userId] as const,
  myRoomsBase: () => [...roomsKeys.all, 'my-rooms'] as const,
  myRooms: (filters?: MyRoomsFilters) =>
    [...roomsKeys.myRoomsBase(), filters] as const,

  // List of room by user
  listByUser: (userId: string) => [...roomsKeys.lists(), userId] as const,
  
  // Match rooms (paginated)
  matchRooms: () => [...roomsKeys.all, 'match-rooms'] as const,
  matchRoomsList: (filters?: MatchRoomFilters) => [...roomsKeys.matchRooms(), filters] as const,
  
  // Room details
  details: () => [...roomsKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomsKeys.details(), id] as const,
  
  // Room messages
  messages: (roomId: string) => [...roomsKeys.detail(roomId), 'messages'] as const,

  /** Mẫu tạo phòng (user) */
  createPreset: () => [...roomsKeys.all, 'create-preset'] as const,
};

/**
 * Usage examples:
 * 
 * roomsKeys.all                           // ['rooms']
 * roomsKeys.lists()                       // ['rooms', 'list']
 * roomsKeys.list({ status: 'open' })      // ['rooms', 'list', { status: 'open' }]
 * roomsKeys.detail('123')                 // ['rooms', 'detail', '123']
 * roomsKeys.messages('123')               // ['rooms', 'detail', '123', 'messages']
 * 
 * Invalidation examples:
 * 
 * // Invalidate all rooms queries
 * queryClient.invalidateQueries({ queryKey: roomsKeys.all })
 * 
 * // Invalidate all room lists
 * queryClient.invalidateQueries({ queryKey: roomsKeys.lists() })
 * 
 * // Invalidate specific room detail
 * queryClient.invalidateQueries({ queryKey: roomsKeys.detail('123') })
 */

