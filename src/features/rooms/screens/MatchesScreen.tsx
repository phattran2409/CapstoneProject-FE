import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedText, ThemedView } from '@/shared/components/themed';
import { MatchList, MatchDetailModal, MatchItemData } from '@/shared/components';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';
import { RootStackParamList, TabParamList } from '@/app/navigation/types';
import { ActiveRoomBannerV2 } from '@/shared/components/ActiveRoomBannerV2';
import { useMatchRooms, useJoinRoomAsUnassigned, MatchRoom, MatchRoomFilters, MatchFormat } from '@/features/rooms';
import { PrivateRoomPasswordModal } from '../components';
import type { VenuePhoto } from '@/features/venues/types/venue.types';
import { FilterRoomMatch } from '../components/FilterRoomMatch';

type MatchesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Matches'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface MatchesScreenProps {
  navigation: MatchesScreenNavigationProp;
}

// Helper function to convert MatchRoom to MatchItemData
const convertMatchRoomToMatchItemData = (room: MatchRoom): MatchItemData => {
  // Convert matchFormat to display format
  const formatMap: Record<string, string> = {
    'FiveVsFive': '5vs5',
    'SevenVsSeven': '7vs7',
    'ElevenVsEleven': '11vs11',
  };
  
  // Format date
  const matchDate = new Date(room.matchDate);
  const formattedDate = matchDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    id: room.roomId,
    title: room.roomName,
    format: formatMap[room.matchFormat] || room.matchFormat,
    players: `${room.filledSlots}/${room.totalSlots}`,
    image: room.venuePhotos[0]?.photoUrl || '',
    status: room.status,
    date: formattedDate,
    venue: room.venueName,
    time: `${room.startTime.substring(0, 5)} - ${room.endTime.substring(0, 5)}`,
    isPrivate: room.isPrivate ?? (room.visibility === 'Private'),
  };
};

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const [selectedMatch, setSelectedMatch] = useState<MatchItemData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [pendingJoinParams, setPendingJoinParams] = useState<{
    roomId: string;
    params: { roomId: string; venuePhotos?: VenuePhoto[] };
    roomName?: string;
  } | null>(null);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<{
    matchFormat?: MatchFormat;
    date?: string;
  }>({
    matchFormat: undefined,
    date: undefined,
  });
  // Fetch match rooms from API
  const { 
    matchRooms, 
    loading, 
    refreshing, 
    loadingMore,
    hasMore,
    refresh,
    loadMore 
  } = useMatchRooms(
    {
      matchFormat: filter.matchFormat,
      date: filter.date,
    }
  );

  // Convert API data to MatchItemData format
  const matches = useMemo(() => {
    return matchRooms.map(convertMatchRoomToMatchItemData);
  }, [matchRooms]);

  // Split matches for display (first 2 as featured, rest as list)
  const featuredMatches = useMemo(() => matches.slice(0, matches.length ), [matches]);
  const listMatches = useMemo(() => matches.slice(0,matches.length), [matches]);
  
  
  const handleMatchPress = useCallback((matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setModalVisible(true);
    }
  }, [matches]);

  // Handle scroll to bottom for pagination
  const handleScroll = useCallback((event: any) => {
    scrollHandler(event);
    
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && hasMore && !loadingMore) {
      loadMore();
    }
  }, [scrollHandler, hasMore, loadingMore, loadMore]);

  // ✅ Hook để join room (tự động thêm vào Unassigned)
  const { mutate: joinRoomAsUnassigned, isPending: isJoining } = useJoinRoomAsUnassigned();

  const handleViewDetail = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    const room = matchRooms.find((r) => r.roomId === matchId);
    const venuePhotos = room?.venuePhotos;
    const params = { roomId: matchId, ...(venuePhotos?.length ? { venuePhotos } : {}) };

    if (match?.isPrivate) {
      setModalVisible(false);
      setSelectedMatch(null);
      setPendingJoinParams({
        roomId: matchId,
        params,
        roomName: match.title,
      });
      setPasswordError(undefined);
      setPasswordModalVisible(true);
      return;
    }

    joinRoomAsUnassigned(
      { roomId: matchId },
      {
        onSuccess: () => {
          navigation.navigate('RoomInformation', params);
        },
        onError: (error: any) => {
          console.log('Join room error (may already be participant):', error?.message);
          navigation.navigate('RoomInformation', params);
        },
      }
    );
  };

  const handlePasswordConfirm = (password: string) => {
    if (!pendingJoinParams) return;
    setPasswordError(undefined);
    joinRoomAsUnassigned(
      { roomId: pendingJoinParams.roomId, password },
      {
        onSuccess: () => {
          setPasswordModalVisible(false);
          setPendingJoinParams(null);
          navigation.navigate('RoomInformation', pendingJoinParams.params);
        },
        onError: (error: any) => {
          setPasswordError(error?.message ?? 'Mật khẩu không đúng. Vui lòng thử lại.');
        },
      }
    );
  };

  const handlePasswordModalCancel = () => {
    setPasswordModalVisible(false);
    setPendingJoinParams(null);
    setPasswordError(undefined);
  };

  const handleFilter = (filters: {
    matchFormat?: MatchFormat;
    date?: string;
  }) => {
    setFilter(filters);
    setFilterVisible(false);
  }
  
  const handleCloseFilter = () => {
    setFilterVisible(false);
  }
  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.xl,
          },
        ]}
      >
        <ThemedText size="xxl" weight="bold" variant="primary">
          {t("matches.title", "Trận đấu")}
        </ThemedText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setFilterVisible(true)}>
            <Ionicons
              name="filter"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Active Room Banner - Chỉ hiển thị khi có active room */}
      <ActiveRoomBannerV2 />

      <ScrollView 
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.neonGreen]}
            tintColor={theme.colors.neonGreen}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.neonGreen} />
          </View>
        ) : (
          <>
            {/* Featured Matches Section */}
            {featuredMatches.length > 0 && (
              <MatchList
                matches={featuredMatches}
                title={t("home.RecommendMatches")}
                variant="horizontal"
                itemVariant="card"
                onMatchPress={handleMatchPress}
                showStatus={true}
              />
            )}

            {/* All Matches Section */}
            {listMatches.length > 0 && (
              <MatchList
                matches={listMatches}
                title={t("home.recentMatches", "Trận đấu gần đây")}
                variant="vertical"
                itemVariant="list"
                onMatchPress={handleMatchPress}
                showStatus={true}
                containerStyle={{ marginBottom: theme.spacing.xxl * 2 }}
              />
            )}

            {/* Loading more indicator */}
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={theme.colors.neonGreen} />
              </View>
            )}

            {/* Empty state */}
            {matches.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="football-outline" size={64} color={theme.colors.textSecondary} />
                <ThemedText variant="secondary" size="m" style={{ marginTop: theme.spacing.m }}>
                  {t("matches.noMatches", "Chưa có trận đấu nào")}
                </ThemedText>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          {
            backgroundColor: theme.colors.neonGreen,
            shadowColor: theme.colors.neonGreen,
            borderRadius: theme.radius.l,
            paddingVertical: theme.spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: theme.spacing.l,
            marginBottom: theme.spacing.l,
          },
        ]}
        onPress={() => {
          navigation.navigate("CreateRoom");
        }}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
        <ThemedText
          size="l"
          weight="bold"
          style={{ marginLeft: 8, color: theme.colors.background }}
        >
          {t("home.createNewRoom", "Tạo phòng mới")}
        </ThemedText>
      </TouchableOpacity>

      {/* Match Detail Modal */}
      <MatchDetailModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={() => {
          setModalVisible(false);
          setSelectedMatch(null);
        }}
        onViewDetail={handleViewDetail}
      />

      {/* Modal nhập mật khẩu khi vào phòng private */}
      <PrivateRoomPasswordModal
        visible={passwordModalVisible}
        roomName={pendingJoinParams?.roomName}
        onConfirm={handlePasswordConfirm}
        onCancel={handlePasswordModalCancel}
        isLoading={isJoining}
        errorMessage={passwordError}
      />

      {/* Filter Room Match Modal */}
      <FilterRoomMatch visible={filterVisible} onApply={handleFilter} onClose={handleCloseFilter} theme={theme} />
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
});

export default MatchesScreen;
