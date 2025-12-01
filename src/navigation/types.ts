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
};

export type TabParamList = {
  Home: undefined;
  Matches: undefined;
  Create: undefined;
  Profile: undefined;
};

