import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, ListRenderItemInfo } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText, ThemedView, ThemedSafeAreaView } from '@/shared/components/themed';
import { usePaginatedPlayers } from '@/features/leaderboard/hooks/useLeaderboard';
import { EmptyState, ErrorState, ListSkeleton, LoadingMoreIndicator, RankBadge } from '@/shared/components';
import { Players } from '../types/leaderboard.types';
import { getEmailUsername } from '@/shared/utils/formatters';

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


const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    users,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
  } = usePaginatedPlayers({ pageSize: 100 });

  const getRankColor = useCallback((rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return theme.colors.textSecondary;
    }
  }, [theme]);

  const getRankBgColor = useCallback((rank: number) => {
    switch (rank) {
      case 1: return '#FFD70020';
      case 2: return '#C0C0C020';
      case 3: return '#CD7F3220';
      default: return 'transparent';
    }
  }, []);

  const renderItem = useCallback(({ item: player, index }: ListRenderItemInfo<Players>) => {
    const rank = index + 1;
    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          {
            backgroundColor: getRankBgColor(rank) || theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => navigation.navigate('PlayerProfile', { playerId: player.userId })}
      >
        <View style={styles.playerRow}>
          {/* Rank */}
          <View style={styles.rankContainer}>
            <ThemedText size="xxl" weight="bold" style={{ color: getRankColor(rank) }}>
              #{rank}
            </ThemedText>
          </View>

          {/* Avatar */}
          <Image
            source={
              player.avatarUrl
                ? { uri: player.avatarUrl }
                : require('../../../assets/images/default_avatar.png')
            }
            style={styles.playerAvatar}
            resizeMode="cover"
          />

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <ThemedText variant="muted" weight="bold">
              {player.fullName}
            </ThemedText>
            <ThemedText
              variant="secondary"
              size="xs"
              >
                @{getEmailUsername(player.email)}
              </ThemedText>
            <View style={styles.playerMeta}>
              {player.preferredPositions && (
                <>
                  <View style={[styles.dot, { backgroundColor: theme.colors.textSecondary }]} />
                  <View style={[styles.positionBadge, { backgroundColor: theme.colors.surface }]}>
                    <ThemedText variant="muted" size="xs" weight="semiBold">
                      {player.preferredPositions}
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ELO Score */}
          <View style={styles.eloContainer}>
            <ThemedText variant="primary" size="xxl" weight="bold">
              {player.playerProfile?.currentElo}
            </ThemedText>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { borderTopWidth: 2, borderTopColor: theme.colors.white }]}>
          <View style={styles.statItem}>
            <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
              {t('leaderboard.stats.matches')}
            </ThemedText>
            <ThemedText variant="primary" size="s" weight="semiBold">
              {player.playerProfile?.totalMatches}
            </ThemedText>
          </View>
          <View style={{ width: 1, backgroundColor: theme.colors.white }} />
          <View style={styles.statItem}>
            <RankBadge
              elo={player.playerProfile?.currentElo ?? 0}
              size="medium"
              showElo
              transparent
              showLabel={false}
              eloColor={getRankColor(player.playerProfile?.currentElo ?? 0)}
            />
          </View>
          <View style={{ width: 1, backgroundColor: theme.colors.white }} />
          <View style={styles.statItem}>
            <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
              {t('leaderboard.stats.winRate')}
            </ThemedText>
            <ThemedText variant="primary" size="s" weight="semiBold">
              {(
                ((player.playerProfile?.wins ?? 0) /
                  (player.playerProfile?.totalMatches || 1)) *
                100
              ).toFixed(2)}%
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [theme, navigation, t, getRankColor, getRankBgColor]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <EmptyState
        icon="trophy-outline"
        title={t('leaderboard.empty')}
        description={t('leaderboard.noResults')}
      />
    );
  }, [loading, t]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  }, [loadingMore]);

  return (
    <ThemedSafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <ThemedView
        style={[styles.headerContainer, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
      >
        <ThemedView style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold" variant="primary">
            {t('leaderboard.title', { defaultValue: 'ELO Leaderboard' })}
          </ThemedText>
          <View style={{ width: 24 }} />
        </ThemedView>
      </ThemedView>

      {loading && <ListSkeleton />}
      {error && <ErrorState error={error} onRetry={refresh} />}

      {!loading && !error && (
        <FlatList
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          data={users}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
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
});

export default LeaderboardScreen;

