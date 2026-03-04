import { User } from "@/features/profile/types/profile.types";
import {
  Venue,
  Field,
  TimeSlot,
  VenuePhoto,
} from "@/features/venues/types/venue.types";

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
  VenueSelection: { matchFormat?: 'FiveVsFive' | 'SevenVsSeven' | 'ElevenVsEleven' } | undefined;
  VenueDetail: { venueId: string };
  RoomInformation: { roomId: string; venuePhotos?: VenuePhoto[] };
  Team: { roomId: string; team: "A" | "B" };
  PersonalPage: { userId?: string };
  ProfileDetail: { player: User };
  Achievements: undefined;
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
  WalletWithdraw: undefined;
  ChangePassword: {
    email: string;
  };
  Search: undefined;
  EloBreakdown:
    | {
        eloDelta?: number;
        matchLabel?: string;
        isWin?: boolean;
      }
    | undefined;
  FeedbackIntro: undefined;
  FeedbackMatchResult: { roomId: string };
  FeedbackRating: { roomId: string; matchResult: "A" | "B" | "DRAW" };
  FeedbackComplete: undefined;
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Friends: undefined;
  Create: undefined;
  Profile: undefined;
};
