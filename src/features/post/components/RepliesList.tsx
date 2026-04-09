import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { ThemedText, ThemedView } from "@/shared/components/themed";
import { ReplyItem } from "./ReplyItem";
import { usePaginatedReplies } from "../hooks";
import { useToggleCommentLike } from "../hooks";

interface RepliesListProps {
  commentId: string;
  postId: string;
}

export const RepliesList: React.FC<RepliesListProps> = ({
  commentId,
  postId,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { replies, loading, hasMore, loadMore } = usePaginatedReplies({
    commentId,
    pageSize: 5,
  });

  const { mutate: toggleLike } = useToggleCommentLike();

  if (loading && replies.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText variant="secondary" size="s">
          {t("common.loading", { defaultValue: "Đang tải..." })}
        </ThemedText>
      </View>
    );
  }

  if (replies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {replies.map((reply) => (
        <ReplyItem
          key={reply.commentId}
          reply={reply}
          onLike={() =>
            toggleLike({
              commentId: reply.commentId,
              postId,
              parentCommentId: commentId,
            })
          }
        />
      ))}

      {hasMore && (
        <ThemedText
          variant="secondary"
          size="s"
          style={styles.loadMoreText}
          onPress={() => loadMore()}
        >
          {t("post.viewMoreReplies", { defaultValue: "Xem thêm câu trả lời" })}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 40, // Indent replies
    marginTop: 8,
  },
  loadingContainer: {
    paddingLeft: 40,
    marginTop: 8,
  },
  loadMoreText: {
    marginTop: 8,
    textDecorationLine: "underline",
  },
});
