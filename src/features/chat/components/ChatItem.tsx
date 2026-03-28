import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { getRelativeTime } from "@/shared/utils";

export interface ChatItemData {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  avatar?: any;
  /** Tin chưa đọc — cùng nguồn với FriendsScreen `useHasUnreadChats` (conversation.unreadCount) */
  unreadCount?: number;
}

interface ChatItemProps {
  item: ChatItemData;
  onPress: (chatId: string, chatName: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ item, onPress }) => {
  const { theme } = useTheme();
  const hasUnread = (item.unreadCount ?? 0) > 0;

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.xs,
        alignItems: "center",
      }}
      onPress={() => onPress(item.id, item.name)}
    >
      <View style={{ position: "relative" }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.border,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="person"
            size={32}
            color={theme.colors.textSecondary}
          />
        </View>
        {hasUnread && (
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.colors.error,
              borderWidth: 2,
              borderColor: theme.colors.surface,
            }}
          />
        )}
        {item.isOnline && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.neonGreen,
              borderWidth: 2,
              borderColor: theme.colors.surface,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: theme.spacing.m }}>
        <Text
          style={{
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: hasUnread ? "700" : "600",
            marginBottom: theme.spacing.xs,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSizes.s,
            color: hasUnread ? theme.colors.text : theme.colors.textSecondary,
            fontWeight: hasUnread ? "600" : "400",
          }}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: theme.fontSizes.xs,
            color: hasUnread ? theme.colors.text : theme.colors.textSecondary,
            fontWeight: hasUnread ? "600" : "400",
            marginBottom: theme.spacing.xs,
          }}
        >
          {getRelativeTime(item.timestamp)}
        </Text>
        {hasUnread ? (
          <View
            style={{
              minWidth: 18,
              height: 18,
              paddingHorizontal: (item.unreadCount ?? 0) > 9 ? 5 : 0,
              borderRadius: 9,
              backgroundColor: theme.colors.error,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {(item.unreadCount ?? 0) > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        ) : item.isOnline ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.neonGreen,
            }}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
