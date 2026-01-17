import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

/**
 * Deep linking configuration
 * Maps URL patterns to navigation routes
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['kickify://', 'https://kickify.app', 'https://*.kickify.app'],
  config: {
    screens: {
      // Main screens
      // MainTabs: {
      //   screens: {
      //     Home: 'home',
      //     Matches: 'matches',
      //     Friends: 'friends',
      //     Profile: 'profile',
      //   },
      // },
      // Room deep links
      RoomInformation: {
        path: 'room/:roomId',
        parse: {
          roomId: (roomId: string) => roomId,
        },
      },
      RoomDetail: {
        path: 'room/:roomId/detail',
        parse: {
          roomId: (roomId: string) => roomId,
        },
      },
      // Other screens
      Leaderboard: 'leaderboard',
      CreateRoom: 'create-room',
      VenueSelection: 'venue-selection',
      ChatList: 'chat',
      Chat: {
        path: 'chat/:chatId',
        parse: {
          chatId: (chatId: string) => chatId,
          chatName: (chatName: string) => chatName || 'Chat',
        },
      },
      Profile: 'profile',
      PersonalPage: 'user/:userId',
      ProfileDetail: 'profile/detail',
      FriendRequests: 'friends/requests',
      Notifications: 'notifications',
      PostDetail: {
        path: 'post/:postId',
        parse: {
          postId: (postId: string) => postId,
        },
      },
      // Auth screens (usually not deep linked, but included for completeness)
      Login: 'login',
      Register: 'register',
      OTPVerification: 'verify-otp',
    },
  },
};

