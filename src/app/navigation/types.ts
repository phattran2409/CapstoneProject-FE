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
    /** Khi áp dụng mẫu từ CreateRoomPreset — đổi giá trị để CreateRoom chạy lại effect */
    presetApplyNonce?: number;
  } | undefined;
  CreateRoomPreset: {
    presetId?: string;
  };
  VenueSelection: { matchFormat?: 'FiveVsFive' | 'SevenVsSeven' | 'ElevenVsEleven' } | undefined;
  VenueDetail: { venueId: string };
  RoomInformation: {
    roomId: string;
    venuePhotos?: VenuePhoto[];
    /** Mở từ lịch sử đấu trên profile người khác — ẩn hành động cá nhân (Elo / đánh giá) */
    viewAsOthersMatchHistory?: boolean;
  };
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
  /** Giới thiệu app, tính năng mobile & tóm tắt điều khoản (Capstone register) */
  AppAboutTerms: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  PaymentSuccess: { txnRef: string; amount: string };
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
        matchId?: string;
      }
    | undefined;
  FeedbackIntro: { roomId: string };
  FeedbackMatchResult: undefined;
  FeedbackRating: undefined;
  FeedbackOpponentRating: undefined;
  FeedbackFieldRating: { venueId?: string };
  FeedbackComplete: undefined;
  /** FR-27/28: feedback nhận được + phản hồi */
  ReceivedFeedback: undefined;
  /** Feedback đã gửi + phản hồi từ người được đánh giá */
  GivenFeedback: undefined;
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Friends: undefined;
  Create: undefined;
  Profile: undefined;
};
