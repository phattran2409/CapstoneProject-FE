import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";

export interface ChatItemData {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  avatar?: any;
}

interface ChatItemProps {
  item: ChatItemData;
  onPress: (chatId: string, chatName: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ item, onPress }) => {
  const { theme } = useTheme();

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
            fontWeight: "600",
            marginBottom: theme.spacing.xs,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSizes.s,
            color: theme.colors.textSecondary,
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
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
          }}
        >
          {item.timestamp}
        </Text>
        {item.isOnline && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.neonGreen,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
