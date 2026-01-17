import { apiClient } from '@/shared/api/client';
import type {
  Room,
  RoomFullInfo,
  RoomFilters,
  CreateRoomRequest,
  UpdateRoomRequest,
  JoinRoomRequest,
  Message,
  SendMessageRequest,
} from '../types/room.types';

/**
 * Rooms API functions
 * Pure API calls without any React Query logic
 */
export const roomsApi = {
  /**
   * Get list of rooms with optional filters
   */
  getRooms: async (filters?: RoomFilters): Promise<Room[]> => {
    const data = await apiClient.get('/rooms', { params: filters });
    return data;
  },

  /**
   * Get room detail by ID
   */
  getRoomById: async (id: string): Promise<Room> => {
    const data = await apiClient.get(`/rooms/${id}`);
    return data;
  },

  /**
   * Get full room information including venue, teams, and players
   */
  getRoomFullInfo: async (id: string): Promise<RoomFullInfo> => {
    const data = await apiClient.get(`/rooms/${id}/full-info`);
    console.log('Room Full Info:', data);
    
    // If backend returns undefined/null, throw error so React Query handles it properly
    if (!data) {
      throw new Error('Room not found');
    }
    
    return data;
  },

  /**
   * Create a new room
   */
  createRoom: async (room: CreateRoomRequest): Promise<Room> => {
    const data = await apiClient.post('/rooms', {
      ...room,
      currentPlayers: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    return data;
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
  joinRoom: async (request: JoinRoomRequest): Promise<any> => {
    const data = await apiClient.post('/teams', request);
    return data;
  },

  /**
   * Get messages for a room
   */
  getRoomMessages: async (roomId: string): Promise<Message[]> => {
    const data = await apiClient.get('/messages', {
      params: { roomId },
    });
    return data;
  },

  /**
   * Send a message to a room
   */
  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const data = await apiClient.post('/messages', {
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
    await apiClient.patch(`/rooms/${roomId}`, { status: 'cancelled' });
  },
};

