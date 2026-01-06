export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string; username: string; password: string };
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
  } | undefined;
  VenueSelection: undefined;
  RoomInformation: { roomId: string };
  RoomDetail: { roomId: string };
  PersonalPage: undefined;
  ProfileDetail: undefined;
  ChatList: undefined;
  Chat: { chatId: string; chatName: string };
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Create: undefined;
  Profile: undefined;
};

