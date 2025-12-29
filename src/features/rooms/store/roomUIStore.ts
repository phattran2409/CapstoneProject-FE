import { create } from 'zustand';
import type { RoomFilters } from '../types/room.types';

/**
 * Room UI State Store
 * ONLY for UI-related state (filters, modals, selections, etc.)
 * Server state is managed by React Query
 */
interface RoomUIState {
  // ============ State ============
  
  // Filters
  selectedFilters: RoomFilters;
  
  // Modals
  showFilterModal: boolean;
  showCreateRoomModal: boolean;
  
  // Selections
  selectedRoomId: string | null;
  selectedTeamId: string | null;
  
  // Sort/View options
  sortBy: 'date' | 'price' | 'popularity';
  viewMode: 'list' | 'grid';
  
  // ============ Actions ============
  
  // Filters
  setFilters: (filters: RoomFilters) => void;
  resetFilters: () => void;
  
  // Modals
  toggleFilterModal: () => void;
  toggleCreateRoomModal: () => void;
  
  // Selections
  selectRoom: (id: string | null) => void;
  selectTeam: (id: string | null) => void;
  
  // Sort/View
  setSortBy: (sort: 'date' | 'price' | 'popularity') => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  selectedFilters: {},
  showFilterModal: false,
  showCreateRoomModal: false,
  selectedRoomId: null,
  selectedTeamId: null,
  sortBy: 'date' as const,
  viewMode: 'list' as const,
};

export const useRoomUIStore = create<RoomUIState>((set) => ({
  ...initialState,

  // Filters
  setFilters: (filters) => set({ selectedFilters: filters }),
  resetFilters: () => set({ selectedFilters: {} }),

  // Modals
  toggleFilterModal: () => set((state) => ({ 
    showFilterModal: !state.showFilterModal 
  })),
  toggleCreateRoomModal: () => set((state) => ({ 
    showCreateRoomModal: !state.showCreateRoomModal 
  })),

  // Selections
  selectRoom: (id) => set({ selectedRoomId: id }),
  selectTeam: (id) => set({ selectedTeamId: id }),

  // Sort/View
  setSortBy: (sort) => set({ sortBy: sort }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // Reset
  reset: () => set(initialState),
}));

