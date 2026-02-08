export type RoomStatus = "open" | "full" | "closed" | "completed" | "cancelled";

// ==================== Match Room Types (from API) ====================

export type MatchRoomStatus =
  | "Open"
  | "Full"
  | "Closed"
  | "InProgress"
  | "Completed"
  | "Cancelled";
export type MatchFormat = "FiveVsFive" | "SevenVsSeven" | string;
export type TeamAssignment = "A" | "B" | "Unassigned";

/**
 * Host info trong MatchRoom
 */
export interface MatchRoomHost {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}

/**
 * Venue info trong Field
 */
export interface MatchRoomVenue {
  venueId: string;
  venueName: string;
  address: string;
  contactPhone: string | null;
}

/**
 * Field (sân) info
 */
export interface MatchRoomField {
  fieldId: string;
  fieldName: string;
  fieldType: MatchFormat;
  hourlyRate: number;
  venue: MatchRoomVenue;
}

/**
 * Participant (người chơi) trong phòng
 */
export interface MatchRoomParticipant {
  participantId: string;
  isCaptain : boolean; 
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  teamAssignment: TeamAssignment;
  position: string;
  depositPaid: boolean;
  joinDate: string;
}

/**
 * Participants grouped by team
 */
export interface MatchRoomParticipants {
  teamA: MatchRoomParticipant[];
  teamB: MatchRoomParticipant[];
  unassigned: MatchRoomParticipant[];
}

/**
 * Match Room summary (for list view)
 */
export interface MatchRoom {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  hostAvatar: string | null;
  fieldId: string;
  fieldName: string;
  venueName: string;
  venueAddress: string;
  matchDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  venuePhotos : string[] | [];
  matchFormat: MatchFormat;
  totalSlots: number;
  filledSlots: number;
  depositPerPerson: number;
  totalDepositCollected: number;
  status: MatchRoomStatus;
  createdAt: string;
}

/**
 * Match Room Full Info (for detail view)
 * Response từ GET /match-rooms/{id}
 */
export interface MatchRoomFullInfo {
  roomId: string;
  hostId: string;
  host: MatchRoomHost;
  fieldId: string;
  field: MatchRoomField;
  roomName: string | null;
  matchDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  matchFormat: MatchFormat;
  description: string;
  rules: string;
  totalSlots: number;
  filledSlots: number;
  depositPerPerson: number;
  totalDepositCollected: number;
  status: MatchRoomStatus;
  participants: MatchRoomParticipants;
  createdAt: string;
}

export interface MyRoom {
  roomId: string;
  hostId: string;
  host: {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
  };
  fieldId: string;
  field: {
    fieldId: string;
    fieldName: string;
    fieldType: MatchFormat;
    hourlyRate: number;
    venue: {
      venueId: string;
      venueName: string;
      address: string;
      contactPhone: string | null;
    };
  };
  roomName: string | null;
  matchDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  matchFormat: MatchFormat;
  description: string;
  rules: string;
  totalSlots: number;
  filledSlots: number;
  depositPerPerson: number;
  totalDepositCollected: number;
  status: MatchRoomStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
}

export type MatchRoomsResponse = ApiResponse<{
  rooms: MatchRoom[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export type MyRoomsResponse = ApiResponse<{
  rooms: MyRoom[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;


export interface MatchRoomFilters {
  page?: number;
  pageSize?: number;
  availableOnly?: boolean;
  matchFormat?: string;
}

// ==================== Query/Filter Types ====================
export interface RoomFilters {
  status?: RoomStatus;
  format?: string;
  venueId?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  _sort?: string;
  _order?: "asc" | "desc";
  _page?: number;
  _limit?: number;
}

// ==================== Create/Update Types ====================
export interface CreateRoomRequest {
  // format: string;
  // name: string;
  // datetime: string;
  // venueId: string;
  // fieldId?: string;
  // durationMinutes?: number;
  // hostId: string;
  // totalPlayers?: number;
  // pricePerPlayer?: number;
  // description?: string;
  // isPrivate?: boolean;
  // password?: string;

  fieldId: string;  
  matchDate: string;
  startTime: string;
  durationMinutes: number;
  roomName: string;
  matchFormat: string;
  description: string;
  rules: string;
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  status?: RoomStatus;
  currentPlayers?: number;
}

export interface JoinRoomRequest {
  roomId: string;
}

// ==================== Message Types ====================
// export interface Message {
//   id: string;
//   roomId: string;
//   userId: string;
//   user?: User;
//   message: string;
//   createdAt: string;
// }

export interface SendMessageRequest {
  roomId: string;
  userId: string;
  message: string;
}
