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
  MatchFormat,
  RoomPresetItem,
  MatchRoomCreatePresetDto,
  UpdateMatchPresetDto,
  CreateMatchPresetDto,
} from '../types/room.types';
import { API_CONFIG } from '@/shared/constants/api';
import { Message } from '@/shared/components';
import { DepositResponse } from '@/features/wallet/types/wallet.types';

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
    const data = await apiClient.get(API_CONFIG.ENDPOINTS.ROOMS.LIST, { params });
    return data as unknown as MatchRoomsResponse;
  },
  
  getMatchRoomRecommend: async (): Promise<MatchRoomsResponse> => {
    const data = await apiClient.get(API_CONFIG.ENDPOINTS.ROOMS.RECOMMEND);
    return data as unknown as MatchRoomsResponse;
  },

  getMyRooms: async (
    filters?: Pick<MatchRoomFilters, "availableOnly" | "page" | "pageSize">,
  ): Promise<MyRoomsResponse> => {
    const params = {
      ...(filters?.availableOnly !== undefined
        ? { availableOnly: filters.availableOnly }
        : {}),
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
    };
    const data = await apiClient.get(API_CONFIG.ENDPOINTS.ROOMS.MINE, { params });
    return data as unknown as MyRoomsResponse;
  },

  getHistoryRooms: async (userId: string): Promise<MyRoomsResponse> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.PLAYER_HISTORY.replace(':userId', userId);
    const data = await apiClient.get(url);
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
      const response = await apiClient.post<ApiResponse<MatchRoom>>(
        API_CONFIG.ENDPOINTS.ROOMS.CREATE,
        room,
      );
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
    const url = API_CONFIG.ENDPOINTS.ROOMS.LEGACY_ROOM.replace(':id', id);
    const data = await apiClient.patch(url, updates);
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
    const url = API_CONFIG.ENDPOINTS.ROOMS.ROOM_INFO.replace(':id', roomId);
    await apiClient.patch(url, body);
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
    const url = API_CONFIG.ENDPOINTS.ROOMS.LEGACY_ROOM.replace(':id', id);
    await apiClient.delete(url);
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
    const data = await apiClient.get(API_CONFIG.ENDPOINTS.ROOMS.CHAT_MESSAGES, {
      params: { roomId },
    });
    return data as unknown as Message[];
  },

  /**
   * Send a message to a room
   */
  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.ROOMS.CHAT_MESSAGES, {
      ...request,
      createdAt: new Date().toISOString(),
    });
    return data as unknown as Message;
  },

  /**
   * Kick a player from a room (host only)
   */
  kickPlayer: async (roomId: string, playerId: string): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.KICK_PARTICIPANT.replace(':id', roomId).replace(
      ':playerId',
      playerId,
    );
    await apiClient.delete(url);
  },

  /**
   * Cancel a match room (host only)
   * GET /match-rooms/:id/cancel — optional query: ?reason=
   * Axios maps `params` to the URL query string and encodes values (e.g. spaces → %20).
   */
  cancelRoom: async (roomId: string, reason?: string): Promise<void> => {
    const trimmed = reason?.trim();
    const url = API_CONFIG.ENDPOINTS.ROOMS.CANCEL.replace(':id', roomId);
    await apiClient.delete(url, {
      params: trimmed ? { reason: trimmed } : {},
    });
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

  directPayment: async (roomId: string): Promise<DepositResponse> => {
    const data = await apiClient.post(
      API_CONFIG.ENDPOINTS.ROOMS.DIRECT_PAYMENT.replace(':roomId', roomId),
    );
    const body = data as unknown as ApiResponse<DepositResponse>;
    if (body?.isSuccess) return body.data as DepositResponse;
    return data as unknown as DepositResponse;
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
    const url = API_CONFIG.ENDPOINTS.ROOMS.UPDATE_PARTICIPANT.replace(':id', roomId);
    const data = await apiClient.post(url, {
      teamAssignment,
      position,
    });
    return data;
  },

  /**
   * Leave a match room via REST API
   * SignalR will broadcast UserLeftRoom event to all players in the room
   */
  leaveMatchRoom: async (roomId: string): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.LEAVE.replace(':id', roomId);
    await apiClient.post(url);
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
    const url = API_CONFIG.ENDPOINTS.ROOMS.UPDATE_PARTICIPANT.replace(':id', roomId);
    const data = await apiClient.put(url, {
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
  getMatchPresetList: async (filter? : Pick<MatchRoomFilters, 'page' | 'pageSize'>) => {
    const params = {
      page: filter?.page || 1,
      pageSize: filter?.pageSize || 10,
    };
    const data = await apiClient.get(API_CONFIG.ENDPOINTS.ROOMS.MY_PRESET_LIST, { params });
    
    return data as unknown as ApiResponse<{
      items: RoomPresetItem[];
      page: number;
      pageSize: number;
      totalPages: number;
      totalCount: number;
    }>;
  },

  /**
   * GET /match-presets/:id — lấy chi tiết một preset theo ID
   */
  getMatchPresetById: async (id: string): Promise<RoomPresetItem> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.PRESET_DETAIL.replace(':id', id);
    const data = await apiClient.get(url);
    const body = data as unknown as ApiResponse<RoomPresetItem>;
    if (body?.isSuccess) return body.data as RoomPresetItem;
    return data as unknown as RoomPresetItem;
  },

  /**
   * PUT /match-presets/:id — cập nhật preset theo ID
   */
  updateMatchPreset: async (id: string, dto: UpdateMatchPresetDto): Promise<RoomPresetItem> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.PRESET_DETAIL.replace(':id', id);
    const data = await apiClient.put(url, dto);
    const body = data as unknown as ApiResponse<RoomPresetItem>;
    if (body?.isSuccess) return body.data as RoomPresetItem;
    return data as unknown as RoomPresetItem;
  },

  /**
   * POST /match-presets — tạo preset mới
   */
  createMatchPreset: async (dto: CreateMatchPresetDto): Promise<RoomPresetItem> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.ROOMS.PRESET_CREATE, dto);
    const body = data as unknown as ApiResponse<RoomPresetItem>;
    if (body?.isSuccess) return body.data as RoomPresetItem;
    return data as unknown as RoomPresetItem;
  },

  /**
   * DELETE /match-presets/:id — xoá preset theo ID
   */
  deleteMatchPreset: async (id: string): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.PRESET_DETAIL.replace(':id', id);
    await apiClient.delete(url);
  },

  /**
   * POST /match-rooms/:id/transfer-host — chuyển quyền host sang người chơi khác.
   */
  transferHost: async (roomId: string, targetUserId: string): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.TRANSFER_HOST.replace(':id', roomId);
    await apiClient.post(url, { targetUserId });
  },

  responseTransferHost: async (roomId: string, isAccepted: boolean): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.RESPONSE_TRANSFER_HOST.replace(':id', roomId);
    await apiClient.post(url, {isAccepted });
  },

  /**
   * Mời một người bạn vào phòng
   * POST /match-rooms/:id/invite-friend
   */
  inviteFriend: async (roomId: string, friendUserId: string): Promise<void> => {
    const url = API_CONFIG.ENDPOINTS.ROOMS.INVITE_FRIEND.replace(':id', roomId);
    await apiClient.post(url, { friendUserId });
  },

  /**
   * Legacy: lấy mẫu tạo phòng đơn của user hiện tại (GET). 404 → null.
   */
  getCreateRoomPreset: async (): Promise<MatchRoomCreatePresetDto | null> => {
    try {
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.ROOMS.MY_PRESET_LIST);
      return data as unknown as MatchRoomCreatePresetDto;
    } catch {
      return null;
    }
  },

  /**
   * Legacy: upsert mẫu tạo phòng đơn (POST /match-presets)
   */
  upsertCreateRoomPreset: async (dto: MatchRoomCreatePresetDto): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.ROOMS.PRESET_CREATE, dto);
  },

};



