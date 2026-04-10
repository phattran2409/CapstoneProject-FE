import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import { useScrollToHideTabBar } from "@/shared/hooks/useScrollToHideTabBar";
import { useAlert } from "@/shared/hooks/useAlert";
import {
  PostItem,
  Post,
  IconButton,
  PostDetailSkeleton,
  ErrorState,
  EmptyState,
  LoadingMoreIndicator,
  AnimatedSearchBar,
} from "@/shared/components";
import {
  usePaginatedPosts,
  useTogglePostLike,
} from "@/features/post/hooks";
import { TabParamList } from "@/app/navigation/types";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useDebounce } from "@/shared/hooks";
import { EloLeaderboardSection } from "@/features/leaderboard";
import { useLeaderboard } from "@/features/leaderboard/hooks/useLeaderboard";
import { useAuthStore } from "@/features/auth";
import { authApi } from "@/features/auth/api";
import { getFcmToken } from "@/shared/firebase/messaging";
import { usePaginatedNotifications } from "@/features/notification/hooks";
import { useToast } from "@/shared/toast";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Home">,
  NativeStackNavigationProp<any>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const { user } = useAuthStore();
  const pendingLoginSuccessToast = useAuthStore(
    (s) => s.pendingLoginSuccessToast,
  );
  const setPendingLoginSuccessToast = useAuthStore(
    (s) => s.setPendingLoginSuccessToast,
  );
  const hasSyncedFcmRef = useRef(false);
  const toast = useToast();
  const leaderboardQuery = useLeaderboard();
  const topUsers = useMemo(
    () => (leaderboardQuery.data?.leaderboard ?? []).slice(0, 5),
    [leaderboardQuery.data?.leaderboard],
  );

  // Toast đăng nhập thành công: gọi ở đây vì Login unmount ngay khi chuyển sang MainTabs
  useEffect(() => {
    if (!pendingLoginSuccessToast || !user) return;
    setPendingLoginSuccessToast(false);
    toast.success(
      t("login.success.title", "Đăng nhập thành công"),
      t("login.success.message", "Chào mừng bạn trở lại!"),
    );
  }, [pendingLoginSuccessToast, user, setPendingLoginSuccessToast, toast, t]);

  // Đăng ký / đồng bộ FCM token sau khi user đã đăng nhập và vào Home
  useEffect(() => {
    const syncFcmToken = async () => {
      try {
        if (!user) return;
        if (hasSyncedFcmRef.current) return; // Đã sync rồi trong session này
        const token = await getFcmToken();
        if (!token) return;
        await authApi.updateFcmToken(token);
        hasSyncedFcmRef.current = true;
        console.log("✅ FCM token registered from HomeScreen");
      } catch (error: any) {
        toast.error(error?.message || t("personalPage.editForm.toast.updateError"));
        console.error("❌ Failed to register FCM token from HomeScreen:", error);
      }
    };

    syncFcmToken();
  }, [user?.userId]);

  // Use paginated posts hook
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setPosts,
  } = usePaginatedPosts({ pageSize: 10 });

  const { mutate: toggleLike } = useTogglePostLike();

  // Kiểm tra có thông báo chưa đọc không
  const { notifications: allNotifications } = usePaginatedNotifications({ pageSize: 20 });
  const hasUnreadNotification = allNotifications.some((n) => !n.isRead);

  const handleLike = (postId: string) => {
    toggleLike(postId);
  };

  // Render header component
  const renderHeader = () => (
    <>
      {/*What's on your mind Section */}
      <ThemedView
        style={[
          styles.whatsOnMindContainer,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.whatsOnMindContent}>
          {/* Avatar */}
          <TouchableOpacity
            onPress={() => {
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate("PersonalPage");
              }
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 2,
                  borderColor: theme.colors.neonGreen,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {user?.avatarUrl ? (
                <Image
                  source={
                    typeof user.avatarUrl === "string"
                      ? { uri: user.avatarUrl }
                      : user.avatarUrl
                  }
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require("../assets/images/default_avatar.png")}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  resizeMode="cover"
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Input Field */}
          <TouchableOpacity
            onPress={() => {
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate("CreatePost");
              }
            }}
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.l,
                paddingHorizontal: theme.spacing.m,
                paddingVertical: theme.spacing.s,
                flex: 1,
                marginLeft: theme.spacing.m,
              },
            ]}
            activeOpacity={0.7}
          >
            <ThemedText variant="secondary" size="m">
              {t("newsFeed.whatdoyouthink", {
                defaultValue: "Bạn đang nghĩ gì?",
              })}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* ELO Leaderboard Section */}
      <EloLeaderboardSection users={topUsers} loading={leaderboardQuery.isLoading} error={leaderboardQuery.error} />
    </>
  );

  // Render footer component for loading more
  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  // Render empty component
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState icon="document-text-outline" title="Chưa có bài viết nào" />
    );
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
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <ThemedText variant="primary" size="xxl" weight="bold">
            {t("newsFeed.title")}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>        
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Search" as any)}
          >
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <IconButton
            icon="wallet-outline"
            onPress={() => navigation.navigate("Wallet" as any)}
            size="medium"
          />
          <IconButton
            icon="notifications-outline"
            onPress={() => navigation.navigate("Notifications" as any)}
            size="medium"
            showDot={hasUnreadNotification}
          />
        </View>
      </ThemedView>

      {/* Loading State */}
      {loading && <PostDetailSkeleton />}

      {/* Error State */}
      {error && <ErrorState error={error} onRetry={refresh} />}

      {/* Posts Feed with FlatList */}
      {!loading && !error && (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.postId}
          renderItem={({ item: post }) => (
            <PostItem
              post={post}
              onLike={handleLike}
              onPress={(postId) => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("PostDetail", { postId });
                }
              }}
              onAvatarPress={(userId) => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("PersonalPage", { userId });
                  console.log(userId);
                }
              }}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl * 2 }}
        />
      )}
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  whatsOnMindContainer: {
    borderBottomWidth: 1,
  },
  whatsOnMindContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    overflow: "hidden",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
