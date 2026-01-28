export interface Venue {
  venueId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  images: string[];
  amenities: string[];
  fields: Field[];
  operatingHours: OperatingHour[];
  primaryPhotoUrl?: string;
  createdAt: string;
}

export interface OperatingHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

export interface Field {
  fieldId: string;
  fieldName: string;
  fieldType: string;
  pricePerHour: number;
  maxPlayers?: number;
  description?: string;
  status?: 'available' | 'booked' | 'maintenance';
}

export interface FieldAvailability {
  fieldId: string;
  fieldName: string;
  date: string;
  openTime: string;
  closeTime: string;
  timeSlots: TimeSlot[];
}

export interface FieldAvailabilityResponse {
  isSuccess: boolean;
  data: FieldAvailability[];
}

export interface TimeSlot {
  startTime: string;
  // endTime?: string;
  isAvailable: boolean;
  hourlyRate: number;
}

export interface VenueFilters {
  page? :number;
  pageSize? :number;
  // city?: string;
  // district?: string;
  // format?: '5vs5' | '7vs7' | '11vs11';
  // minPrice?: number;
  // maxPrice?: number;
  // minRating?: number;
}



export interface VenueReview {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VenueBooking {
  id: string;
  venueId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  format: '5vs5' | '7vs7' | '11vs11';
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
}

export interface PaginatedVenueResponse {
  isSuccess: boolean;
  data: {
    venues: Venue[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
