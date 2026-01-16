import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ThemedSafeAreaView,
  ThemedScrollView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import { useScrollToHideTabBar } from "@/shared/hooks/useScrollToHideTabBar";
import { RootStackParamList } from "@/app/navigation/types";
import {
  usePostDetail,
  usePostComments,
  useTogglePostLike,
  useCreateComment,
  useCreateReply,
  useToggleCommentLike,
  useToggleReplyLike,
} from "../hooks";
import { CommentItem, PostDetailImages } from "../components";
import { Comment } from "../types/post.types";
import { PostDetailSkeleton } from "@/shared/components";

type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PostDetail"
>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, "PostDetail">;

interface PostDetailScreenProps {
  navigation: PostDetailScreenNavigationProp;
  route: PostDetailScreenRouteProp;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const { postId } = route.params;

  const { data: post, isLoading: postLoading } = usePostDetail(postId);
  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch,
  } = usePostComments(postId);
  const { mutate: toggleLike } = useTogglePostLike();
  const { mutate: createComment } = useCreateComment();
  const { mutate: createReply } = useCreateReply(postId);
  const { mutate: toggleCommentLike } = useToggleCommentLike();
  const { mutate: toggleReplyLike } = useToggleReplyLike();

  const [commentContent, setCommentContent] = useState("");

  const handleSubmitComment = () => {
    if (commentContent.trim()) {
      createComment(
        { postId, content: commentContent.trim() },
        {
          onSuccess: () => {
            setCommentContent("");
            Keyboard.dismiss();
            refetch();
          },
        },
      );
    }
  };

  const handleReply = (commentId: string, content: string) => {
    createReply(
      { commentId, content },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  if (postLoading || !post) {
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
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold" variant="primary">
            {t("post.detail", { defaultValue: "Bài viết" })}
          </ThemedText>
          <View style={{ width: 24 }} />
        </ThemedView>

        {/* Skeleton Loading */}
        <PostDetailSkeleton />
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <ThemedView
          style={[
            styles.header,
            {
              paddingHorizontal: theme.spacing.l,
              paddingVertical: theme.spacing.m,
              marginTop: theme.spacing.xl,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold" variant="primary">
            {t("post.detail", { defaultValue: "Bài viết" })}
          </ThemedText>
          <View style={{ width: 24 }} />
        </ThemedView>

        {/* Post Content */}
        <ThemedScrollView
          style={styles.scrollView}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Post Header */}
          <View
            style={[
              styles.postHeader,
              {
                paddingHorizontal: theme.spacing.l,
                paddingVertical: theme.spacing.m,
              },
            ]}
          >
            <View style={styles.postAuthor}>
              {post.author.avatar ? (
                typeof post.author.avatar === "string" ? (
                  <View
                    style={[
                      styles.postAvatar,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                ) : (
                  <Image
                    source={post.author.avatar}
                    style={styles.postAvatar}
                    resizeMode="cover"
                  />
                )
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
                  {post.author.name}
                  {post.community && (
                    <ThemedText variant="secondary" size="m" weight="regular">
                      {" "}
                      posted in '{post.community}'
                    </ThemedText>
                  )}
                </ThemedText>
                <ThemedText variant="secondary" size="s">
                  {post.timestamp}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Post Type Badge */}
          {post.type && post.type !== "post" && (
            <View
              style={{ paddingHorizontal: theme.spacing.l, marginBottom: 8 }}
            >
              <View
                style={[
                  styles.postTypeBadge,
                  {
                    backgroundColor:
                      post.type === "match"
                        ? theme.colors.neonGreen
                        : "#3b82f6",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                  },
                ]}
              >
                <ThemedText
                  size="xs"
                  weight="bold"
                  style={{
                    color: isDark ? theme.colors.darkBlack : theme.colors.white,
                  }}
                >
                  {post.type === "match"
                    ? t("newsFeed.matches", { defaultValue: "Trận đấu" })
                    : t("newsFeed.announcements", {
                        defaultValue: "Thông báo",
                      })}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Post Title and Content */}
          <View
            style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}
          >
            <ThemedText
              variant="primary"
              size="l"
              weight="bold"
              style={styles.postTitle}
            >
              {post.title}
            </ThemedText>
            <ThemedText variant="secondary" size="m" style={styles.postContent}>
              {post.content}
            </ThemedText>
          </View>

          {/* Post Media (Images/Videos) - Individual display */}
          {((post.media && post.media.length > 0) ||
            (post.images && post.images.length > 0)) && (
            <View
              style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}
            >
              <PostDetailImages media={post.media} images={post.images} />
            </View>
          )}

          {/* Post Actions */}
          <View
            style={[
              styles.postActions,
              {
                paddingHorizontal: theme.spacing.l,
                paddingVertical: theme.spacing.m,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.postAction}
              onPress={() => toggleLike(post.id)}
            >
              <Ionicons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={22}
                color={post.isLiked ? "#ef4444" : theme.colors.textSecondary}
              />
              <ThemedText
                variant="secondary"
                size="m"
                style={[
                  styles.postActionText,
                  {
                    color: post.isLiked
                      ? "#ef4444"
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {post.likes}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.postAction}>
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                variant="secondary"
                size="m"
                style={styles.postActionText}
              >
                {comments.length}
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.postAction}>
              <Ionicons
                name="share-social-outline"
                size={22}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                variant="secondary"
                size="m"
                style={styles.postActionText}
              >
                {post.shares}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <ThemedText
              variant="primary"
              size="l"
              weight="bold"
              style={{
                paddingHorizontal: theme.spacing.l,
                paddingVertical: theme.spacing.m,
              }}
            >
              {t("post.comments", { defaultValue: "Bình luận" })} (
              {comments.length})
            </ThemedText>
            {commentsLoading ? (
              <ThemedView style={styles.loadingContainer}>
                <ThemedText>
                  {t("common.loading", { defaultValue: "Đang tải..." })}
                </ThemedText>
              </ThemedView>
            ) : comments.length === 0 ? (
              <ThemedView style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubble-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <ThemedText
                  variant="secondary"
                  size="m"
                  style={{ marginTop: 8 }}
                >
                  {t("post.noComments", {
                    defaultValue: "Chưa có bình luận nào",
                  })}
                </ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CommentItem
                    comment={item}
                    onLike={toggleCommentLike}
                    onReply={handleReply}
                    onReplyLike={(commentId, replyId) =>
                      toggleReplyLike({ commentId, replyId })
                    }
                  />
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
              />
            )}
          </View>
        </ThemedScrollView>

        {/* Comment Input */}
        <ThemedView
          style={[
            styles.commentInputContainer,
            {
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.background,
              paddingHorizontal: theme.spacing.l,
              paddingVertical: theme.spacing.s,
            },
          ]}
        >
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.l,
                paddingHorizontal: theme.spacing.m,
                paddingVertical: theme.spacing.s,
              },
            ]}
            placeholder={t("post.writeComment", {
              defaultValue: "Viết bình luận...",
            })}
            placeholderTextColor={theme.colors.textSecondary}
            value={commentContent}
            onChangeText={setCommentContent}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: commentContent.trim()
                  ? theme.colors.neonGreen
                  : theme.colors.border,
              },
            ]}
            onPress={handleSubmitComment}
            disabled={!commentContent.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={
                commentContent.trim()
                  ? theme.colors.darkBlack
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
  postTypeBadge: {
    alignSelf: "flex-start",
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
    fontSize: 16,
  },
  commentsSection: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostDetailScreen;
