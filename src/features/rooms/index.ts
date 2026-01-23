/**
 * Rooms Feature Public API
 * Export only what other features need to use
 */

// ============ Hooks ============
export {
  useRooms,
  useRoomDetail,
  useJoinRoom,
  useRoomMessages,
  useSendMessage,
  useCreateRoom,
  useKickPlayer,
  useCancelRoom,
} from './hooks';

// ============ Types ============
export type {
  Room,
  RoomFullInfo,
  RoomFilters,
  RoomStatus,
  Player,
  Team,
  Message,
  CreateRoomRequest,
  JoinRoomRequest,
  SendMessageRequest,
} from './types/room.types';

// ============ UI Store (for internal use within rooms feature) ============
export { useRoomUIStore } from './store/roomUIStore';
export { useActiveRoomStore } from './store/activeRoomStore';

// ============ Screens ============
// export * from './screens';

// Don't export:
// - API functions (roomsApi) - internal implementation
// - Query keys (roomsKeys) - internal implementation  
// - Individual API/types files - use barrel exports above

