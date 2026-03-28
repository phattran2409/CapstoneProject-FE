/**
 * Rooms Feature Public API
 * Export only what other features need to use
 */

// ============ Hooks ============
export {
  useMatchRooms,
  useRoomDetail,
  useMatchRoomDetail,
  useJoinMatchRoom,
  useJoinRoomAsUnassigned,
  useUpdateParticipant,
  useLeaveMatchRoom,
  useRoomMessages,
  useSendMessage,
  useCreateRoom,
  useKickPlayer,
  useCancelRoom,
  useUpdateRoomPrivacy,
  useUpdateRoomInfo,
} from './hooks';

// ============ Types ============
export type {
  RoomFilters,
  RoomStatus,
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

