// ==================== User Types ====================
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  position?: string;
  rating: number;
  totalMatches: number;
  createdAt: string;
}

// ==================== Venue Types ====================
export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  rating: number;
  totalReviews: number;
}

// ==================== Room/Match Types ====================
export interface Room {
  id: string;
  format: string;
  datetime: string;
  venueId: string;
  venue?: Venue;
  totalPlayers: number;
  currentPlayers: number;
  status: RoomStatus;
  hostId: string;
  host?: User;
  pricePerPlayer: number;
  description: string;
  createdAt: string;
}

export type RoomStatus = 'open' | 'full' | 'closed' | 'completed' | 'cancelled';

export interface Player {
  userId: string;
  position: string;
  isConfirmed: boolean;
  joinedAt: string;
  user?: User;
}

export interface Team {
  id: string; 
  roomId: string;
  name: string;
  color: string;
  players: Player[];
}

export interface RoomFullInfo extends Room {
  venue: Venue;
  teams: Team[];
  host: User;
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
  _order?: 'asc' | 'desc';
  _page?: number;
  _limit?: number;
}

// ==================== Create/Update Types ====================
export interface CreateRoomRequest {
  format: string;
  name: string;
  datetime: string;
  venueId: string;
  totalPlayers?: number;
  pricePerPlayer?: number;
  description?: string;
  isPrivate?: boolean;
  password?: string;
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  status?: RoomStatus;
  currentPlayers?: number;
}

export interface JoinRoomRequest {
  userId: string;
  roomId: string;
  teamId: string;
}

// ==================== Message Types ====================
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  user?: User;
  message: string;
  createdAt: string;
}

export interface SendMessageRequest {
  roomId: string;
  userId: string;
  message: string;
}

