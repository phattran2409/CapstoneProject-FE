import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
  ThemedCard 
} from '../components/themed';

type RootStackParamList = {
  Matches: undefined;
  RoomDetail: { roomId: string };
};

type RoomDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;

interface RoomDetailScreenProps {
  navigation?: RoomDetailScreenNavigationProp;
  route?: {
    params: {
      roomId: string;
    };
  };
}

interface Player {
  id: string;
  name: string;
  avatar: any;
  isConfirmed: boolean;
}

interface Team {
  name: string;
  players: (Player | null)[];
}

const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId } = route?.params || { roomId: '1' };

  // Mock data - replace with real data from API
  const roomData = {
    id: roomId,
    format: '5vs5',
    datetime: '18:00, 25 Tháng 12',
    venue: {
      name: 'Sân bóng ABC',
      address: '123 Đường XYZ',
    },
    totalPlayers: 10,
    currentPlayers: 8,
  };

  const [teams, setTeams] = useState<{ teamA: Team; teamB: Team }>({
    teamA: {
      name: 'Đội A',
      players: [
        { id: '1', name: 'An Nguyễn', avatar: require('../../assets/icon.png'), isConfirmed: true },
        { id: '2', name: 'Cường Phạm', avatar: require('../../assets/icon.png'), isConfirmed: true },
        { id: '3', name: 'Emeka Okafor', avatar: require('../../assets/icon.png'), isConfirmed: true },
        { id: '4', name: 'Giang Hoàng', avatar: require('../../assets/icon.png'), isConfirmed: true },
        null, // Empty slot
      ],
    },
    teamB: {
      name: 'Đội B',
      players: [
        { id: '5', name: 'Bình Lê', avatar: require('../../assets/icon.png'), isConfirmed: true },
        { id: '6', name: 'Dung Trần', avatar: require('../../assets/icon.png'), isConfirmed: true },
        { id: '7', name: 'Fiona Do', avatar: require('../../assets/icon.png'), isConfirmed: true },
        { id: '8', name: 'Hạnh Mai', avatar: require('../../assets/icon.png'), isConfirmed: true },
        null, // Empty slot
      ],
    },
  });

  const handleJoinMatch = () => {
    // Handle join match logic
    console.log('Joining match:', roomId);
  };

  const renderPlayerCard = (player: Player | null, teamColor: string) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }).start();
    };

    if (!player) {
      // Empty slot - Interactive add button
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => {
              console.log('Add player to slot');
              // Handle add player logic
            }}
          >
            <View
              className="items-center justify-center rounded-2xl"
              style={{ 
                width: 110,
                height: 140,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface + '80', // Semi-transparent
              }}
            >
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ 
                  backgroundColor: theme.colors.neonGreen + '20',
                }}
              >
                <ThemedIcon name="add" size={32} variant="accent" />
              </View>
              <ThemedText variant="secondary" size="s" weight="medium">
                {t('roomDetail.emptySlot')}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // Player card with beautiful background and effects
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            console.log('View player profile:', player.id);
            // Handle view player profile
          }}
        >
          <View
            className="items-center justify-center rounded-2xl overflow-hidden"
            style={{ 
              width: 110,
              height: 140,
              backgroundColor: theme.colors.surface,
              borderWidth: 2,
              borderColor: theme.colors.border,
              shadowColor: teamColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Gradient Background Effect */}
            <View 
              className="absolute top-0 left-0 right-0 h-16"
              style={{
                backgroundColor: teamColor + '15',
              }}
            />
            
            {/* Avatar with Glow Effect */}
            <View className="mt-3">
              <View 
                className="w-16 h-16 rounded-full overflow-hidden"
                style={{ 
                  borderWidth: 3,
                  borderColor: teamColor,
                  backgroundColor: theme.colors.background,
                  shadowColor: teamColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Image
                  source={player.avatar}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              
              {/* Confirmed Badge */}
              {player.isConfirmed && (
                <View 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: teamColor,
                    borderWidth: 2,
                    borderColor: theme.colors.surface,
                  }}
                >
                  <ThemedIcon name="checkmark" size={14} color="white" />
                </View>
              )}
            </View>

            {/* Player Name with better contrast */}
            <View 
              className="mt-2 px-2 py-1 rounded-lg"
              style={{ 
                backgroundColor: theme.colors.background + '80',
              }}
            >
              <ThemedText 
                variant="secondary" 
                size="s" 
                weight="medium"
                className="text-center"
                numberOfLines={1}
                style={{ letterSpacing: 0.3 }}
              >
                {player.name}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedSafeAreaView className='py-10'>
      {/* Header */}
      <ThemedView 
        className="flex-row items-center justify-between px-5 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <ThemedIcon name="arrow-back" size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            {t('roomDetail.title')}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Room Info Section */}
          <View className="mb-6">
            {/* Format */}
            <ThemedView 
              className="flex-row items-center px-4 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.colors.neonGreen + '20' }}
              >
                <ThemedIcon name="people" size={24} variant="accent" />
              </View>
              <View className="flex-1">
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.format')}
                </ThemedText>
                <ThemedText variant="muted" size="xl" weight="bold">
                  {roomData.format}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Datetime */}
            <ThemedView 
              className="flex-row items-center px-4 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.colors.neonGreen + '20' }}
              >
                <ThemedIcon name="time" size={24} variant="accent" />
              </View>
              <View className="flex-1">
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.datetime')}
                </ThemedText>
                <ThemedText variant="muted" size="l" weight="semiBold">
                  {roomData.datetime}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Venue */}
            <ThemedView 
              className="flex-row items-center px-4 py-4 rounded-2xl"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.colors.neonGreen + '20' }}
              >
                <ThemedIcon name="location" size={24} variant="accent" />
              </View>
              <View className="flex-1">
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.venue')}
                </ThemedText>
                <ThemedText variant="muted" size="m" weight="medium">
                  {roomData.venue.name}, {roomData.venue.address}
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          {/* Team Lineup Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText variant="primary" size="l" weight="bold">
                {t('roomDetail.teamLineup')} ({roomData.currentPlayers}/{roomData.totalPlayers})
              </ThemedText>
            </View>

            {/* Team A */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <ThemedIcon name="shield" size={20} variant="accent" />
                <ThemedText variant="accent" size="m" weight="bold">
                  {t('roomDetail.teamA')}
                </ThemedText>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {teams.teamA.players.map((player, index) => (
                  <View key={`teamA-${index}`}>
                    {renderPlayerCard(player, theme.colors.neonGreen)}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Team B */}
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <ThemedIcon name="shield" size={20} variant="accent" />
                <ThemedText variant="accent" size="m" weight="bold">
                  {t('roomDetail.teamB')}
                </ThemedText>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {teams.teamB.players.map((player, index) => (
                  <View key={`teamB-${index}`}>
                    {renderPlayerCard(player, theme.colors.neonGreen)}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </ThemedScrollView>

      {/* Join Button */}
      <View 
        className="px-5 pb-6"
        style={{ 
          borderTopWidth: 1, 
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}
      >
        <TouchableOpacity
          className="rounded-2xl py-4 mt-4"
          style={{
            backgroundColor: theme.colors.neonGreen,
            shadowColor: theme.colors.neonGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleJoinMatch}
        >
          <ThemedText 
            size="l" 
            weight="bold" 
            className="text-center" 
            style={{ color: theme.colors.background }}
          >
            {t('roomDetail.joinButton')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedSafeAreaView>
  );
};

export default RoomDetailScreen;

