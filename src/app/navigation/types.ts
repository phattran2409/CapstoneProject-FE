import { User } from "@/features/profile/types/profile.types";
import { Venue, Field, TimeSlot } from "@/features/venues/types/venue.types";

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
    selectedDate?: string; // YYYY-MM-DD from FieldsModal
  } | undefined;
  VenueSelection: undefined;
  VenueDetail: { venueId: string };
  RoomInformation: { roomId: string };
  Team: { roomId: string; team: "A" | "B" };
  PersonalPage: { userId?: string };
  ProfileDetail: { player: User };
  ChatList: undefined;
  Friends: undefined;
  FriendRequests: undefined;
  Chat: { chatId: string; chatName: string };
  RoomChat: { roomId: string };
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
  FeedbackIntro: undefined;
  FeedbackRating: { roomId: string };
  FeedbackComplete: undefined;
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Friends: undefined;
  Create: undefined;
  Profile: undefined;
};
