import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/types";
import { FriendRequestCard } from "../components";
import { ThemedText } from "@/shared/components/themed/ThemedText";
import { useScrollToHideTabBar } from "@/shared/hooks/useScrollToHideTabBar";
import {
  AnimatedSearchBar,
  EmptyState,
  ErrorState,
  ListSkeleton,
  LoadingMoreIndicator,
} from "@/shared/components";
import {
  usePaginatedFriendRequests,
  useRespondToFriendRequest,
} from "../hooks";
import { useDebounce } from "@/shared/hooks";

type FriendRequestsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FriendRequests"
>;

interface FriendRequestsScreenProps {
  navigation: FriendRequestsScreenNavigationProp;
}

const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();

  const {
    friendRequests,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setFriendRequests,
  } = usePaginatedFriendRequests({
    pageSize: 10,
  });

  const { mutate } = useRespondToFriendRequest();

  const handleAccept = (requesterId: string) => {
    mutate(
      { requesterId, accept: true },
      {
        onSuccess: () => {
          console.log("Friend request accepted!");
        },
        onError: (error) => {
          console.error("Failed to accept:", error);
        },
      },
    );
  };

  const handleReject = (requesterId: string) => {
    mutate(
      { requesterId, accept: false },
      {
        onSuccess: () => {
          console.log("Friend request rejected!");
        },
        onError: (error) => {
          console.error("Failed to reject:", error);
        },
      },
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="document-text-outline"
        title="Chưa có lời mời kết bạn"
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

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
          {t("friends.friendRequests", { defaultValue: "Lời mời kết bạn" })}
        </ThemedText>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Loading State */}
      {loading && <ListSkeleton />}

      {/* Error State */}
      {error && <ErrorState error={error} onRetry={refresh} />}

      {/* Data */}
      {!loading && !error && (
        <FlatList
          data={friendRequests}
          keyExtractor={(friendRequests) => friendRequests.friendshipId}
          renderItem={({ item: friendRequests }) => (
            <FriendRequestCard
              request={friendRequests}
              onAccept={() => {
                handleAccept(friendRequests.requesterId);
                refresh();
              }}
              onReject={() => {
                handleReject(friendRequests.requesterId);
                refresh();
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listContent: {
    paddingBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
