import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView, ThemedSafeAreaView } from '@/shared/components/themed';
import { usePlayerLeaderboard, useMyRank } from '@/features/leaderboard';

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

  // ✅ Fetch leaderboard from API
  const timeframeMap = {
    overall: 'allTime' as const,
    weekly: 'weekly' as const,
    monthly: 'monthly' as const,
  };

  const { 
    data: leaderboardData, 
    isLoading,
    refetch 
  } = usePlayerLeaderboard({
    timeframe: timeframeMap[selectedTab],
    limit: 100,
  });

  // Get my rank
  const { data: myRank } = useMyRank();

  // Filter players by search query
  const players = useMemo(() => {
    if (!leaderboardData) return [];
    
    if (!searchQuery.trim()) return leaderboardData;
    
    const query = searchQuery.toLowerCase();
    return leaderboardData.filter(
      (player) =>
        player.name.toLowerCase().includes(query) ||
        player.username?.toLowerCase().includes(query)
    );
  }, [leaderboardData, searchQuery]);

  // Mock data fallback
  const mockPlayers: ELOPlayer[] = [
    {
      id: '1',
      rank: 1,
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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
      avatar: require('@assets/images/icon.png'),
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

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedView 
        style={[styles.headerContainer, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
      >
        <ThemedView style={styles.headerRow}>
          <ThemedView style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ThemedIcon name="arrow-back" size={24} variant="secondary" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <ThemedIcon name="trophy" size={28} variant="primary" />
              <ThemedText variant="primary" size="xl" weight="bold">
                ELO Leaderboard
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        {/* Search Bar */}
        <ThemedView 
          variant="surface"
          style={styles.searchContainer}
        >
          <ThemedIcon name="search" size={20} variant="secondary" />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={t('leaderboard.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ThemedIcon name="close-circle" size={20} variant="secondary" />
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Tabs */}
        <ThemedView style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'overall' ? theme.colors.neonGreen : theme.colors.surface }]}
            onPress={() => setSelectedTab('overall')}
          >
            <ThemedText 
              weight="semiBold" 
              style={[styles.tabText, { color: selectedTab === 'overall' ? '#000' : theme.colors.textSecondary }]}
            >
              {t('leaderboard.tabs.overall')}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'weekly' ? theme.colors.neonGreen : theme.colors.surface }]}
            onPress={() => setSelectedTab('weekly')}
          >
            <ThemedText 
              weight="semiBold" 
              style={[styles.tabText, { color: selectedTab === 'weekly' ? '#000' : theme.colors.textSecondary }]}
            >
              {t('leaderboard.tabs.weekly')}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'monthly' ? theme.colors.neonGreen : theme.colors.surface }]}
            onPress={() => setSelectedTab('monthly')}
          >
            <ThemedText 
              weight="semiBold" 
              style={[styles.tabText, { color: selectedTab === 'monthly' ? '#000' : theme.colors.textSecondary }]}
            >
              {t('leaderboard.tabs.monthly')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Leaderboard List */}
      <ThemedScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerCard,
                { 
                  backgroundColor: getRankBgColor(player.rank) || theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => {
                // navigation.navigate('PlayerProfile', { playerId: player.id });
              }}
            >
              <View style={styles.playerRow}>
                {/* Rank */}
                <View style={styles.rankContainer}>
                  <ThemedText 
                    size="xxl" 
                    weight="bold"
                    style={{ color: getRankColor(player.rank) }}
                  >
                    #{player.rank}
                  </ThemedText>
                </View>

                {/* Avatar */}
                <Image
                  source={player.avatar}
                  style={styles.playerAvatar}
                  resizeMode="cover"
                />

                {/* Player Info */}
                <View style={styles.playerInfo}>
                  <ThemedText variant="muted"  weight="bold">
                    {player.name}
                  </ThemedText>
                  <View style={styles.playerMeta}>
                    <ThemedText variant="secondary" size="s">
                      @{player.username}
                    </ThemedText>
                    {player.position && (
                      <>
                        <View 
                          style={[styles.dot, { backgroundColor: theme.colors.textSecondary }]}
                        />
                        <View 
                          style={[styles.positionBadge, { backgroundColor: theme.colors.surface }]}
                        >
                          <ThemedText variant="muted" size="xs" weight="semiBold">
                            {player.position}
                          </ThemedText>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* ELO Score */}
                <View style={styles.eloContainer}>
                  <ThemedText 
                    variant="primary"
                    size="xxl" 
                    weight="bold"
                  >
                    {player.elo}
                  </ThemedText>
                  <View style={styles.trendContainer}>
                    <Ionicons 
                      name={getTrendIcon(player.trend)} 
                      size={14} 
                      color={getTrendColor(player.trend)} 
                    />
                    <ThemedText 
                      size="xs" 
                      weight="semiBold"
                      style={[styles.trendText, { color: getTrendColor(player.trend) }]}
                    >
                      {player.eloChange > 0 ? '+' : ''}{player.eloChange}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Stats Bar */}
              <View 
                style={[styles.statsBar, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
              >
                <View style={styles.statItem}>
                  <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
                    {t('leaderboard.stats.matches')}
                  </ThemedText>
                  <ThemedText variant="primary" size="s" weight="semiBold">
                    {player.matchesPlayed}
                  </ThemedText>
                </View>
                <View style={{ width: 1, backgroundColor: theme.colors.border }} />
                <View style={styles.statItem}>
                  <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
                    {t('leaderboard.stats.winLossDraw')}
                  </ThemedText>
                  <ThemedText variant="primary" size="s" weight="semiBold">
                    {player.wins}/{player.losses}/{player.draws}
                  </ThemedText>
                </View>
                <View style={{ width: 1, backgroundColor: theme.colors.border }} />
                <View style={styles.statItem}>
                  <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
                    {t('leaderboard.stats.winRate')}
                  </ThemedText>
                  <ThemedText variant="primary" size="s" weight="semiBold">
                    {player.winRate}%
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredPlayers.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedIcon name="search-outline" size={64} variant="secondary" />
            <ThemedText variant="secondary" size="l" style={styles.emptyText}>
              {t('leaderboard.noResults')}
            </ThemedText>
          </View>
        )}
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabText: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  playerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 48,
    alignItems: 'center',
  },
  playerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 8,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eloContainer: {
    alignItems: 'flex-end',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    marginLeft: 4,
  },
  statsBar: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
  },
});

export default LeaderboardScreen;

