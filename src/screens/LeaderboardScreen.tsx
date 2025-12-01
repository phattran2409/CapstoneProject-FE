import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

type RootStackParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Profile: undefined;
  PlayerProfile: { playerId: string };
};

type LeaderboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;

interface LeaderboardScreenProps {
  navigation: LeaderboardScreenNavigationProp;
}

interface ELOPlayer {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: any;
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  trend: 'up' | 'down' | 'stable';
  eloChange: number;
  position?: string;
}

type LeaderboardTab = 'overall' | 'weekly' | 'monthly';

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<LeaderboardTab>('overall');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real data from API
  const allPlayers: ELOPlayer[] = [
    {
      id: '1',
      rank: 1,
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: require('../../assets/icon.png'),
      elo: 2450,
      matchesPlayed: 128,
      wins: 98,
      losses: 22,
      draws: 8,
      winRate: 78.5,
      trend: 'up',
      eloChange: 45,
      position: 'ST',
    },
    {
      id: '2',
      rank: 2,
      name: 'Trần Minh B',
      username: 'tranminhb',
      avatar: require('../../assets/icon.png'),
      elo: 2380,
      matchesPlayed: 115,
      wins: 82,
      losses: 25,
      draws: 8,
      winRate: 74.2,
      trend: 'up',
      eloChange: 28,
      position: 'MF',
    },
    {
      id: '3',
      rank: 3,
      name: 'Lê Hoàng C',
      username: 'lehoangc',
      avatar: require('../../assets/icon.png'),
      elo: 2310,
      matchesPlayed: 102,
      wins: 71,
      losses: 23,
      draws: 8,
      winRate: 71.8,
      trend: 'down',
      eloChange: -15,
      position: 'DF',
    },
    {
      id: '4',
      rank: 4,
      name: 'Phạm Đức D',
      username: 'phamducd',
      avatar: require('../../assets/icon.png'),
      elo: 2285,
      matchesPlayed: 95,
      wins: 64,
      losses: 24,
      draws: 7,
      winRate: 69.5,
      trend: 'stable',
      eloChange: 0,
      position: 'GK',
    },
    {
      id: '5',
      rank: 5,
      name: 'Võ Thành E',
      username: 'vothanhe',
      avatar: require('../../assets/icon.png'),
      elo: 2240,
      matchesPlayed: 88,
      wins: 58,
      losses: 23,
      draws: 7,
      winRate: 67.3,
      trend: 'up',
      eloChange: 12,
      position: 'MF',
    },
    {
      id: '6',
      rank: 6,
      name: 'Hoàng Minh F',
      username: 'hoangminhf',
      avatar: require('../../assets/icon.png'),
      elo: 2190,
      matchesPlayed: 82,
      wins: 52,
      losses: 24,
      draws: 6,
      winRate: 65.8,
      trend: 'up',
      eloChange: 18,
      position: 'ST',
    },
    {
      id: '7',
      rank: 7,
      name: 'Đặng Tuấn G',
      username: 'dangtuang',
      avatar: require('../../assets/icon.png'),
      elo: 2145,
      matchesPlayed: 76,
      wins: 48,
      losses: 22,
      draws: 6,
      winRate: 64.5,
      trend: 'down',
      eloChange: -8,
      position: 'DF',
    },
    {
      id: '8',
      rank: 8,
      name: 'Bùi Văn H',
      username: 'buivanh',
      avatar: require('../../assets/icon.png'),
      elo: 2120,
      matchesPlayed: 71,
      wins: 44,
      losses: 21,
      draws: 6,
      winRate: 63.4,
      trend: 'stable',
      eloChange: 0,
      position: 'MF',
    },
    {
      id: '9',
      rank: 9,
      name: 'Ngô Quang I',
      username: 'ngoquangi',
      avatar: require('../../assets/icon.png'),
      elo: 2085,
      matchesPlayed: 68,
      wins: 41,
      losses: 21,
      draws: 6,
      winRate: 62.1,
      trend: 'up',
      eloChange: 15,
      position: 'ST',
    },
    {
      id: '10',
      rank: 10,
      name: 'Vũ Đình K',
      username: 'vudinhk',
      avatar: require('../../assets/icon.png'),
      elo: 2050,
      matchesPlayed: 65,
      wins: 38,
      losses: 21,
      draws: 6,
      winRate: 60.8,
      trend: 'down',
      eloChange: -10,
      position: 'DF',
    },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return theme.colors.textSecondary;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD70020';
      case 2:
        return '#C0C0C020';
      case 3:
        return '#CD7F3220';
      default:
        return 'transparent';
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

  const filteredPlayers = allPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-black">
      {/* Header */}
      <View className="px-5 py-4 border-b border-[#2a2a2a]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.softWhite} />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Ionicons name="trophy" size={28} color={theme.colors.neonGreen} />
              <Text className="text-2xl font-bold text-soft-white">
                ELO Leaderboard
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            className="flex-1 ml-2 text-soft-white"
            placeholder="Search players..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${selectedTab === 'overall' ? 'bg-neon-green' : 'bg-[#1a1a1a]'}`}
            onPress={() => setSelectedTab('overall')}
          >
            <Text className={`text-center font-semibold ${selectedTab === 'overall' ? 'text-dark-black' : 'text-medium-gray'}`}>
              Overall
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${selectedTab === 'weekly' ? 'bg-neon-green' : 'bg-[#1a1a1a]'}`}
            onPress={() => setSelectedTab('weekly')}
          >
            <Text className={`text-center font-semibold ${selectedTab === 'weekly' ? 'text-dark-black' : 'text-medium-gray'}`}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${selectedTab === 'monthly' ? 'bg-neon-green' : 'bg-[#1a1a1a]'}`}
            onPress={() => setSelectedTab('monthly')}
          >
            <Text className={`text-center font-semibold ${selectedTab === 'monthly' ? 'text-dark-black' : 'text-medium-gray'}`}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leaderboard List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {filteredPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-[#2a2a2a]"
              style={{ backgroundColor: getRankBgColor(player.rank) || '#1a1a1a' }}
              onPress={() => {
                // navigation.navigate('PlayerProfile', { playerId: player.id });
              }}
            >
              <View className="flex-row items-center">
                {/* Rank */}
                <View className="w-12 items-center">
                  <Text 
                    className="text-2xl font-bold"
                    style={{ color: getRankColor(player.rank) }}
                  >
                    #{player.rank}
                  </Text>
                </View>

                {/* Avatar */}
                <Image
                  source={player.avatar}
                  className="w-14 h-14 rounded-full ml-2"
                  resizeMode="cover"
                />

                {/* Player Info */}
                <View className="flex-1 ml-3">
                  <Text className="text-soft-white text-base font-bold">
                    {player.name}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-medium-gray text-sm">
                      @{player.username}
                    </Text>
                    {player.position && (
                      <>
                        <View className="w-1 h-1 rounded-full bg-medium-gray" />
                        <View className="bg-[#2a2a2a] px-2 py-0.5 rounded">
                          <Text className="text-neon-green text-xs font-semibold">
                            {player.position}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* ELO Score */}
                <View className="items-end">
                  <Text 
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    {player.elo}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons 
                      name={getTrendIcon(player.trend)} 
                      size={14} 
                      color={getTrendColor(player.trend)} 
                    />
                    <Text 
                      className="text-xs font-semibold ml-1"
                      style={{ color: getTrendColor(player.trend) }}
                    >
                      {player.eloChange > 0 ? '+' : ''}{player.eloChange}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats Bar */}
              <View className="flex-row mt-4 pt-3 border-t border-[#2a2a2a]">
                <View className="flex-1 items-center">
                  <Text className="text-medium-gray text-xs mb-1">
                    Matches
                  </Text>
                  <Text className="text-soft-white text-sm font-semibold">
                    {player.matchesPlayed}
                  </Text>
                </View>
                <View className="w-px bg-[#2a2a2a]" />
                <View className="flex-1 items-center">
                  <Text className="text-medium-gray text-xs mb-1">
                    W/L/D
                  </Text>
                  <Text className="text-soft-white text-sm font-semibold">
                    {player.wins}/{player.losses}/{player.draws}
                  </Text>
                </View>
                <View className="w-px bg-[#2a2a2a]" />
                <View className="flex-1 items-center">
                  <Text className="text-medium-gray text-xs mb-1">
                    Win Rate
                  </Text>
                  <Text 
                    className="text-sm font-semibold"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    {player.winRate}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredPlayers.length === 0 && (
          <View className="items-center justify-center py-20">
            <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
            <Text className="text-medium-gray text-lg mt-4">
              No players found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaderboardScreen;

