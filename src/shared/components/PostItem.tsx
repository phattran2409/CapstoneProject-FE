import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedView, ThemedText } from "./themed";
import { PostMediaGrid } from "./PostMediaGrid";
import { Post } from "@/features/post/types/post.types";

export interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onMenuPress?: (postId: string) => void;
  onPress?: (postId: string) => void; // Navigate to post detail
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onMenuPress,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Calculate relative time from createdAt
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return postDate.toLocaleDateString("vi-VN");
  };

  const timestamp = getRelativeTime(post.createdAt);

  return (
    <ThemedView
      style={[
        styles.postContainer,
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.m,
        },
      ]}
    >
      {/* Post Header */}
      <View
        style={[
          styles.postHeader,
          { paddingHorizontal: theme.spacing.l, marginBottom: 12 },
        ]}
      >
        <View style={styles.postAuthor}>
          {post.userAvatarUrl ? (
            <Image
              source={{ uri: post.userAvatarUrl }}
              style={styles.postAvatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.postAvatar,
                {
                  backgroundColor: theme.colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Ionicons
                name="person"
                size={24}
                color={theme.colors.textSecondary}
              />
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <ThemedText variant="primary" size="m" weight="bold">
              {post.userFullName}
            </ThemedText>
            <Text
              style={[
                styles.postTimestamp,
                { color: theme.colors.textSecondary },
              ]}
            >
              {timestamp}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.postMenuButton}
          onPress={() => onMenuPress?.(post.postId)}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(post.postId)}
        style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}
      >
        <ThemedText variant="secondary" size="m" style={styles.postContent}>
          {post.content}
        </ThemedText>
      </TouchableOpacity>

      {/* Post Media (Images/Videos) */}
      {post.media && post.media.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <PostMediaGrid
            media={post.media}
            onMediaPress={() => onPress?.(post.postId)}
          />
        </View>
      )}

      {/* Post Actions */}
      <View
        style={[styles.postActions, { paddingHorizontal: theme.spacing.l }]}
      >
        <TouchableOpacity
          style={styles.postAction}
          onPress={() => onLike?.(post.postId)}
        >
          <Ionicons
            name={/* post.isLiked */ false ? "heart" : "heart-outline"}
            size={22}
            color={
              /* post.isLiked */ false ? "#ef4444" : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.postActionText,
              {
                color: /* post.isLiked */ false
                  ? "#ef4444"
                  : theme.colors.textSecondary,
                fontWeight: /* post.isLiked */ false ? "600" : "400",
              },
            ]}
          >
            {post.totalLikes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => {
            onComment?.(post.postId);
            onPress?.(post.postId);
          }}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.postActionText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {post.totalComments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => onShare?.(post.postId)}
        >
          <Ionicons
            name="share-social-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.postActionText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {/* post.shares */ 0}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    // Styles applied via inline
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postAuthor: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  postTimestamp: {
    fontSize: 14,
  },
  postMenuButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  postTypeBadge: {
    alignSelf: "flex-start",
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  postTitle: {
    marginBottom: 8,
  },
  postContent: {
    lineHeight: 24,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postActionText: {
    fontSize: 14,
  },
});

export default PostItem;
