import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  AnimatedSearchBar,
  EmptyState,
  ErrorState,
  ListSkeleton,
  LoadingMoreIndicator,
} from "@/shared/components";
import { useChatConversations } from "../hooks";
import { ChatItem, ChatItemData } from "../components";
import { useDebounce } from "@/shared/hooks";

type ChatListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ChatList"
>;

interface ChatListScreenProps {
  navigation: ChatListScreenNavigationProp;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    chatConversations,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setChatConversations,
  } = useChatConversations({ pageSize: 20, searchTerm: debouncedSearchQuery });

  const chats: ChatItemData[] =
    chatConversations?.map((c) => ({
      id: c.otherUserId,
      name: c.otherUserName,
      lastMessage: c.lastMessage,
      timestamp: c.lastMessageAt,
      isOnline: c.isOnline,
      avatar: c.otherUserAvatarUrl,
    })) ?? [];

  const handleChatPress = (chatId: string, chatName: string) => {
    navigation.navigate("Chat", { chatId, chatName });
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="chatbubble-outline"
        title={t("chat.noConversations")}
        description={t("chat.noConversations")}
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
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.m,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: theme.fontSizes.l,
            color: theme.colors.text,
            fontWeight: "700",
          }}
        >
          {t("chat.title")}
        </Text>
        <TouchableOpacity onPress={() => setIsSearchVisible(!isSearchVisible)}>
          <Ionicons
            name="search"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <AnimatedSearchBar
        visible={isSearchVisible}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClose={() => setIsSearchVisible(false)}
        placeholder={t("chat.searchPlaceholder", {
          defaultValue: "Search chats",
        })}
      />
      {loading && <ListSkeleton />}
      {error && <ErrorState error={error} onRetry={refresh} />}

      {!loading && !error && (
        <FlatList
          data={chats}
          renderItem={({ item }) => (
            <ChatItem item={item} onPress={handleChatPress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.m }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onRefresh={refresh}
          refreshing={refreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatListScreen;
