import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";

export interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onPress: () => void;
  size?: number;
  showCount?: boolean;
  testID?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onPress,
  size = 22,
  showCount = true,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID={testID}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isLiked ? "heart" : "heart-outline"}
        size={size}
        color={isLiked ? "#ef4444" : theme.colors.textSecondary}
      />
      {showCount && (
        <Text
          style={[
            styles.count,
            {
              color: isLiked ? "#ef4444" : theme.colors.textSecondary,
              fontWeight: isLiked ? "600" : "400",
            },
          ]}
        >
          {likeCount > 0 ? likeCount : ""}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  count: {
    fontSize: 14,
  },
});
