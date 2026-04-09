import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedView, ThemedText } from "./themed";
import { PostMediaGrid } from "./PostMediaGrid";
import { PostActions } from "./PostActions";
import { Post } from "@/features/post/types/post.types";
import { useAuthStore } from "@/features/auth";
import { getRelativeTime } from "@/shared/utils";
import auth from "../firebase";
import ActionButton from "./ActionButton";
import { useDeletePost, useUpdatePost } from "@/features/post/hooks";
import { InviteFriendsModal } from "@/features/rooms/components/InviteFriendsModal";

export interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onMenuPress?: (postId: string) => void;
  onPress?: (postId: string) => void;
  onAvatarPress?: (userId: string) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onMenuPress,
  onPress,
  onAvatarPress,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const isOwnPost = post.userId === user?.userId;

  const timestamp = getRelativeTime(post.createdAt);

  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();

  const [shareVisible, setShareVisible] = useState(false);

  const handleEditPost = async (postId: string, newContent: string) => {
    await updatePost({ postId, content: newContent });
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const handleReportPost = async (
    postId: string,
    reason: string,
    customReason?: string,
  ) => {
    // TODO: Implement report API
    console.log("Report post:", postId, reason, customReason);
  };

  const shareUrl = `kickify://post/${post.postId}`;
  const previewContent = post.content.length > 80
    ? `${post.content.slice(0, 80)}...`
    : post.content;
  const shareMessage = `${post.userFullName} vừa chia sẻ một bài viết:\n\n"${previewContent}"\n\n${shareUrl}`;

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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onAvatarPress?.(post.userId)}
          >
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
                <Image
                  source={require("../../assets/images/default_avatar.png")}
                  style={styles.postAvatar}
                />
              </View>
            )}
          </TouchableOpacity>
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

        <ActionButton
          contentType="post"
          contentId={post.postId}
          currentContent={post.content}
          onEdit={isOwnPost ? handleEditPost : undefined}
          onDelete={isOwnPost ? handleDeletePost : undefined}
          onReport={!isOwnPost ? handleReportPost : undefined}
        />
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
      <View style={{ paddingHorizontal: theme.spacing.l }}>
        <PostActions
          isLiked={post.isLikedByCurrentUser}
          likeCount={post.totalLikes}
          commentCount={post.totalComments}
          shareCount={0}
          onLike={() => onLike?.(post.postId)}
          onComment={() => {
            onComment?.(post.postId);
            onPress?.(post.postId);
          }}
          onShare={() => {
            if (onShare) {
              onShare(post.postId);
            } else {
              setShareVisible(true);
            }
          }}
        />
      </View>

      <InviteFriendsModal
        visible={shareVisible}
        roomId={post.postId}
        shareMessage={shareMessage}
        onClose={() => setShareVisible(false)}
        title="Chia sẻ bài viết"
      />
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
