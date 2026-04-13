import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedText, ThemedView } from '@/shared/components/themed';
import { MatchList, MatchDetailModal, MatchItemData, MatchroomSkeleton } from '@/shared/components';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';
import { RootStackParamList, TabParamList } from '@/app/navigation/types';
import { useMatchRooms, useJoinRoomAsUnassigned, MatchRoom, MatchRoomFilters, MatchFormat } from '@/features/rooms';
import { useMatchRoomRecommend, useMyRooms } from '@/features/rooms/hooks/useMatchRooms';
import { PrivateRoomPasswordModal } from '../components';
import type { VenuePhoto } from '@/features/venues/types/venue.types';
import { FilterRoomMatch } from '../components/FilterRoomMatch';
import { useLocationRadiusFilter } from '@/shared/hooks/useLocationRadiusFilter';
import { OptionFilter } from '@/features/venues';
import { useToast } from '@/shared/toast';
import { getTranslatedError } from '@/shared/utils/errorTranslations';
import { toMatchItemData } from '../utils/matchItemMapper';

type MatchesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Matches'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface MatchesScreenProps {
  navigation: MatchesScreenNavigationProp;
}

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
  const [optionFilterVisible, setOptionFilterVisible] = useState(false);
  const { latitude, longitude, radiusKm,locationLoading, handleApplyRadiusFilter } = useLocationRadiusFilter({t: t as (key: string, defaultValue?: string | object) => string});
  // Fetch match rooms from API
  // 1) Recommended matches – không dùng vị trí
  const {
    matchRoomRecommend: recommendedRooms,
    loading: loadingRecommended,
    refreshing: refreshingRecommended,
    loadingMore: loadingMoreRecommended,
    error: errorRecommended,
    refresh: refreshRecommended,
    loadMore: loadMoreRecommended,
  } = useMatchRoomRecommend();

  // 2) Nearby matches – có dùng vị trí (latitude, longitude, radiusKm)
  const { 
    matchRooms: nearbyRooms, 
    loading: loadingNearby, 
    refreshing, 
    loadingMore: loadingMoreNearby,
    hasMore,
    refresh,
    loadMore,
  } = useMatchRooms(
    {
      matchFormat: filter.matchFormat,
      date: filter.date,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      radiusKm: radiusKm ?? undefined,
    }
  );

  const {
    myRooms: myRoomsData,
    loading: loadingMyRooms,
    refreshing: refreshingMyRooms,
    refresh: refreshMyRooms,
  } = useMyRooms({ availableOnly: true });

  // If only "my rooms" has data and match lists are still loading, we still render UI.
  const isLoading =
    (loadingRecommended || loadingNearby || loadingMyRooms) &&
    recommendedRooms.length === 0 &&
    nearbyRooms.length === 0 &&
    (myRoomsData?.length ?? 0) === 0;

  // Convert API data to MatchItemData format
  const featuredMatches = useMemo(() => {
    return recommendedRooms.map(toMatchItemData);
  }, [recommendedRooms]);

  const listMatches = useMemo(() => {
    return nearbyRooms.map(toMatchItemData);
  }, [nearbyRooms]);

  const myRoomsMatches = useMemo(() => {
    return (myRoomsData ?? []).map(toMatchItemData).filter((m) => !!m.id);
  }, [myRoomsData]);

  const allMatches = useMemo(
    () => [...myRoomsMatches, ...featuredMatches, ...listMatches],
    [myRoomsMatches, featuredMatches, listMatches]
  );
  
  const isEmptyMatches =
    !isLoading &&
    featuredMatches.length === 0 &&
    listMatches.length === 0 &&
    myRoomsMatches.length === 0;
  
  const handleMatchPress = useCallback((matchId: string) => {
    const match = allMatches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setModalVisible(true);
    }
  }, [allMatches]);

  // Handle scroll to bottom for pagination
  const handleScroll = useCallback((event: any) => {
    scrollHandler(event);
    
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && hasMore && !loadingMoreNearby) {
      loadMore();
    }
  }, [scrollHandler, hasMore, loadingMoreNearby, loadMore]);

  const { mutate: joinRoomAsUnassigned, isPending: isJoining } = useJoinRoomAsUnassigned();
  const toast = useToast();
  const handleViewDetail = (matchId: string) => {
    const match = allMatches.find((m) => m.id === matchId);
    const room = [
      ...recommendedRooms,
      ...nearbyRooms,
      ...(myRoomsData ?? []),
    ].find((r: any) => String(r.roomId) === String(matchId));

    const venuePhotosFromRoom = Array.isArray((room as any)?.venuePhotos)
      ? ((room as any).venuePhotos as VenuePhoto[])
      : [];
    const fallbackVenuePhotos =
      typeof match?.image === 'string' && match.image
        ? ([{ photoId: `fallback-${matchId}`, photoUrl: match.image, isPrimary: true }] as VenuePhoto[])
        : [];
    const venuePhotos = venuePhotosFromRoom.length > 0 ? venuePhotosFromRoom : fallbackVenuePhotos;
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
          toast.error(
            getTranslatedError(error?.message, error?.code) ||
              t("personalPage.editForm.toast.updateError")
          );
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
          toast.error(
            getTranslatedError(error?.message, error?.code) ||
              t("personalPage.editForm.toast.updateError")
          );
          setPasswordError(
            getTranslatedError(error?.message, error?.code) ||
              t('matches.passwordInvalid')
          );
        },
      }
    );
  };

  const handlePasswordModalCancel = () => {
    setPasswordModalVisible(false);
    setPendingJoinParams(null);
    setPasswordError(undefined);
  };
  const handleCloseOptionFilter = () => {
    setOptionFilterVisible(false);
  }

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
    <ThemedSafeAreaView style={{ flex: 1 , position: 'relative'}}>
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
          {/* <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.iconButton} onPress={() => setFilterVisible(true)}>
            <Ionicons
              name="filter"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <View style={styles.flex1}>
        <ScrollView 
          style={styles.flex1}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || refreshingMyRooms || refreshingRecommended}
              onRefresh={() => {
                refresh();
                refreshMyRooms();
                refreshRecommended();
              }}
              colors={[theme.colors.neonGreen]}
              tintColor={theme.colors.neonGreen}
            />
          }
        >
          {isLoading ? (
            <MatchroomSkeleton />
          ) : (
            <>
              {/* My rooms (Phòng đấu của tôi) */}
              {myRoomsMatches.length > 0 && (
                <MatchList
                  matches={myRoomsMatches}
                  title={t('matches.myRoomsTitle')}
                  variant="horizontal"
                  itemVariant="third"
                  onMatchPress={handleMatchPress}
                  showStatus={false}
                  containerStyle={{ marginBottom: theme.spacing.xxl }}
                />
              )}

              {/* Featured Matches Section (không dùng vị trí) */}
              {featuredMatches.length > 0 && (
                <MatchList
                  matches={featuredMatches}
                  title={t("home.RecommendMatches")}
                  variant="horizontal"
                  itemVariant="card"
                  onMatchPress={handleMatchPress}
                  showStatus={false}
                />
              )}

              {/* All Matches Section (lọc theo vị trí) */}
              {listMatches.length > 0 && (
                <>
                  <View style={[styles.ContainerRecentMatches, { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m }]}>
                    <ThemedText size="xl" weight="bold" style={{ color: theme.colors.neonGreen }}>
                      {t("home.recentMatches", "Trận đấu gần đây")}
                    </ThemedText>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setOptionFilterVisible(true)}>
                      <Ionicons name="filter" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <MatchList
                    matches={listMatches}
                    variant="vertical"
                    itemVariant="list"
                    onMatchPress={handleMatchPress}
                    showStatus={false}
                    containerStyle={{ marginBottom: theme.spacing.xxl * 2 }}
                  />
                </>
              )}

              {/* Loading more indicator */}
              {loadingMoreNearby && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={theme.colors.neonGreen} />
                </View>
              )}

              {/* Empty state + Create button on top when empty */}
              {isEmptyMatches && (
                <>
                  <View style={styles.emptyContainer}>
                    <Ionicons name="football-outline" size={100} color={theme.colors.textSecondary} />
                    <ThemedText variant="secondary" size="xl" style={{ marginTop: theme.spacing.m }}>
                      {t("matches.noMatches", "Chưa có trận đấu nào")}
                    </ThemedText>
                  </View>
                  <View style={{ paddingHorizontal: theme.spacing.l, marginTop: theme.spacing.l }}>
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
                        },
                      ]}
                      onPress={() => {
                        navigation.navigate("CreateRoom");
                      }}
                    >
                      <Ionicons name="add-circle-sharp" size={50} color={theme.colors.background} />
                      <ThemedText
                        size="l"
                        weight="bold"
                        style={{ marginLeft: 8, color: theme.colors.background }}
                      >
                        {t("home.createNewRoom", "Tạo phòng mới")}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              
            </>
          )}
        </ScrollView>
      </View>
      {/* Footer Create Button (không overlay ScrollView) */}
      {!isEmptyMatches && (
        <View style={[styles.createButtonFooter, { paddingHorizontal: theme.spacing.l, paddingBottom: theme.spacing.l }]}>
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
        </View>
      )}
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
      <OptionFilter visible={optionFilterVisible} initialRadiusKm={radiusKm} onApply={handleApplyRadiusFilter} onClose={handleCloseOptionFilter} />
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
  createButtonFooter: {
    paddingTop: 12,
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
  ContainerRecentMatches: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default MatchesScreen;
