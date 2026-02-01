/**
 * Rooms Feature Public API
 * Export only what other features need to use
 */

// ============ Hooks ============
export {
  useRooms,
  useMatchRooms,
  useRoomDetail,
  useMatchRoomDetail,
  useJoinRoom,
  useJoinMatchRoom,
  useJoinRoomAsUnassigned,
  useUpdateParticipant,
  useLeaveMatchRoom,
  useRoomMessages,
  useSendMessage,
  useCreateRoom,
  useKickPlayer,
  useCancelRoom,
} from './hooks';

// ============ Types ============
export type {
  RoomFilters,
  RoomStatus,
  Message,
  CreateRoomRequest,
  JoinRoomRequest,
  SendMessageRequest,
  // Match Room Types
  MatchRoom,
  MatchRoomsResponse,
  MatchRoomFilters,
  MatchRoomFullInfo,
  MatchRoomHost,
  MatchRoomField,
  MatchRoomVenue,
  MatchRoomParticipant,
  MatchRoomParticipants,
  MatchRoomStatus,
  MatchFormat,
  TeamAssignment,
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

