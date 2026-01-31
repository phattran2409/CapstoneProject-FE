import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { ThemedText } from "@/shared/components/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SearchResultItem as SearchResultItemType } from "../types/search.types";

interface SearchResultItemProps {
  item: SearchResultItemType;
  onPress: (item: SearchResultItemType) => void;
}

const DEFAULT_AVATAR = require("../../../assets/images/default_avatar.png");

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  onPress,
}) => {
  const { theme } = useTheme();

  const getTypeBadge = () => {
    switch (item.type) {
      case "players":
        return { label: "Người chơi", color: theme.colors.primary };
      case "posts":
        return { label: "Bài viết", color: theme.colors.success };
      default:
        return null;
    }
  };

  const badge = getTypeBadge();
  const imageSource = item.avatarUrl
    ? { uri: item.avatarUrl }
    : item.image || DEFAULT_AVATAR;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Avatar/Image */}
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: theme.colors.border,
            borderRadius: item.type === "players" ? 28 : 8,
          },
        ]}
      >
        <Image source={imageSource} style={styles.image} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ThemedText size="m" weight="semiBold" numberOfLines={1}>
          {item.title}
        </ThemedText>
        {item.subtitle && (
          <ThemedText
            variant="secondary"
            size="s"
            numberOfLines={2}
            style={{ marginTop: 2 }}
          >
            {item.subtitle}
          </ThemedText>
        )}
      </View>

      {/* Type Badge */}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${badge.color}20`,
              borderColor: badge.color,
            },
          ]}
        >
          <ThemedText
            size="xs"
            weight="semiBold"
            style={{ color: badge.color }}
          >
            {badge.label}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  imageContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});
