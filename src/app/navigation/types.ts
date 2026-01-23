export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string , userId: string };
  MainTabs: undefined;
  Leaderboard: undefined;
  CreateRoom: {
    selectedVenue?: {
      id: string;
      name: string;
      address: string;
      price: number;
      rating: number;
      image: any;
    };
    selectedField?: {
      id: string;
      name: string;
      fieldType: string;
      maxPlayers: number;
      pricePerHour: number;
      description: string;
      status?: 'available' | 'booked' | 'maintenance';
    };
  } | undefined;
  VenueSelection: undefined;
  RoomInformation: { roomId: string };
  RoomDetail: { roomId: string };
  PersonalPage: undefined;
  ProfileDetail: undefined;
  ChatList: undefined;
  Friends: undefined;
  FriendRequests: undefined;
  Chat: { chatId: string; chatName: string };
  Profile: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
  PaymentSuccess: undefined;
  Wallet: undefined;
  WalletTopUp: undefined;
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Friends: undefined;
  Create: undefined;
  Profile: undefined;
};

