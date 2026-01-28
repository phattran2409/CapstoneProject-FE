import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { TabParamList } from "@/app/navigation/types";
import { Friend } from "../types/friends.types";
import { FriendCard } from "../components";
import {
  ThemedSafeAreaView,
  ThemedView,
  ThemedText,
} from "@/shared/components/themed";
import { useScrollToHideTabBar } from "@/shared/hooks/useScrollToHideTabBar";
import { ThemedScrollView } from "@/shared/components/themed/ThemedScrollView";
import {
  EmptyState,
  ErrorState,
  IconButton,
  ListSkeleton,
  LoadingMoreIndicator,
  AnimatedSearchBar,
} from "@/shared/components";
import { usePaginatedFriends } from "../hooks";
import { useDebounce } from "@/shared/hooks";

type FriendsScreenProps = BottomTabScreenProps<TabParamList, "Friends">;



const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleFriendRequestsPress = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("FriendRequests");
    }
  };

  const handleChatListPress = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("ChatList");
    }
  };

  const {
    friends,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setFriends,
  } = usePaginatedFriends({ pageSize: 10, searchTerm: debouncedSearchQuery });

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="people-outline"
        title={t("friends.empty")}
        description={t("friends.inviteFriends")}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
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
        <ThemedText variant="primary" size="xxl" weight="bold">
          {t("friends.title")}
        </ThemedText>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsSearchVisible(!isSearchVisible)}
          >
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <IconButton
            icon="person-add-outline"
            onPress={handleFriendRequestsPress}
            size="medium"
          />
          <IconButton
            icon="chatbubbles-outline"
            onPress={handleChatListPress}
            size="medium"
          />
        </View>
      </ThemedView>

      {/* Animated Search Bar */}
      <AnimatedSearchBar
        visible={isSearchVisible}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClose={() => setIsSearchVisible(false)}
        placeholder={t("friends.searchPlaceholder", {
          defaultValue: "Search friends",
        })}
      />

      {loading && <ListSkeleton />}

      {error && <ErrorState error={error} onRetry={refresh} />}

      {!loading && !error && (
        <FlatList
          style={{ paddingHorizontal: theme.spacing.l }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          data={friends}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <FriendCard
              friend={item}
              onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("PersonalPage", { userId: item.userId });
                }
              }}
              onMessagePress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("Chat", {
                    chatId: item.userId,
                    chatName: item.fullName,
                  });
                }
              }}
              onInvitePress={() => {
                // TODO: Invite to match
                console.log("Invite pressed:", item.fullName);
              }}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: theme.spacing.xxl * 2 },
          ]}
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

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  listContent: {
    paddingHorizontal: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
