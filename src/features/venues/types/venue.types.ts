
export interface Venue {
  ownerId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  rating: number;
  totalReviews: number;
}
// export interface VenueFilters {
//   city?: string;
//   district?: string;
//   format?: '5vs5' | '7vs7' | '11vs11';
//   minPrice?: number;
//   maxPrice?: number;
//   minRating?: number;
// }



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

