import { create } from 'zustand';
import { storage } from '@/shared/utils/storage';

const ACTIVE_ROOM_STORAGE_KEY = 'active_room_id';

interface ActiveRoomState {
  roomId: string | null;
  setActiveRoom: (roomId: string | null) => Promise<void>;
  clearActiveRoom: () => Promise<void>;
  loadActiveRoom: () => Promise<void>;
}

export const useActiveRoomStore = create<ActiveRoomState>((set) => ({
  roomId: null,

  setActiveRoom: async (roomId: string | null) => {
    set({ roomId });
    if (roomId) {
      await storage.setItem(ACTIVE_ROOM_STORAGE_KEY, roomId);
    } else {
      await storage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
    }
  },

  clearActiveRoom: async () => {
    set({ roomId: null });
    await storage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  },

  loadActiveRoom: async () => {
    const savedRoomId = await storage.getItem(ACTIVE_ROOM_STORAGE_KEY);
    if (savedRoomId) {
      set({ roomId: savedRoomId });
    }
  },
}));

