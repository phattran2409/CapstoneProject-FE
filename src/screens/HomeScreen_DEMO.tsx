import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedCard 
} from '../components/themed';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Matches: undefined;
  Leaderboard: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface ELOPlayer {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: any;
  elo: number;
  matchesPlayed: number;
  winRate: number;
  trend: 'up' | 'down' | 'stable';
  eloChange: number;
}

const HomeScreenDemo: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Mock ELO Leaderboard data
  const topPlayers: ELOPlayer[] = [
    {
      id: '1',
      rank: 1,
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: require('../../assets/icon.png'),
      elo: 2450,
      matchesPlayed: 128,
      winRate: 78.5,
      trend: 'up',
      eloChange: 45,
    },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return theme.colors.neonGreen;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'stable':
        return 'remove';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#22c55e';
      case 'down':
        return '#ef4444';
      case 'stable':
        return '#6b7280';
    }
  };

  return (  
    <ThemedSafeAreaView>
      {/* Header - Now Theme Responsive! */}
      <ThemedView 
        className="flex-row justify-between items-center px-5 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="football" size={28} color={theme.colors.neonGreen} />
          <ThemedText size="xxl" weight="bold">
            Feeds
          </ThemedText>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="search" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        {/* ELO Leaderboard Section - Theme Responsive */}
        <ThemedView 
          className="py-5"
          style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
        >
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="trophy" size={24} color={theme.colors.neonGreen} />
              <ThemedText size="xl" weight="bold">
                ELO Leaderboard
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <ThemedText variant="accent" size="s" weight="semiBold">
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Player Card Example - Theme Responsive */}
          <View className="px-5">
            {topPlayers.map((player) => (
              <ThemedCard 
                key={player.id}
                variant="outlined"
                style={{ width: 180 }}
              >
                {/* Rank Badge */}
                <View 
                  className="absolute top-3 right-3 w-8 h-8 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: getRankColor(player.rank) + '20',
                    borderWidth: 2,
                    borderColor: getRankColor(player.rank),
                  }}
                >
                  <ThemedText 
                    size="xs" 
                    weight="bold"
                    style={{ color: getRankColor(player.rank) }}
                  >
                    #{player.rank}
                  </ThemedText>
                </View>

                {/* Avatar */}
                <Image
                  source={player.avatar}
                  className="w-16 h-16 rounded-full self-center mb-3 mt-2"
                  resizeMode="cover"
                />

                {/* Player Name */}
                <ThemedText size="m" weight="bold" className="text-center mb-1">
                  {player.name}
                </ThemedText>
                <ThemedText variant="secondary" size="xs" className="text-center mb-3">
                  @{player.username}
                </ThemedText>

                {/* ELO Score */}
                <ThemedView 
                  style={{ 
                    backgroundColor: theme.colors.background,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8 
                  }}
                >
                  <ThemedText variant="secondary" size="xs" className="text-center mb-1">
                    ELO Rating
                  </ThemedText>
                  <ThemedText 
                    variant="accent"
                    size="xxl" 
                    weight="bold" 
                    className="text-center"
                  >
                    {player.elo}
                  </ThemedText>
                  
                  {/* Trend Indicator */}
                  <View className="flex-row items-center justify-center mt-1">
                    <Ionicons 
                      name={getTrendIcon(player.trend)} 
                      size={14} 
                      color={getTrendColor(player.trend)} 
                    />
                    <ThemedText 
                      size="xs" 
                      weight="semiBold"
                      className="ml-1"
                      style={{ color: getTrendColor(player.trend) }}
                    >
                      {player.eloChange > 0 ? '+' : ''}{player.eloChange}
                    </ThemedText>
                  </View>
                </ThemedView>

                {/* Stats */}
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <ThemedText variant="secondary" size="xs" className="text-center">
                      Matches
                    </ThemedText>
                    <ThemedText size="s" weight="semiBold" className="text-center">
                      {player.matchesPlayed}
                    </ThemedText>
                  </View>
                  <View style={{ width: 1, backgroundColor: theme.colors.border }} />
                  <View className="flex-1">
                    <ThemedText variant="secondary" size="xs" className="text-center">
                      Win Rate
                    </ThemedText>
                    <ThemedText size="s" weight="semiBold" className="text-center">
                      {player.winRate}%
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            ))}
          </View>
        </ThemedView>

        {/* Message */}
        <ThemedView className="p-5">
          <ThemedCard variant="elevated">
            <ThemedText size="l" weight="bold" className="mb-2">
              🎨 Theme Demo
            </ThemedText>
            <ThemedText variant="secondary">
              Toggle dark/light mode in Profile screen to see this screen automatically adapt! 
              All colors, backgrounds, and text are now theme-aware.
            </ThemedText>
          </ThemedCard>
        </ThemedView>
      </ThemedScrollView>

      {/* Floating Create Button */}
      <View className="absolute bottom-20 right-5">
        <TouchableOpacity
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: theme.colors.neonGreen,
            shadowColor: theme.colors.neonGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={() => {
            // Handle create new post
          }}
        >
          <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>
      </View>
    </ThemedSafeAreaView>
  );
};

export default HomeScreenDemo;

