import { Venue, Field, TimeSlot } from '@/features/venues/types/venue.types';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string; userId: string };
  MainTabs: undefined;
  Leaderboard: undefined;
  CreateRoom: {
    selectedVenue?: Venue;
    selectedField?: Field;
    selectedTimeSlot?: TimeSlot;
  } | undefined;
  VenueSelection: undefined;
  RoomInformation: { roomId: string };
  RoomDetail: { roomId: string };
  PersonalPage: { userId?: string };
  ProfileDetail: undefined;
  ChatList: undefined;
  Friends: undefined;
  FriendRequests: undefined;
  Chat: { chatId: string; chatName: string };
  Profile: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  PaymentSuccess: undefined;
  Wallet: undefined;
  WalletTopUp: undefined;
  ChangePassword: {
    email: string;
  };
  Search: undefined;
  
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Friends: undefined;
  Create: undefined;
  Profile: undefined;
};
