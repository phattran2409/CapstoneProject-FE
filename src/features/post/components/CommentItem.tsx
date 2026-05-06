import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Image,
} from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedView, ThemedText } from "@/shared/components/themed";
import { Comment } from "../types/post.types";
import { ActionButton, LikeButton, PremiumBadge } from "@/shared/components";
import { RepliesList } from "./RepliesList";
import { useCreateComment } from "../hooks";

interface CommentItemProps {
  postId: string;
  comment: Comment;
  onLike: (commentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void | Promise<void>;
  onDelete?: (commentId: string) => void | Promise<void>;
  onReport?: (commentId: string, reason: string, customReason?: string) => void | Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  postId,
  comment,
  onLike,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { mutateAsync: createComment, isPending: isSubmittingReply } =
    useCreateComment();

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      await createComment({
        postId,
        content: replyContent.trim(),
        parentCommentId: comment.commentId,
      });
      setReplyContent("");
      setShowReplyInput(false);
      setShowReplies(true); // Automatically show replies after replying
      Keyboard.dismiss();
    } catch (error) {
      console.error("Failed to post reply", error);
    }
  };

  return (
    <ThemedView
      style={[
        styles.commentContainer,
        {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.m,
        },
      ]}
    >
      {/* Comment Header */}
      <View style={styles.commentHeader}>
        <View
          style={[
            styles.avatarContainer,
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.surface,
              marginRight: theme.spacing.m,
            },
          ]}
        >
          {comment.userAvatarUrl ? (
            <Image
              source={{ uri: comment.userAvatarUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../assets/images/default_avatar.png")}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          )}
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentAuthorRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <ThemedText variant="primary" size="m" weight="semiBold">
                {comment.userFullName}
              </ThemedText>
              {comment.isPremium && (
                <PremiumBadge
                  style={{ paddingVertical: 2, paddingHorizontal: 6 }}
                  labelFontSize={10}
                />
              )}
            </View>
            <ThemedText variant="secondary" size="s" style={styles.timestamp}>
              {new Date(comment.createdAt).toLocaleDateString()}
              {comment.isEdited &&
                " • " + t("post.edited", { defaultValue: "Đã chỉnh sửa" })}
            </ThemedText>
          </View>
          <ThemedText variant="primary" size="m" style={styles.commentText}>
            {comment.content}
          </ThemedText>
          {/* Comment Actions */}
          <View style={styles.commentActions}>
            <LikeButton
              isLiked={comment.isLikedByCurrentUser ?? false}
              likeCount={comment.totalLikes}
              onPress={() => onLike(comment.commentId)}
              size={18}
              showCount={true}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowReplyInput(!showReplyInput)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                variant="secondary"
                size="s"
                style={styles.actionText}
              >
                {t("post.reply", { defaultValue: "Phản hồi" })}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* View Replies Button */}
          {comment.totalReplies > 0 && (
            <TouchableOpacity
              style={styles.viewRepliesButton}
              onPress={() => setShowReplies(!showReplies)}
            >
              <View
                style={{ width: 24, paddingVertical: 8, alignItems: "center" }}
              >
                <View
                  style={{
                    height: 1,
                    width: 24,
                    backgroundColor: theme.colors.border,
                  }}
                />
              </View>
              <ThemedText variant="secondary" size="s">
                {showReplies
                  ? t("post.hideReplies", { defaultValue: "Ẩn câu trả lời" })
                  : t("post.viewReplies", { defaultValue: "Xem" }) +
                    ` ${comment.totalReplies} ` +
                    t("post.replies", { defaultValue: "câu trả lời" })}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Inline Reply Input */}
          {showReplyInput && (
            <View style={styles.replyInputContainer}>
              <TextInput
                style={[
                  styles.replyInput,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder={t("post.writeReply", {
                  defaultValue: "Viết trả lời...",
                })}
                placeholderTextColor={theme.colors.textSecondary}
                value={replyContent}
                onChangeText={setReplyContent}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.sendReplyButton,
                  {
                    backgroundColor: replyContent.trim()
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={handleReplySubmit}
                disabled={!replyContent.trim() || isSubmittingReply}
              >
                <Ionicons
                  name="send"
                  size={16}
                  color={
                    replyContent.trim() ? theme.colors.darkBlack : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Replies List */}
          {showReplies && (
            <RepliesList commentId={comment.commentId} postId={postId} />
          )}
        </View>

        {/* Action Button for edit/delete/report */}
        {(onEdit || onDelete || onReport) && (
          <ActionButton
            contentType="comment"
            contentId={comment.commentId}
            currentContent={comment.content}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
          />
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    paddingHorizontal: 16,
  },
  commentHeader: {
    flexDirection: "row",
  },
  avatarContainer: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  commentContent: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  timestamp: {
    marginLeft: 4,
  },
  commentText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
  },
  replyInputContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  replyInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  sendReplyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  viewRepliesButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
