import { apiClient } from '@/shared/api/client';
import type { ApiError } from '@/shared/api/types';
import type {
  RoomFilters,
  CreateRoomRequest,
  UpdateRoomRequest,
  JoinRoomRequest,
  SendMessageRequest,
  MatchRoomsResponse,
  MatchRoomFilters,
  MatchRoomFullInfo,
  ApiResponse,
  MatchRoom,
  MyRoomsResponse,
  UpdateFormationRequest,
  UpdateTeamNameRequest,
  MatchRoomCreatePresetDto,
  MatchFormat,
} from '../types/room.types';
import { API_CONFIG } from '@/shared/constants/api';
import { Message } from '@/shared/components';

/**
 * Rooms API functions
 * Pure API calls without any React Query logic
 */
export const roomsApi = {
  /**
   * Get paginated list of match rooms
   */
  getMatchRooms: async (
    filters?: MatchRoomFilters,
  ): Promise<MatchRoomsResponse> => {
    const params = {
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      ...(filters?.availableOnly && { availableOnly: filters.availableOnly }),
      ...(filters?.matchFormat && { matchFormat: filters.matchFormat }),
      ...(filters?.latitude && { latitude: filters.latitude }),
      ...(filters?.longitude && { longitude: filters.longitude }),
      ...(filters?.radiusKm && { radiusKm: filters.radiusKm }),
      ...(filters?.date && { date: filters.date }),
    };
    console.log(params);
    const data = await apiClient.get("/match-rooms", { params });
    return data as unknown as MatchRoomsResponse;
  },

  getMyRooms: async (): Promise<MyRoomsResponse> => {
    const data = await apiClient.get("/match-rooms/mine");
    return data as unknown as MyRoomsResponse;
  },

  /**
   * Get full room information including venue, teams, and players
   */
  getRoomFullInfo: async (id: string): Promise<MatchRoomFullInfo> => {
    const data = (await apiClient.get(
      API_CONFIG.ENDPOINTS.ROOMS.FULL_INFO.replace(":id", id),
    )) as ApiResponse<MatchRoomFullInfo>;

    // If backend returns undefined/null, throw error so React Query handles it properly
    if (!data) {
      throw new Error("Room not found");
    }
    if (data.isSuccess) {
      return data.data as MatchRoomFullInfo;
    } else {
      throw new Error("Failed to get room full info");
    }
  },

  /**
   * Create a new room
   * Note: apiClient interceptor returns response.data, so "response" here is { isSuccess, data }.
   */
  createRoom: async (room: CreateRoomRequest): Promise<MatchRoom> => {
    try {
      const response = await apiClient.post<ApiResponse<MatchRoom>>('/match-rooms', room);
      const body = response as unknown as ApiResponse<MatchRoom>;
      return body.data as MatchRoom;
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  },

  /**
   * Update room
   */
  updateRoom: async (id: string, updates: UpdateRoomRequest): Promise<MatchRoom> => {
    const data = await apiClient.patch(`/rooms/${id}`, updates);
    return data as unknown as MatchRoom;
  },

  /**
   * Update room info (roomName, description, rules)
   * PATCH /match-rooms/:id/info
   */
  updateRoomInfo: async (
    roomId: string,
    body: { roomName: string; description?: string; rules?: string },
  ): Promise<void> => {
    await apiClient.patch(`/match-rooms/${roomId}/info`, body);
  },

  /**
   * Update room privacy (visibility + password for Private)
   * PATCH /match-rooms/:id/privacy
   */
  updateRoomPrivacy: async (
    roomId: string,
    body: { visibility: string; password: string },
  ): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.PRIVACY.replace(':id', roomId);
    await apiClient.patch(url, body);
  },

  /**
   * Delete room
   */
  deleteRoom: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`);
  },

  /**
   * Join a room (create booking)
   */
  joinMatchRoom: async (request: JoinRoomRequest): Promise<any> => {
    try { 
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.ROOMS.JOIN.replace(":id", request.roomId), request);
      const body = response as unknown as ApiResponse<any>;
      return body.data;
    }catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  },

  /**
   * Get messages for a room
   */
  getRoomMessages: async (roomId: string): Promise<Message[]> => {
    const data = await apiClient.get("/messages", {
      params: { roomId },
    });
    return data as unknown as Message[];
  },

  /**
   * Send a message to a room
   */
  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const data = await apiClient.post("/messages", {
      ...request,
      createdAt: new Date().toISOString(),
    });
    return data as unknown as Message;
  },

  /**
   * Kick a player from a room (host only)
   */
  kickPlayer: async (roomId: string, playerId: string): Promise<void> => {
    await apiClient.delete(`/match-rooms/${roomId}/participants/${playerId}`);
  },

  /**
   * Cancel/Delete a room (host only)
   */
  cancelRoom: async (roomId: string): Promise<void> => {
    await apiClient.patch(`/rooms/${roomId}`, { status: "cancelled" });
  },

  /**
   * Process payment for a booking
   * Endpoint: https://api.kickify.site/api/bookings/process-payment
   * Payload: { roomId: string }
   */
  processPayment: async (roomId: string): Promise<any> => {
    const data = await apiClient.post(
      API_CONFIG.ENDPOINTS.ROOMS.PROCESS_PAYMENT,
      {
        roomId,
      },
    );
    return data;
  },

  // ==================== Match Room SignalR API ====================

  /**
   * Join a match room via REST API
   * Endpoint: POST /match-rooms/{roomId}/participants/me
   * Payload: { teamAssignment: 'A' | 'B', position: 'GK' | 'DF' | 'MF' | 'FW' }
   * SignalR will broadcast UserJoinedRoom event to all players in the room
   */
  joinMatchRoomParticipant: async (
    roomId: string,
    teamAssignment: "A" | "B",
    position: string,
  ): Promise<any> => {
    const data = await apiClient.post(
      `/match-rooms/${roomId}/participants/me`,
      {
        teamAssignment,
        position,
      },
    );
    return data;
  },

  /**
   * Leave a match room via REST API
   * SignalR will broadcast UserLeftRoom event to all players in the room
   */
  leaveMatchRoom: async (roomId: string): Promise<void> => {
    await apiClient.post(`/match-rooms/${roomId}/leave`);
  },

  /**
   * Update participant's team assignment and position
   * Endpoint: PUT /match-rooms/{roomId}/participants/me
   * SignalR will broadcast ParticipantUpdated event to all players in the room
   */
  updateParticipant: async (
    roomId: string,
    teamAssignment: "A" | "B" | "Unassigned",
    position?: string,
  ): Promise<any> => {
    const data = await apiClient.put(`/match-rooms/${roomId}/participants/me`, {
      teamAssignment,
      ...(position && { position }),
    });
    return data;
  },

  /**
   * Cập nhật đội hình (vị trí từng thành viên) – chỉ captain
   * Endpoint: PUT /match-rooms/{roomId}/formation
   * Payload: UpdateFormationRequest { team, formationName, format, assignments }
   */
  updateFormation: async (
    roomId: string,
    payload: UpdateFormationRequest,
  ): Promise<any> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.FORMATION.replace(":id", roomId);
    const data = await apiClient.put(url, payload);
    return data;
  },

  /**
   * Cập nhật tên đội – chỉ captain
   * PATCH /match-rooms/{roomId}/team-name
   * Payload: { team: "A" | "B", name: string }
   */
  updateTeamName: async (
    roomId: string,
    payload: UpdateTeamNameRequest,
  ): Promise<any> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.TEAM_NAME.replace(":id", roomId);
    const data = await apiClient.patch(url, payload);
    return data;
  },

  //Vote Result
  voteResult: async (
    roomId: string,
    vote: string,
  ): Promise<any> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.VOTE_RESULT.replace(":id", roomId);
    const data = await apiClient.post(url, { vote });
    return data;
  },

  /**
   * Get match room detail by ID
   * Used to refresh room state after SignalR events
   * Returns MatchRoomFullInfo with participants structure
   */
  // getMatchRoomDetail: async (roomId: string): Promise<MatchRoomFullInfo> => {
  //   const data = await apiClient.get(`/match-rooms/${roomId}`);
  //   return data as unknown as MatchRoomFullInfo;
  // },

  /**
   * Lấy mẫu tạo phòng đã lưu (user hiện tại). 404 → null.
   */
  getCreateRoomPreset: async (): Promise<MatchRoomCreatePresetDto | null> => {
    try {
      const url = API_CONFIG.ENDPOINTS.ROOMS.ME_CREATE_PRESET;
      const response = (await apiClient.get(url)) as unknown;
      const parsed = parseCreateRoomPresetResponse(response);
      return parsed;
    } catch (e: unknown) {
      const err = e as ApiError;
      if (err?.status === 404) return null;
      throw e;
    }
  },

  /**
   * Lưu / cập nhật mẫu tạo phòng (PUT).
   */
  upsertCreateRoomPreset: async (
    dto: MatchRoomCreatePresetDto,
  ): Promise<MatchRoomCreatePresetDto> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.ME_CREATE_PRESET;
    const body = createRoomPresetToWire(dto);
    const response = (await apiClient.put(url, body)) as unknown;
    const parsed = parseCreateRoomPresetResponse(response);
    return parsed ?? dto;
  },
};

const MATCH_FORMATS: MatchFormat[] = ['FiveVsFive', 'SevenVsSeven', 'ElevenVsEleven'];

function createRoomPresetToWire(dto: MatchRoomCreatePresetDto) {
  return {
    matchFormat: dto.matchFormat,
    durationMinutes: dto.durationMinutes,
    roomName: dto.roomName,
    description: dto.description ?? '',
    visibility: dto.isPrivate ? 'Private' : 'Public',
  };
}

function parseCreateRoomPresetResponse(
  response: unknown,
): MatchRoomCreatePresetDto | null {
  let raw: Record<string, unknown> | null = null;
  if (response && typeof response === 'object' && 'isSuccess' in response) {
    const wrap = response as ApiResponse<Record<string, unknown>>;
    if (wrap.isSuccess && wrap.data && typeof wrap.data === 'object') {
      raw = wrap.data as Record<string, unknown>;
    }
  } else if (response && typeof response === 'object' && 'matchFormat' in response) {
    raw = response as Record<string, unknown>;
  }
  if (!raw) return null;

  const matchFormat = raw.matchFormat as MatchFormat;
  if (!MATCH_FORMATS.includes(matchFormat)) return null;

  const dm = Number(raw.durationMinutes);
  if (![60, 90, 120].includes(dm)) return null;

  return {
    matchFormat,
    durationMinutes: dm as 60 | 90 | 120,
    roomName: String(raw.roomName ?? ''),
    description: String(raw.description ?? ''),
    isPrivate:
      raw.visibility === 'Private' ||
      raw.isPrivate === true ||
      String(raw.visibility).toLowerCase() === 'private',
  };
}

