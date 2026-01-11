import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { TabParamList } from "@/app/navigation/types";
import { Friend } from "../types/friends.types";
import { FriendCard } from "../components";
import { ThemedSafeAreaView, ThemedView, ThemedText } from "@/shared/components/themed";
import { useScrollToHideTabBar } from "@/shared/hooks/useScrollToHideTabBar";
import { ThemedScrollView } from "@/shared/components/themed/ThemedScrollView";
import { IconButton } from "@/shared/components";

type FriendsScreenProps = BottomTabScreenProps<TabParamList, "Friends">;

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequestsCount] = useState(4); // TODO: Get from API/store

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
  // TODO: Replace mock data with API data or store data
  const [friends] = useState<Friend[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      username: "nguyenvana",
      elo: 2650,
      position: "ST",
      isOnline: true,
      mutualFriends: 5,
    },
    {
      id: "2",
      name: "Trần Minh B",
      username: "tranminhb",
      elo: 2400,
      position: "CM",
      isOnline: true,
      mutualFriends: 12,
    },
    {
      id: "3",
      name: "Lê Hoàng C",
      username: "lehoangc",
      elo: 2200,
      position: "CB",
      isOnline: false,
      lastActive: "2 giờ trước",
      mutualFriends: 3,
    },
    {
      id: "4",
      name: "Phạm Đức D",
      username: "phamducd",
      elo: 3100,
      position: "GK",
      isOnline: true,
      mutualFriends: 8,
    },
    {
      id: "5",
      name: "Hoàng Quốc E",
      username: "hoangquoce",
      elo: 1950,
      position: "LW",
      isOnline: false,
      lastActive: "1 ngày trước",
    },
    {
      id: "6",
      name: "Vũ Thành F",
      username: "vuthanhf",
      elo: 2750,
      position: "CAM",
      isOnline: true,
      mutualFriends: 15,
    },
  ]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: `${theme.colors.neonGreen}15` },
        ]}
      >
        <Ionicons
          name="people-outline"
          size={48}
          color={theme.colors.neonGreen}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery ? t("friends.noResults") : t("friends.empty")}
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {searchQuery
          ? t("friends.tryDifferentSearch", {
              defaultValue: t("friends.tryDifferentSearch"),
            })
          : t("friends.inviteFriends")}
      </Text>
    </View>
  );
  const searchBar = (
    <View
      style={[
        styles.searchContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder={t("friends.searchPlaceholder", {
          defaultValue: `${t("friends.searchPlaceholder")} (${friends.length})`,
        })}
        placeholderTextColor={theme.colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

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
          <IconButton
            icon="person-add-outline"
            onPress={handleFriendRequestsPress}
            size="medium"
            notificationCount={friendRequestsCount > 0 ? friendRequestsCount : undefined}
          />
          <IconButton
            icon="chatbubbles-outline"
            onPress={handleChatListPress}
            size="medium"
            notificationCount={5}
          />
        </View>
      </ThemedView>
      <ThemedView variant="surface" style={styles.searchContainer}>
        {searchBar}
      </ThemedView>

      <FlatList
        style={{ paddingHorizontal: theme.spacing.l }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onPress={() => {
              // TODO: Navigate to friend's profile
              console.log("Friend pressed:", item.name);
            }}
            onMessagePress={() => {
              // TODO: Navigate to chat
              console.log("Message pressed:", item.name);
            }}
            onInvitePress={() => {
              // TODO: Invite to match
              console.log("Invite pressed:", item.name);
            }}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: theme.spacing.xxl * 2 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
