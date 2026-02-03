import { apiClient } from '@/shared/api/client';
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
  MyRoomsResponse,
} from '../types/room.types';
import { API_CONFIG } from '@/shared/constants/api';

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
      ...(filters?.status && { status: filters.status }),
      ...(filters?.matchFormat && { matchFormat: filters.matchFormat }),
    };
    const data = await apiClient.get("/match-rooms", { params });
    return data;
  },

  getMyRooms: async (): Promise<MyRoomsResponse> => {
    const data = await apiClient.get("/match-rooms/mine");
    return data;
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
   */
  createRoom: async (room: CreateRoomRequest): Promise<Room> => {
    try {
      const response = await apiClient.post("/match-rooms", room);
      return response.data;
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  },

  /**
   * Update room
   */
  updateRoom: async (id: string, updates: UpdateRoomRequest): Promise<Room> => {
    const data = await apiClient.patch(`/rooms/${id}`, updates);
    return data;
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
    const data = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.ROOMS.JOIN.replace(":id", request.roomId)}`,
    );
    return data;
  },

  /**
   * Get messages for a room
   */
  getRoomMessages: async (roomId: string): Promise<Message[]> => {
    const data = await apiClient.get("/messages", {
      params: { roomId },
    });
    return data;
  },

  /**
   * Send a message to a room
   */
  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const data = await apiClient.post("/messages", {
      ...request,
      createdAt: new Date().toISOString(),
    });
    return data;
  },

  /**
   * Kick a player from a room (host only)
   */
  kickPlayer: async (roomId: string, playerId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}/players/${playerId}`);
  },

  /**
   * Cancel/Delete a room (host only)
   */
  cancelRoom: async (roomId: string): Promise<void> => {
    await apiClient.patch(`/rooms/${roomId}`, { status: "cancelled" });
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
   * Get match room detail by ID
   * Used to refresh room state after SignalR events
   * Returns MatchRoomFullInfo with participants structure
   */
  // getMatchRoomDetail: async (roomId: string): Promise<MatchRoomFullInfo> => {
  //   const data = await apiClient.get(`/match-rooms/${roomId}`);
  //   return data as unknown as MatchRoomFullInfo;
  // },
};

