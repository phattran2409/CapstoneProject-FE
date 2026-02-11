import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

export type RankTier =
  | "Amateur"
  | "SemiPro"
  | "Pro"
  | "Master"
  | "Elite"
  | "Legend";

export interface RankInfo {
  tier: RankTier;
  label: string;
  color: string;
  icon: string;
}

export interface RankBadgeProps {
  elo: number;
  /**
   * Show numeric Elo next to the badge label
   */
  showElo?: boolean;
  /**
   * Compact size is suitable for list items, medium for headers, large for profile cards.
   */
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  textStyle?: TextStyle;
  /**
   * Make background transparent and remove border
   */
  transparent?: boolean;
  /**
   * Show/hide the rank tier label (e.g., "Legend", "Elite")
   */
  showLabel?: boolean;
  /**
   * Custom color for ELO text (especially for large variant when transparent)
   */
  eloColor?: string;
}

export const getRankInfoFromElo = (
  elo: number,
  fallbackColor: string,
): RankInfo => {
  // ... (keep existing implementation)
  if (elo >= 2000) {
    return {
      tier: "Legend",
      label: "Legend",
      color: "#FACC15", // Amber
      icon: "flame",
    };
  }
  // ... (rest of getRankInfoFromElo)
  if (elo >= 1800) {
    return {
      tier: "Elite",
      label: "Elite",
      color: "#F97316", // Orange
      icon: "trophy",
    };
  }

  if (elo >= 1600) {
    return {
      tier: "Master",
      label: "Master",
      color: "#A855F7", // Violet
      icon: "ribbon",
    };
  }

  if (elo >= 1400) {
    return {
      tier: "Pro",
      label: "Pro",
      color: "#22C55E", // Green
      icon: "medal",
    };
  }

  if (elo >= 1200) {
    return {
      tier: "SemiPro",
      label: "Semi-Pro",
      color: "#38BDF8", // Sky
      icon: "star",
    };
  }

  return {
    tier: "Amateur",
    label: "Amateur",
    color: "#9CA3AF", // Gray
    icon: "ellipse",
  };
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  elo,
  showElo = true,
  size = "medium",
  style,
  textStyle,
  transparent = false,
  showLabel = true,
  eloColor,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const rank = getRankInfoFromElo(elo, theme.colors.neonGreen);

  const isLarge = size === "large";
  const containerPaddingVertical = size === "small" ? 4 : isLarge ? 8 : 6;
  const containerPaddingHorizontal = size === "small" ? 8 : isLarge ? 12 : 10;
  // Large icon size 32 * 2 = 64px to match the previous manual implementation
  const iconSize = size === "small" ? 12 : isLarge ? 32 : 16;
  const fontSize = size === "small" ? 11 : isLarge ? 16 : 13;

  const backgroundColor = transparent
    ? "transparent"
    : isDark
      ? `${rank.color}26`
      : `${rank.color}22`;

  const borderColor = transparent ? "transparent" : rank.color;
  const borderWidth = transparent ? 0 : 1; // Or default borderWidth

  const label =
    t(`rank.tiers.${rank.tier}`, {
      defaultValue: rank.label,
    }) || rank.label;

  return (
    <View
      style={[
        styles.container,
        isLarge && styles.containerColumn,
        {
          paddingVertical: transparent ? 0 : containerPaddingVertical,
          paddingHorizontal: transparent ? 0 : containerPaddingHorizontal,
          borderRadius: theme.radius.m,
          backgroundColor,
          borderColor,
          borderWidth: borderWidth,
        },
        style,
      ]}
    >
      <RankIcon tier={rank.tier} color={rank.color} size={iconSize * 2} />
      {showLabel && (
        <Text
          style={[
            styles.text,
            {
              color: rank.color,
              fontSize,
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
          {!isLarge && showElo ? ` · ${elo}` : ""}
        </Text>
      )}
      {isLarge && showElo && (
        <Text
          style={[
            styles.text,
            {
              color: eloColor || rank.color,
              fontSize: 14,
              marginTop: 4,
            },
            textStyle,
          ]}
        >
          {elo} ELO
        </Text>
      )}
    </View>
  );
};

const RankIcon: React.FC<{ tier: RankTier; color: string; size: number }> = ({
  tier,
  color,
  size,
}) => {
  const gradientId = `rankBadgeGradient-${tier}`;

  const letterMap: Record<RankTier, string> = {
    Amateur: "A",
    SemiPro: "S",
    Pro: "P",
    Master: "M",
    Elite: "E",
    Legend: "L",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity={1} />
          <Stop offset="100%" stopColor="#020617" stopOpacity={1} />
        </SvgLinearGradient>
      </Defs>

      {/* Shield body */}
      <Path
        d="M20 2 L33 8 L33 22 L20 38 L7 22 L7 8 Z"
        fill={`url(#${gradientId})`}
        stroke={color}
        strokeWidth={2}
      />

      {/* Inner highlight */}
      <Path
        d="M20 6 L30 10 L30 21 L20 34 L10 21 L10 10 Z"
        fill="rgba(15,23,42,0.6)"
      />

      {/* Tier letter */}
      <SvgText
        x="20"
        y="23"
        fill="#FFFFFF"
        fontSize={14}
        fontWeight="700"
        textAnchor="middle"
      >
        {letterMap[tier]}
      </SvgText>
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  containerColumn: {
    flexDirection: "column",
    gap: 4,
  },
  text: {
    fontWeight: "600",
  },
});

export default RankBadge;
