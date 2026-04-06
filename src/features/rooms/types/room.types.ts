import { VenuePhoto } from "@/features/venues";

export type RoomStatus = "open" | "full" | "closed" | "completed" | "cancelled";

// ==================== Match Room Types (from API) ====================

export type MatchRoomStatus =
  | "Open"
  | "Full"
  | "Locked"
  | "Closed"
  | "InProgress"
  | "Completed"
  | "Reviewing"
  | "Cancelled";
export type MatchFormat = "FiveVsFive" | "SevenVsSeven" | "ElevenVsEleven";
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
  /** Khi BE trả về — dùng mở Maps native */
  latitude?: number;
  longitude?: number;
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
  hasLeftFeedback?: boolean;
}

/** Alias for participant in room/team context */
export type Player = MatchRoomParticipant;

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
  venuePhotos : VenuePhoto[] | [];
  matchFormat: MatchFormat;
  totalSlots: number;
  filledSlots: number;
  depositPerPerson: number;
  totalDepositCollected: number;
  status: MatchRoomStatus;
  createdAt: string;
  /** "Public" | "Private" */
  visibility?: string;
  isPrivate?: boolean;
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
  /** Ảnh venue/sân (URL) – dùng ở tab thông tin venue */
  venuePhotos?: VenuePhoto[] | [];
  /** Đội hình đã lưu theo từng đội – null nếu chưa có captain assign */
  formations?: {
    teamA: TeamFormationSnapshot | null;
    teamB: TeamFormationSnapshot | null;
  };
  /** Tên tùy chỉnh của từng đội (captain có thể cập nhật) */
  teamNames?: {
    A?: string | null;
    B?: string | null;
  };
  createdAt: string;
  hasLeftFeedback?: boolean;
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
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  matchFormat?: string;
  date?: string;
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
  fieldId: string;
  matchDate: string;
  startTime: string;
  durationMinutes: number;
  matchFormat: string;
  roomName: string;
  description: string;
  rules: string;
  /** "Public" | "Private" */
  visibility: string;
  /** Required when visibility is Private */
  password?: string;
}

/** Preset tạo phòng (lưu trên server) — map body/response trong roomsApi nếu BE khác field */

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  status?: RoomStatus;
  currentPlayers?: number;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
}

// ==================== Formation / Lineup Types ====================

/** Một gán slot – cầu thủ nào đá vị trí nào (slotId: "GK-0", "DF-1", ...) */
export interface SlotAssignmentPayload {
  slotId: string;
  playerId: string;
  playerName?: string;
  position: string;
}

/** Đội hình đã lưu của một đội – API trả về để thành viên xem đúng vị trí được assign */
export interface TeamFormationSnapshot {
  formationName: string;
  teamName?: string;
  assignments: SlotAssignmentPayload[];
}

/** Payload gửi API cập nhật đội hình (vị trí từng thành viên) – captain gửi một lần */
export interface UpdateFormationRequest {
  /** Đội cần cập nhật: "A" | "B" */
  team: "A" | "B";
  /** Tên đội hình (vd: "3-3", "4-2") */
  formationName: string;
  /** Danh sách gán: mỗi slot (vị trí) gắn với một playerId */
  assignments: SlotAssignmentPayload[];
}

/** Payload gửi API cập nhật tên đội – captain */
export interface UpdateTeamNameRequest {
  /** Đội cần cập nhật: "A" | "B" */
  team: "A" | "B";
  /** Tên đội (string) */
  name: string;
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

/** DTO dùng để tạo mới / upsert preset đơn (legacy) */
export interface MatchRoomCreatePresetDto {
  matchFormat: MatchFormat;
  durationMinutes: number;
  roomName: string;
  description: string;
  visibility: 'Public' | 'Private';
  rules: string;
  password: string;
}

/** DTO tạo preset mới theo danh sách preset (POST /match-presets) */
export interface CreateMatchPresetDto {
  fieldId: string;
  roomName: string;
  matchFormat: string;
  visibility: 'Public' | 'Private';
  startTime: string;
  durationMinutes: number;
  rules: string;
  password: string;
  description: string;
}

/** DTO dùng để cập nhật preset theo ID (PUT /match-presets/:id) */
export type UpdateMatchPresetDto = Partial<Omit<MatchRoomCreatePresetDto, 'isPrivate'>> & {
  visibility?: 'Public' | 'Private';
  password?: string;
};

export interface RoomPresetItem {
  presetId: string;
  fieldId: string;
  fieldName: string;
  venueName: string;
  venueAddress: string;
  roomName: string;
  matchFormat: MatchFormat;
  visibility: string;
  password?: string;
  startTime: string;
  rules: string;
  durationMinutes: number;
  description: string;
  createdAt: string;
}