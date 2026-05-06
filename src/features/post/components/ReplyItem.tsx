import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedView, ThemedText } from "@/shared/components/themed";
import { PremiumBadge } from "@/shared/components";
import { Reply } from "../types/post.types";

interface ReplyItemProps {
  reply: Reply;
  onLike: () => void;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onLike }) => {
  const { theme } = useTheme();

  return (
    <ThemedView
      style={[
        styles.replyContainer,
        {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.s,
        },
      ]}
    >
      <View style={styles.replyHeader}>
        <View
          style={[
            styles.avatarContainer,
            {
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.surface,
              marginRight: theme.spacing.s,
            },
          ]}
        >
          {reply.userAvatarUrl ? (
            <Image
              source={{ uri: reply.userAvatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../assets/images/default_avatar.png")}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          )}
        </View>
        <View style={styles.replyContent}>
          <View style={styles.replyAuthorRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <ThemedText variant="primary" size="s" weight="semiBold">
                {reply.userFullName}
              </ThemedText>
              {reply.isPremium && (
                <PremiumBadge
                  style={{ paddingVertical: 2, paddingHorizontal: 6 }}
                  labelFontSize={10}
                />
              )}
            </View>
            <ThemedText variant="secondary" size="xs" style={styles.timestamp}>
              {new Date(reply.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
          <ThemedText variant="primary" size="s" style={styles.replyText}>
            {reply.content}
          </ThemedText>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Ionicons
              name={reply.isLikedByCurrentUser ? "heart" : "heart-outline"}
              size={16}
              color={
                reply.isLikedByCurrentUser
                  ? "#ef4444"
                  : theme.colors.textSecondary
              }
            />
            <ThemedText
              variant="secondary"
              size="xs"
              style={[
                styles.actionText,
                {
                  color: reply.isLikedByCurrentUser
                    ? "#ef4444"
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {reply.totalLikes > 0 ? reply.totalLikes : ""}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  replyContainer: {
    paddingHorizontal: 0,
  },
  replyHeader: {
    flexDirection: "row",
  },
  avatarContainer: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  replyContent: {
    flex: 1,
  },
  replyAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  timestamp: {
    marginLeft: "auto",
  },
  replyText: {
    marginBottom: 4,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  actionText: {
    fontSize: 12,
  },
});
