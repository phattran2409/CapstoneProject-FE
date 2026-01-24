import React from "react";
import { View, Text, FlatList, ListRenderItem } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: any;
}

interface MessageListProps {
  messages: Message[];
  inverted?: boolean;
  contentContainerStyle?: any;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  inverted = false,
  contentContainerStyle,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        marginBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        justifyContent: item.isOwn ? "flex-end" : "flex-start",
      }}
    >
      {!item.isOwn && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.border,
            justifyContent: "center",
            alignItems: "center",
            marginRight: theme.spacing.xs,
          }}
        >
          <Ionicons name="person" size={20} color={theme.colors.text} />
        </View>
      )}
      <View style={{ flex: item.isOwn ? 0 : 1, maxWidth: "75%" }}>
        {!item.isOwn && (
          <Text
            style={{
              fontSize: theme.fontSizes.xs,
              color: item.isOwn ? theme.colors.neonGreen : theme.colors.text,
              marginBottom: theme.spacing.xs,
              marginLeft: theme.spacing.xs,
            }}
          >
            {item.senderName}
          </Text>
        )}
        <View
          style={{
            backgroundColor: item.isOwn
              ? theme.colors.neonGreen
              : theme.colors.surface,
            borderRadius: theme.radius.m,
            padding: theme.spacing.s,
            alignSelf: item.isOwn ? "flex-end" : "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: item.isOwn ? theme.colors.black : theme.colors.text,
            }}
          >
            {item.text}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: theme.spacing.xs,
            alignSelf: item.isOwn ? "flex-end" : "flex-start",
          }}
        >
          {item.isOwn && (
            <>
              <Text
                style={{
                  fontSize: theme.fontSizes.xs,
                  color: theme.colors.textSecondary,
                  marginRight: theme.spacing.xs,
                }}
              >
                {t("chat.sent")}
              </Text>
              <Ionicons
                name="checkmark-done"
                size={12}
                color={theme.colors.neonGreen}
              />
              <Ionicons
                name="checkmark-done"
                size={12}
                color={theme.colors.neonGreen}
                style={{ marginLeft: -4 }}
              />
            </>
          )}
          <Text
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textSecondary,
              marginLeft: item.isOwn ? theme.spacing.xs : 0,
            }}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={
        contentContainerStyle || { paddingVertical: theme.spacing.m }
      }
      inverted={inverted}
    />
  );
};
