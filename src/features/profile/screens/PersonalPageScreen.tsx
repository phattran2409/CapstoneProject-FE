import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useAuthStore } from "@/features/auth/store/authStore";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProfileHeader, AnalysisTab, EditProfileForm } from "../components";
import { ThemedText } from "@/shared/components/themed";
import { UpdateProfileData } from "../types/profile.types";
import {
  MatchList,
  MatchItem,
  MatchItemData,
  MatchDetailModal,
  PostItem,
  Post,
  ProfileSkeleton,
  ErrorState,
  EmptyState,
  LoadingMoreIndicator,
} from "@/shared/components";
import {
  usePaginatedUserPosts,
  useTogglePostLike,
} from "@/features/post/hooks";
import {
  useSendFriendRequest,
  useUserProfile,
  useMyRadarChart,
} from "../hooks";
import {
  useGetFriendshipStatus,
  useRemoveFriend,
  useRespondToFriendRequest,
} from "@/features/friends/hooks";
import {
  useMyRooms,
  useHistoryRooms,
} from "@/features/rooms/hooks/useMatchRooms";
import { useUpdateProfile, useUpdateAvatar } from "../hooks/useProfile";
import { useToast } from "@/shared/toast";
import { formatDate } from "@/shared/utils";
import { getImageSource } from "@/shared/utils/imageSource";
import { getTranslatedError } from "@/shared/utils/errorTranslations";

type PersonalPageScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PersonalPage"
>;

type TabType = "posts" | "history" | "analysis";

// Helper function to convert MyRoom to MatchItemData
const convertMyRoomToMatchItemData = (room: any): MatchItemData => {
  // Convert matchFormat to display format
  const formatMap: Record<string, string> = {
    FiveVsFive: "5vs5",
    SevenVsSeven: "7vs7",
    ElevenVsEleven: "11vs11",
  };

  return {
    id: String(
      room?.roomId ??
        room?.id ??
        `${room?.roomName ?? "room"}-${room?.matchDate ?? "date"}-${room?.startTime ?? "start"}`,
    ),
    title:
      room.roomName ||
      room.field?.fieldName ||
      room.field?.venue?.venueName ||
      "Unknown",
    format: formatMap[room.matchFormat] || room.matchFormat,
    players: `${room.filledSlots}/${room.totalSlots}`,
    image: getImageSource(room.venuePhotos?.[0]?.photoUrl),
    status: room.status,
    date: formatDate(room.matchDate),
    venue: room.field?.venue?.venueName,
    time: `${room.startTime.substring(0, 5)} - ${room.endTime.substring(0, 5)}`,
  };
};

const PersonalPageScreen: React.FC<PersonalPageScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuthStore();
  const { t } = useTranslation();
  const toast = useToast();

  const { mutate: toggleLike } = useTogglePostLike();
  const handleLike = (postId: string) => {
    toggleLike(postId);
  };

  // Get userId from params or fallback to current user
  const userId = route.params?.userId || currentUser?.userId || "";
  const isCurrentUser = userId === currentUser?.userId;
  console.log("isCurrentUser", isCurrentUser);

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItemData | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Profile data
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);

  // Friendship status and mutations
  const {
    friendshipStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useGetFriendshipStatus({
    userId,
    enabled: !isCurrentUser,
  });

  const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } =
    useSendFriendRequest();
  const { mutate: removeFriend, isPending: isRemovingFriend } =
    useRemoveFriend();
  const { mutate: respondToRequest, isPending: isRespondingToRequest } =
    useRespondToFriendRequest();

  const {
    posts,
    loading: postsLoading,
    refreshing: postsRefreshing,
    loadingMore: postsLoadingMore,
    error: postsError,
    refresh: postsRefresh,
    loadMore: postsLoadMore,
    setPosts,
  } = usePaginatedUserPosts({
    userId: userId,
    pageSize: 10,
  });

  const myRoomsQuery = useMyRooms({ availableOnly: true }, { enabled: isCurrentUser });
  const historyRoomsQuery = useHistoryRooms(userId, {
    enabled: !isCurrentUser && !!userId,
  });

  const {
    myRooms: matches,
    loading: matchesLoading,
    refreshing: matchesRefreshing,
    loadingMore: matchesLoadingMore,
    error: matchesError,
    hasMore: matchesHasMore,
    refresh: matchesRefresh,
    loadMore: matchesLoadMore,
  } = isCurrentUser ? myRoomsQuery : historyRoomsQuery;

  const { data: radarData, isLoading: radarLoading } = useMyRadarChart(isCurrentUser);

  // Memoize converted matches
  const listMatches = useMemo(() => {
    const seen = new Set<string>();
    return matches
      .filter((room) => {
        const id = String(room?.roomId ?? "");
        if (!id) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map(convertMyRoomToMatchItemData);
  }, [matches]);

  // Handle scroll for pagination
  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        if (
          activeTab === "history" &&
          !matchesLoading &&
          !matchesLoadingMore &&
          matchesHasMore
        ) {
          matchesLoadMore();
        } else if (
          activeTab === "posts" &&
          !postsLoading &&
          !postsLoadingMore
        ) {
          postsLoadMore();
        }
      }
    },
    [
      activeTab,
      matchesLoading,
      matchesLoadingMore,
      matchesHasMore,
      matchesLoadMore,
      postsLoading,
      postsLoadingMore,
      postsLoadMore,
    ],
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (activeTab === "history") {
      matchesRefresh();
    } else if (activeTab === "posts") {
      postsRefresh();
    }
    // Analysis tab usually doesn't need refresh or handles it differently
  }, [activeTab, matchesRefresh, postsRefresh]);

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleAchievementsPress = () => {
    navigation.navigate("Achievements");
  };

  // Profile update mutations
  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();

  const handleSaveProfile = async (userId: string, data: UpdateProfileData) => {
    updateProfile(
      { userId, data },
      {
        onSuccess: () => {
          console.log("Profile updated successfully");
          toast.success(t("personalPage.editForm.toast.updateSuccess"));
          setShowEditForm(false);
        },
        onError: (error: any) => {
          console.error("Error updating profile:", error);
          toast.error(getTranslatedError(error?.message) || t("personalPage.editForm.toast.updateError"));
        },
      },
    );
  };

  const handleMatchPress = (matchId: string) => {
    const match = matches.find((m) => m.roomId === matchId);
    if (match) {
      // Convert MyRoom to MatchItemData for the modal
      const matchItemData = convertMyRoomToMatchItemData(match);
      setSelectedMatch(matchItemData);
      setModalVisible(true);
    }
  };

  const handleViewDetail = (matchId: string) => {
    setModalVisible(false);
    setSelectedMatch(null);
    navigation.navigate("RoomInformation", {
      roomId: matchId,
      viewAsOthersMatchHistory: !isCurrentUser,
    });
  };

  const handleAddFriend = () => {
    sendFriendRequest(userId, {
      onSuccess: () => {
        console.log("Friend request sent successfully");
        refetchStatus();
      },
      onError: (error: any) => {
        console.error("Failed to send friend request:", error);
        toast.error(getTranslatedError(error?.message) || t("personalPage.editForm.toast.updateError"));
      },
    });
  };

  const handleRemoveFriend = () => {
    removeFriend(userId, {
      onSuccess: () => {
        console.log("Friend removed successfully");
        refetchStatus();
      },
      onError: (error: any) => {
        console.error("Failed to remove friend:", error);
        toast.error(getTranslatedError(error?.message) || t("personalPage.editForm.toast.updateError"));
      },
    });
  };

  const handleAcceptRequest = () => {
    respondToRequest(
      { requesterId: userId, accept: true },
      {
        onSuccess: () => {
          console.log("Friend request accepted");
          refetchStatus();
        },
        onError: (error: any) => {
          console.error("Failed to accept friend request:", error);
          toast.error(getTranslatedError(error?.message) || t("personalPage.editForm.toast.updateError"));
        },
      },
    );
  };

  const handleCancelRequest = () => {
    console.log("Cancel request not implemented yet");
  };

  const renderPostsFooter = () => {
    if (!postsLoadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  const renderPostsEmpty = () => {
    if (postsLoading) return null;
    return (
      <EmptyState
        icon="document-text-outline"
        title={t("personalPage.postsEmpty")}
        description={t("personalPage.postsEmptyDesc")}
      />
    );
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onLike={handleLike}
      onPress={(postId) => {
        navigation.navigate("PostDetail", { postId });
      }}
      onAvatarPress={(userId) => {
        navigation.navigate("PersonalPage", { userId });
      }}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText size="xl" weight="bold" variant="primary">
          {t("personalPage.title")}
        </ThemedText>
        <TouchableOpacity
          onPress={() => {
            if (profile) {
              navigation.navigate("ProfileDetail", { player: profile });
            }
          }}
          disabled={!profile}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={profile ? theme.colors.text : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {profileLoading ? (
        <ProfileSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={
                activeTab === "history" ? matchesRefreshing : postsRefreshing
              }
              onRefresh={handleRefresh}
              colors={[theme.colors.neonGreen]}
              tintColor={theme.colors.neonGreen}
            />
          }
        >
          {/* Profile Section */}
          <View style={{ backgroundColor: theme.colors.background }}>
            <ProfileHeader
              avatar={profile?.avatarUrl}
              name={profile?.fullName}
              elo={profile?.playerProfile?.currentElo || 0}
              description={profile?.bio}
              position={profile?.preferredPositions}
              shirtNumber={profile?.shirtNumber}
              isCurrentUser={isCurrentUser}
              onEditPress={handleEditProfile}
              onAchievementsPress={handleAchievementsPress}
              friendshipStatus={friendshipStatus?.status}
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
              onAcceptRequest={handleAcceptRequest}
              onCancelRequest={handleCancelRequest}
              isFriendshipLoading={
                isSendingFriendRequest ||
                isRemovingFriend ||
                isRespondingToRequest
              }
            />

            {isCurrentUser && (
              <View style={{ marginHorizontal: theme.spacing.m, marginBottom: theme.spacing.m, gap: 10 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ReceivedFeedback")}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: theme.spacing.m,
                    paddingHorizontal: theme.spacing.m,
                    borderRadius: theme.radius?.m ?? 12,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    gap: 10,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t("personalPage.receivedFeedback.title")}
                >
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={22}
                    style={{ paddingLeft: 15 }}
                    color={theme.colors.neonGreen}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: theme.fontSizes.m,
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center",
                      }}
                    >
                      {t("personalPage.receivedFeedback.title")}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Navigation Tabs */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: theme.spacing.m,
                marginBottom: theme.spacing.m,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              {(["posts", "analysis", "history"] as TabType[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: theme.spacing.m,
                    alignItems: "center",
                    borderBottomWidth: activeTab === tab ? 2 : 0,
                    borderBottomColor:
                      activeTab === tab
                        ? theme.colors.neonGreen
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSizes.m,
                      color:
                        activeTab === tab
                          ? theme.colors.neonGreen
                          : theme.colors.textSecondary,
                      fontWeight: activeTab === tab ? "700" : "400",
                    }}
                  >
                    {t(`personalPage.tabs.${tab}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Content */}
          <View style={{ paddingBottom: theme.spacing.xl }}>
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <View style={{ flex: 1 }}>
                {/* Loading State */}
                {postsLoading && <ProfileSkeleton />}

                {/* Error State */}
                {postsError && (
                  <ErrorState error={postsError} onRetry={postsRefresh} />
                )}

                {/* Posts List */}
                {!postsLoading && !postsError && (
                  <FlatList
                    data={posts}
                    keyExtractor={(post) => post.postId}
                    renderItem={renderPostItem}
                    ListFooterComponent={renderPostsFooter}
                    ListEmptyComponent={renderPostsEmpty}
                    onEndReached={postsLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={postsRefreshing}
                    onRefresh={postsRefresh}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}
                  />
                )}
              </View>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <View style={{ flex: 1 }}>
                {/* Loading State */}
                {matchesLoading && <ProfileSkeleton />}

                {/* Error State */}
                {matchesError && (
                  <ErrorState error={matchesError} onRetry={matchesRefresh} />
                )}

                {/* Matches List with Load More */}
                {!matchesLoading && !matchesError && (
                  <>
                    <MatchList
                      matches={listMatches}
                      variant="vertical"
                      itemVariant="list"
                      onMatchPress={handleMatchPress}
                      showStatus={true}
                      containerStyle={{ marginBottom: 16 }}
                      emptyMessage={t(
                        "matches.noMatches",
                        "Chưa có trận đấu nào",
                      )}
                    />
                    {matchesLoadingMore && (
                      <View
                        style={{ paddingVertical: 20, alignItems: "center" }}
                      >
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.neonGreen}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Analysis Tab */}
            {activeTab === "analysis" && (
              <AnalysisTab radarData={radarData ?? null} isLoading={radarLoading} />
            )}
          </View>
        </ScrollView>
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

      {/* Edit Profile Form Modal */}
      <EditProfileForm
        visible={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveProfile}
        userId={userId}
        isLoading={isUpdatingProfile}
        initialData={{
          fullName: profile?.fullName || currentUser?.fullName || "",
          phone: profile?.phone || "",
          avatarUrl: profile?.avatarUrl || "",
          bio: profile?.bio || "",
          dateOfBirth: profile?.dateOfBirth || "",
          gender: profile?.gender ?? undefined,
          preferredPositions:
            profile?.playerProfile?.preferredPositions ||
            profile?.preferredPositions ||
            "",
          shirtNumber: profile?.shirtNumber || 0,
          preferredFoot: profile?.preferredFoot || "",
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default PersonalPageScreen;
