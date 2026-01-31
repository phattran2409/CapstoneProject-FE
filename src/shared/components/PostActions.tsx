import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { LikeButton } from "./LikeButton";

export interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  showShare?: boolean;
  testID?: string;
}

export const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  likeCount,
  commentCount,
  shareCount = 0,
  onLike,
  onComment,
  onShare,
  showShare = true,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      {/* Like Button */}
      <LikeButton
        isLiked={isLiked}
        likeCount={likeCount}
        onPress={onLike}
        testID={testID ? `${testID}-like` : undefined}
      />

      {/* Comment Button */}
      <TouchableOpacity
        style={styles.action}
        onPress={onComment}
        testID={testID ? `${testID}-comment` : undefined}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chatbubble-outline"
          size={22}
          color={theme.colors.textSecondary}
        />
        <Text
          style={[styles.actionText, { color: theme.colors.textSecondary }]}
        >
          {commentCount > 0 ? commentCount : ""}
        </Text>
      </TouchableOpacity>

      {/* Share Button */}
      {showShare && (
        <TouchableOpacity
          style={styles.action}
          onPress={onShare}
          testID={testID ? `${testID}-share` : undefined}
          activeOpacity={0.7}
        >
          <Ionicons
            name="share-social-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.actionText, { color: theme.colors.textSecondary }]}
          >
            {shareCount > 0 ? shareCount : ""}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
  },
});
