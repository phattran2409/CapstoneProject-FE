import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TFunction } from "i18next";


export type SentimentKind = "positive" | "negative" | "neutral";

/** Màu nền badge: xanh / đỏ / vàng cam — tương phản chữ trắng */
const BADGE_COLORS: Record<SentimentKind, string> = {
  positive: "#22C55E",
  negative: "#EF4444",
  neutral: "#F59E0B",
};

function normalizeSentiment(
  label: string | null | undefined,
): SentimentKind {
  const s = (label ?? "").toLowerCase().trim();
  if (s.includes("positive")) return "positive";
  if (s.includes("negative")) return "negative";
  if (s.includes("neutral")) return "neutral";
  return "neutral";
}

interface BadgesSentimentProps {
  t: TFunction;
  sentimentLabel: string | null | undefined;
}

export const BadgesSentiment: React.FC<BadgesSentimentProps> = ({
  t,
  sentimentLabel,
}) => {
  
  const kind = useMemo(
    () => normalizeSentiment(sentimentLabel),
    [sentimentLabel , t],
  );

  const label = t(`sentiment.${kind}`);
  return (
    <View
      style={[styles.badge, { backgroundColor: BADGE_COLORS[kind] }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {kind === "positive" && (
        <Ionicons name="checkmark" size={14} color="#FFFFFF" style={styles.icon} />
      )}
      {kind === "negative" && (
        <Ionicons name="close" size={15} color="#FFFFFF" style={styles.icon} />
      )}
      {kind === "neutral" && (
        <Text style={styles.slashIcon} accessibilityElementsHidden>
          /
        </Text>
      )}
      <Text style={styles.badgeText} numberOfLines={1}>
        {t(`sentiment.${kind}`)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
  },
  icon: {
    marginTop: 0,
  },
  /** Gạch chéo kiểu mẫu tham chiếu (neutral) */
  slashIcon: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 16,
    marginRight: -1,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
