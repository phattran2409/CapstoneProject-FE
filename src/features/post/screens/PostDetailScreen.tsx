import React, { useState, useCallback } from "react";
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
  RefreshControl,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
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
  usePaginatedComments,
  useTogglePostLike,
  useCreateComment,
  useUpdatePost,
  useDeletePost,
  useUpdateComment,
  useDeleteComment,
  useToggleCommentLike,
  useReportContent,
} from "../hooks";
import { CommentItem, PostDetailImages } from "../components";
import { PostMedia, MediaItem, Comment } from "../types/post.types";
import {
  PostDetailSkeleton,
  ActionButton,
  PostActions,
  PremiumBadge,
} from "@/shared/components";
import { useAuthStore } from "@/features/auth";
import { useToast } from "@/shared/toast";
import { getTranslatedError } from "@/shared/utils/errorTranslations";
import { postKeys } from "../api";

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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const { data: post, isLoading: postLoading } = usePostDetail(postId);
  const {
    comments,
    loading: commentsLoading,
    loadMore,
    hasMore,
  } = usePaginatedComments({
    postId,
    pageSize: 20,
  });

  const { mutate: toggleLike } = useTogglePostLike();
  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();
  const { mutateAsync: updateComment } = useUpdateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();
  const { mutate: toggleCommentLike } = useToggleCommentLike();
  const { mutateAsync: reportContent, isPending: isReportingComment } = useReportContent();
  const toast = useToast();
  const [commentContent, setCommentContent] = useState("");

  // Transform PostMedia[] to MediaItem[] for display
  const transformMediaToMediaItems = (media: PostMedia[]): MediaItem[] => {
    return media
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((m) => {
        if (m.mediaType === 0) {
          // Image
          return {
            type: "image" as const,
            source: { uri: m.publicUrl },
          };
        } else {
          // Video
          return {
            type: "video" as const,
            source: m.publicUrl,
            thumbnail: { uri: m.publicUrl },
          };
        }
      });
  };

  const handleSubmitComment = async () => {
    if (commentContent.trim()) {
      try {
        await createComment({
          postId,
          content: commentContent.trim(),
        });
        setCommentContent("");
        Keyboard.dismiss();
      } catch (error: any) {
        console.error("Error creating comment:", error);
        toast.error(
          getTranslatedError(error?.message) ||
          t("post.create.errorMessage", {
            defaultValue: "Không thể tạo bài viết. Vui lòng thử lại.",
          }),
        );
      }
    }
  };

  const handleEditPost = async (postId: string, newContent: string) => {
    await updatePost({ postId, content: newContent });
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    navigation.goBack();
  };

  const handleReportPost = async (
    postId: string,
    reason: string,
    customReason?: string,
  ) => {
    // TODO: Implement report API
    console.log("Report post:", postId, reason, customReason);
  };

  const handleReportComment = async (
    commentId: string,
    reason: string,
    customReason?: string,
  ) => {
    await reportContent({
      contentId: commentId,
      contentType: "comment",
      reason,
      description: customReason ?? reason,
    });
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    await updateComment({ commentId, content: newContent, postId });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment({ commentId, postId });
  };

  const handleLoadMoreComments = () => {
    if (hasMore && !commentsLoading) {
      loadMore();
    }
  };

  const handleRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: postKeys.detail(postId) }),
        queryClient.refetchQueries({
          queryKey: postKeys.comments(postId),
          exact: false,
        }),
      ]);
    } finally {
      setPullRefreshing(false);
    }
  }, [queryClient, postId]);

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

  const isOwnPost = post.userId === user?.userId;

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
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
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
              {post.userAvatarUrl ? (
                <Image
                  source={{ uri: post.userAvatarUrl }}
                  style={styles.postAvatar}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require("../../../assets/images/default_avatar.png")}
                  style={styles.postAvatar}
                  resizeMode="cover"
                />
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <ThemedText variant="primary" size="m" weight="bold">
                    {post.userFullName}
                  </ThemedText>
                  {post.isPremium && (
                    <PremiumBadge
                      style={{ paddingVertical: 2, paddingHorizontal: 6 }}
                      labelFontSize={10}
                    />
                  )}
                </View>
                <ThemedText variant="secondary" size="s">
                  {new Date(post.createdAt).toLocaleDateString()}
                  {post.isEdited &&
                    " • " + t("post.edited", { defaultValue: "Đã chỉnh sửa" })}
                </ThemedText>
              </View>
            </View>

            {/* Action Button always visible */}
            <ActionButton
              contentType="post"
              contentId={post.postId}
              currentContent={post.content}
              onEdit={isOwnPost ? handleEditPost : undefined}
              onDelete={isOwnPost ? handleDeletePost : undefined}
              onReport={!isOwnPost ? handleReportPost : undefined}
            />
          </View>

          {/* Post Title and Content */}
          <View
            style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}
          >
            <ThemedText variant="secondary" size="m" style={styles.postContent}>
              {post.content}
            </ThemedText>
          </View>

          {/* Post Media (Images/Videos) - Individual display */}
          {post.media && post.media.length > 0 && (
            <View
              style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}
            >
              <PostDetailImages
                media={transformMediaToMediaItems(post.media)}
              />
            </View>
          )}

          {/* Post Actions */}
          <View
            style={{
              paddingHorizontal: theme.spacing.l,
              paddingVertical: theme.spacing.m,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <PostActions
              isLiked={post.isLikedByCurrentUser}
              likeCount={post.totalLikes}
              commentCount={post.totalComments}
              shareCount={0}
              onLike={() => toggleLike(post.postId)}
              onComment={() => {}}
              onShare={() => {}}
            />
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
            {commentsLoading && comments.length === 0 ? (
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
                keyExtractor={(item) => item.commentId}
                renderItem={({ item }) => {
                  const isOwnComment = item.userId === user?.userId;
                  return (
                    <CommentItem
                      postId={postId}
                      comment={item}
                      onLike={() =>
                        toggleCommentLike({ commentId: item.commentId, postId })
                      }
                      onEdit={isOwnComment ? handleEditComment : undefined}
                      onDelete={isOwnComment ? handleDeleteComment : undefined}
                      onReport={!isOwnComment ? handleReportComment : undefined}
                    />
                  );
                }}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                onEndReached={handleLoadMoreComments}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  commentsLoading && comments.length > 0 ? (
                    <ThemedView style={styles.loadingMoreContainer}>
                      <ThemedText variant="secondary" size="s">
                        {t("common.loadingMore", {
                          defaultValue: "Đang tải thêm...",
                        })}
                      </ThemedText>
                    </ThemedView>
                  ) : null
                }
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
          <View style={{ flex: 1 }}>
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
              maxLength={5000}
            />
          </View>
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
  loadingMoreContainer: {
    padding: 16,
    alignItems: "center",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  replyingToContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 8,
  },
});

export default PostDetailScreen;
