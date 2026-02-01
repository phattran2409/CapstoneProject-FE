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
import { useMatchRooms, useJoinRoomAsUnassigned, MatchRoom } from '@/features/rooms';

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
  };
  
  // Format date
  const matchDate = new Date(room.matchDate);
  const formattedDate = matchDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Determine status for display
  const getDisplayStatus = (status: string): MatchItemData['status'] => {
    switch (status) {
      case 'Open':
        return 'ongoing';
      case 'Full':
        return 'ongoing';
      case 'Completed':
        return 'win'; // Default, could be dynamic based on result
      case 'Cancelled':
        return 'lose';
      default:
        return 'ongoing';
    }
  };

  return {
    id: room.roomId,
    title: room.fieldName || room.venueName,
    format: formatMap[room.matchFormat] || room.matchFormat,
    players: `${room.filledSlots}/${room.totalSlots}`,
    image: require('@assets/images/icon.png'),
    status: getDisplayStatus(room.status),
    date: formattedDate,
    venue: room.venueName,
    time: `${room.startTime.substring(0, 5)} - ${room.endTime.substring(0, 5)}`,
  };
};

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const [selectedMatch, setSelectedMatch] = useState<MatchItemData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch match rooms from API
  const { 
    matchRooms, 
    loading, 
    refreshing, 
    loadingMore,
    hasMore,
    refresh,
    loadMore 
  } = useMatchRooms();

  // Convert API data to MatchItemData format
  const matches = useMemo(() => {
    return matchRooms.map(convertMatchRoomToMatchItemData);
  }, [matchRooms]);

  // Split matches for display (first 2 as featured, rest as list)
  const featuredMatches = useMemo(() => matches.slice(0, 2), [matches]);
  const listMatches = useMemo(() => matches.slice(0,2), [matches]);
  
  
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
    // Gọi API join để thêm user vào room (Unassigned)
    // Server sẽ broadcast UserJoinedRoom event → toast cho tất cả members
    joinRoomAsUnassigned(matchId, {
      onSuccess: () => {
        // Join thành công → Navigate đến RoomInformation
        navigation.navigate('RoomInformation', { roomId: matchId });
      },
      onError: (error: any) => {
        // Nếu đã là participant hoặc lỗi khác → vẫn navigate để xem thông tin
        console.log('Join room error (may already be participant):', error?.message);
        navigation.navigate('RoomInformation', { roomId: matchId });
      },
    });
  };

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
          <TouchableOpacity style={styles.iconButton}>
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
