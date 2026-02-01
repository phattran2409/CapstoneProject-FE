export interface Venue {
  venueId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  amenities: string[];
  contactPhone: string;
  contactEmail: string;
  amentities: string | null;
  fields: Field[];
  primaryPhotoUrl?: string;
  createdAt: string;
}

/**
 * VenueDetail - Chi tiết venue từ API GET /api/venues/:id
 */
export interface VenueDetail {
  venueId: string;
  venueName: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPhone: string | null;
  contactEmail: string | null;
  description: string | null;
  amenities: string[] | null;
  fields: VenueFieldDetail[];
  operatingHours: OperatingHour[];
  photos: VenuePhoto[];
  walletBalance: number;
  createdAt: string;
}

/**
 * Field detail trong VenueDetail response
 */
export interface VenueFieldDetail {
  fieldId: string;
  fieldName: string;
  fieldType: 'FiveVsFive' | 'SevenVsSeven' | 'ElevenVsEleven' | string;
  surfaceType: string | null;
  hourlyRate: number;
  peakHourSurcharge: number;
}

/**
 * Photo của venue
 */
export interface VenuePhoto {
  photoId: string;
  photoUrl: string;
  isPrimary: boolean;
}

/**
 * Operating hours - giờ hoạt động của venue
 */
export interface OperatingHour {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string;  // "HH:mm:ss" format
  closeTime: string; // "HH:mm:ss" format
}

/**
 * API Response wrapper for VenueDetail
 */
export interface VenueDetailResponse {
  isSuccess: boolean;
  data: VenueDetail;
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
