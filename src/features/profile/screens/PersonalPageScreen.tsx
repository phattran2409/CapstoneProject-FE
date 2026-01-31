import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
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
  usePaginatedPosts,
  usePaginatedUserPosts,
  useTogglePostLike,
} from "@/features/post/hooks";
import { useProfile } from "@/features/auth";
import { useSendFriendRequest, useUserProfile } from "../hooks";
import {
  useGetFriendshipStatus,
  useRemoveFriend,
  useRespondToFriendRequest,
} from "@/features/friends/hooks";

type PersonalPageScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PersonalPage"
>;

type TabType = "posts" | "history" | "analysis";

const PersonalPageScreen: React.FC<PersonalPageScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuthStore();
  const { t } = useTranslation();

  const { mutate: toggleLike } = useTogglePostLike();
  const handleLike = (postId: string) => {
    toggleLike(postId);
  };

  // Get userId from params or fallback to current user
  const userId = route.params?.userId || currentUser?.userId || "";
  const isCurrentUser = userId === currentUser?.userId;
  console.log("isCurrentUser", isCurrentUser);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItemData | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
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
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setPosts,
  } = usePaginatedUserPosts({
    userId: currentUser?.userId || "",
    pageSize: 10,
  });

  const stats = {
    matches: 88,
    winRate: 75,
  };

  const radarData = {
    WinLoss: 75,
    Perf: 85,
    Feedback: 70,
    Sentiment: 80,
    Trust: 75,
    RoleFactor: 65,
  };

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleSaveProfile = async (data: UpdateProfileData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to update profile
      console.log("Saving profile:", data);
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const recentMatches: MatchItemData[] = [
    {
      id: "1",
      title: "Giao hữu cuối tuần",
      date: "18/07/2024",
      status: "win",
      image: require("@assets/images/icon.png"),
      format: "5vs5",
      players: "10/10",
    },
    {
      id: "4",
      title: "Team Anh Em",
      date: "15/07/2024",
      status: "lose",
      image: require("@assets/images/icon.png"),
      format: "7vs7",
      players: "14/14",
    },
    {
      id: "5",
      title: "Đá cho vui",
      date: "12/07/2024",
      status: "draw",
      image: require("@assets/images/icon.png"),
      format: "6vs6",
      players: "12/12",
    },
    {
      id: "6",
      title: "Trận đấu cuối tuần",
      date: "10/07/2024",
      status: "win",
      image: require("@assets/images/icon.png"),
      format: "5vs5",
      players: "10/10",
    },
    {
      id: "7",
      title: "Giao hữu thân thiện",
      date: "08/07/2024",
      status: "draw",
      image: require("@assets/images/icon.png"),
      format: "7vs7",
      players: "14/14",
    },
    {
      id: "8",
      title: "Championship",
      date: "05/07/2024",
      status: "win",
      image: require("@assets/images/icon.png"),
      format: "11vs11",
      players: "22/22",
    },
  ];

  const handleMatchPress = (matchId: string) => {
    const match = recentMatches.find((m) => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setModalVisible(true);
    }
  };

  const handleViewDetail = (matchId: string) => {
    setModalVisible(false);
    setSelectedMatch(null);
    navigation.navigate("RoomInformation", { roomId: matchId });
  };

  const handleAddFriend = () => {
    sendFriendRequest(userId, {
      onSuccess: () => {
        console.log("Friend request sent successfully");
        refetchStatus();
      },
      onError: (error) => {
        console.error("Failed to send friend request:", error);
      },
    });
  };

  const handleRemoveFriend = () => {
    removeFriend(userId, {
      onSuccess: () => {
        console.log("Friend removed successfully");
        refetchStatus();
      },
      onError: (error) => {
        console.error("Failed to remove friend:", error);
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
        onError: (error) => {
          console.error("Failed to accept friend request:", error);
        },
      },
    );
  };

  const handleCancelRequest = () => {
    console.log("Cancel request not implemented yet");
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="document-text-outline"
        title="Chưa có bài viết nào"
        description="Người dùng này chưa đăng bài viết nào"
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
        <TouchableOpacity onPress={() => navigation.navigate("ProfileDetail")}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={theme.colors.text}
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
        >
          {/* Profile Section */}
          <View style={{ backgroundColor: theme.colors.background }}>
            <ProfileHeader
              avatar={profile?.avatarUrl}
              name={profile?.fullName || "Unknown User"}
              elo={profile?.playerProfile?.currentElo || 2450}
              description={profile?.bio || "N/A"}
              position={profile?.playerProfile?.preferredPositions || "N/A"}
              // shirtNumber={profile?.playerProfile?.shirtNumber || 0}
              isCurrentUser={isCurrentUser}
              onEditPress={handleEditProfile}
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
                {loading && <ProfileSkeleton />}

                {/* Error State */}
                {error && <ErrorState error={error} onRetry={refresh} />}

                {/* Posts List */}
                {!loading && !error && (
                  <FlatList
                    data={posts}
                    keyExtractor={(post) => post.postId}
                    renderItem={renderPostItem}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={refresh}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}
                  />
                )}
              </View>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <MatchList
                matches={recentMatches}
                variant="vertical"
                itemVariant="list"
                onMatchPress={handleMatchPress}
                showStatus={true}
                containerStyle={{ marginTop: theme.spacing.m }}
              />
            )}

            {/* Analysis Tab */}
            {activeTab === "analysis" && (
              <AnalysisTab stats={stats} radarData={radarData} />
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
        isLoading={isUpdating}
        initialData={{
          name: profile?.fullName || currentUser?.fullName || "",
          bio: profile?.bio || "",
          position: profile?.playerProfile?.preferredPositions || "",
          // shirtNumber: profile?.playerProfile?.shirtNumber || 0,
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
