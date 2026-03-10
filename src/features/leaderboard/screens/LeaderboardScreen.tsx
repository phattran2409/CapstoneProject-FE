import React, { useCallback, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, ListRenderItemInfo } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText, ThemedView, ThemedSafeAreaView } from '@/shared/components/themed';
import { useLeaderboard, useMyRank } from '@/features/leaderboard/hooks/useLeaderboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserProfile } from '@/features/profile/hooks';
import { EmptyState, ErrorState, ListSkeleton, RankBadge } from '@/shared/components';
import { Leaderboard } from '../types/leaderboard.types';
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
  const myUserId = useAuthStore((s) => s.user?.userId);
  const myUser = useAuthStore((s) => s.user);
  const { data: myProfile } = useUserProfile(myUserId || '');

  const leaderboardQuery = useLeaderboard();
  const myRankQuery = useMyRank();

  const leaderboard = useMemo(() => {
    const items = leaderboardQuery.data?.data?.leaderboard ?? [];
    // Product requirement: list size is implicitly 20
    return items.slice(0, 20);
  }, [leaderboardQuery.data]);

  const myRank = myRankQuery.data?.data?.rank;
  const isMyRankOutsideTop = typeof myRank === 'number' && myRank > 20;

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

  const renderEloTrend = useCallback((eloChange?: number | null) => {
    if (typeof eloChange !== 'number' || eloChange === 0) return null;
    const isUp = eloChange > 0;
    const color = isUp ? theme.colors.success : theme.colors.error;
    return (
      <View style={styles.trendContainer}>
        <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={color} />
        <ThemedText size="xs" weight="semiBold" style={[styles.trendText, { color }]}>
          {isUp ? `+${eloChange}` : `${eloChange}`}
        </ThemedText>
      </View>
    );
  }, [theme.colors.error, theme.colors.success]);

  const renderItem = useCallback(({ item: player }: ListRenderItemInfo<Leaderboard>) => {
    const rank = player.rank;
    const isMe = !!myUserId && player.userId === myUserId;
    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          {
            backgroundColor: getRankBgColor(rank) || theme.colors.surface,
            borderWidth: isMe ? 2 : 1,
            borderColor: isMe ? theme.colors.neonGreen : theme.colors.border,
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
          </View>

          {/* ELO Score */}
          <View style={styles.eloContainer}>
            <ThemedText variant="primary" size="xxl" weight="bold">
              {player.currentElo}
            </ThemedText>
            {renderEloTrend(player.eloChange)}
          </View>
        </View>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { borderTopWidth: 2, borderTopColor: theme.colors.white }]}>
          <View style={styles.statItem}>
            <ThemedText variant="secondary" size="xs" style={styles.statLabel}>
              {t('leaderboard.stats.matches')}
            </ThemedText>
            <ThemedText variant="primary" size="s" weight="semiBold">
              {player.totalMatches}
            </ThemedText>
          </View>
          <View style={{ width: 1, backgroundColor: theme.colors.white }} />
          <View style={styles.statItem}>
            <RankBadge
              elo={player.currentElo ?? 0}
              size="medium"
              showElo
              transparent
              showLabel={false}
              eloColor={getRankColor(player.currentElo ?? 0)}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getRankBgColor, getRankColor, myUserId, navigation, renderEloTrend, t, theme.colors.border, theme.colors.neonGreen, theme.colors.surface, theme.colors.white]);

  const renderEmpty = useCallback(() => {
    if (leaderboardQuery.isLoading) return null;
    return (
      <EmptyState
        icon="trophy-outline"
        title={t('leaderboard.empty')}
        description={t('leaderboard.noResults')}
      />
    );
  }, [leaderboardQuery.isLoading, t]);

  const renderMyRankCard = useMemo(() => {
    if (!isMyRankOutsideTop) return null;
    return (
      <View style={{ marginTop: 16 }}>
        <ThemedText variant="secondary" size="s" weight="semiBold" style={{ marginBottom: 8 }}>
          {t('leaderboard.myRank', { defaultValue: 'Your current rank' })}
        </ThemedText>
        <ThemedView
          style={[
            styles.playerCard,
            {
              backgroundColor: theme.colors.surface,
              borderWidth: 2,
              borderColor: theme.colors.neonGreen,
            },
          ]}
        >
          <View style={styles.playerRow}>
            <View style={styles.rankContainer}>
              <ThemedText size="xxl" weight="bold" style={{ color: theme.colors.neonGreen }}>
                #{myRank}
              </ThemedText>
            </View>
            <Image
              source={
                myProfile?.avatarUrl || myUser?.avatarUrl
                  ? { uri: myProfile?.avatarUrl || myUser?.avatarUrl! }
                  : require('../../../assets/images/default_avatar.png')
              }
              style={styles.playerAvatar}
              resizeMode="cover"
            />
            <View style={styles.playerInfo}>
              <ThemedText variant="muted" weight="bold">
                {myProfile?.fullName ?? myUser?.fullName ?? t('leaderboard.you', { defaultValue: 'You' })}
              </ThemedText>
              {myProfile?.email || myUser?.email ? (
                <ThemedText variant="secondary" size="xs">
                  @{getEmailUsername(myProfile?.email || myUser?.email || '')}
                </ThemedText>
              ) : null}
              {typeof myProfile?.playerProfile?.currentElo === 'number' && (
                <ThemedText variant="primary" size="s" weight="semiBold" style={{ marginTop: 4 }}>
                  ELO: {myProfile.playerProfile.currentElo}
                </ThemedText>
              )}
              {typeof myProfile?.playerProfile?.totalMatches === 'number' && (
                <ThemedText variant="secondary" size="xs">
                  {t('leaderboard.stats.matches')}: {myProfile.playerProfile.totalMatches}
                </ThemedText>
              )}
              <ThemedText variant="secondary" size="xs" style={{ marginTop: 4 }}>
                {t('leaderboard.outsideTop', { defaultValue: 'Outside top 20' })}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>
    );
  }, [isMyRankOutsideTop, myRank, myProfile?.avatarUrl, myProfile?.email, myProfile?.fullName, myProfile?.playerProfile?.currentElo, myProfile?.playerProfile?.totalMatches, myUser?.avatarUrl, myUser?.email, myUser?.fullName, t, theme.colors.neonGreen, theme.colors.surface]);

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

      {leaderboardQuery.isLoading && <ListSkeleton />}
      {leaderboardQuery.error && (
        <ErrorState
          error={
            leaderboardQuery.error instanceof Error
              ? leaderboardQuery.error.message
              : String(leaderboardQuery.error)
          }
          onRetry={leaderboardQuery.refetch}
        />
      )}

      {!leaderboardQuery.isLoading && !leaderboardQuery.error && (
        <FlatList
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={leaderboardQuery.isFetching && !leaderboardQuery.isLoading}
          onRefresh={leaderboardQuery.refetch}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderMyRankCard}
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

