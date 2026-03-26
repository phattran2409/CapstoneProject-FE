import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ThemedView, ThemedText, ThemedIcon } from "@/shared/components/themed";
import { useTheme } from "@/shared/theme";
import { openMapsSearch } from "@/shared/utils/maps";
import type { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type TextSize = "xs" | "s" | "m" | "l" | "xl";
type TextWeight = "regular" | "medium" | "semiBold" | "bold";

interface RoomInfoCardProps {
  icon: IconName;
  label: string;
  value: React.ReactNode;
  valueSize?: TextSize;
  valueWeight?: TextWeight;
  subValue?: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: ViewStyle;
  mapLink?: boolean;
  /** Tọa độ venue — khi BE trả về trên MatchRoomVenue */
  mapLatitude?: number;
  mapLongitude?: number;
}

export const RoomInfoCard: React.FC<RoomInfoCardProps> = ({
  icon,
  label,
  value,
  valueSize = "l",
  valueWeight = "semiBold",
  subValue,
  subtitle,
  style,
  mapLink = false,
  mapLatitude,
  mapLongitude,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const openMaps = useCallback(() => {
    const placeName = typeof value === "string" ? value : "";
    const address = typeof subValue === "string" ? subValue : "";
    openMapsSearch({
      latitude: mapLatitude,
      longitude: mapLongitude,
      placeName,
      address,
    });
  }, [mapLatitude, mapLongitude, value, subValue]);

  return (
    <ThemedView
      style={[
        styles.infoCard,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
    >
      <View
        style={[
          styles.infoIconContainer,
          { backgroundColor: theme.colors.neonGreen + "20" },
        ]}
      >
        <ThemedIcon name={icon} size={24} variant="accent" />
      </View>
      <View style={styles.infoContent}>
        <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
          {label}
        </ThemedText>
        <ThemedText variant="primary" size={valueSize} weight={valueWeight}>
          {value}
        </ThemedText>
        {subValue != null && (
          <ThemedText variant="secondary" size="s">
            {subValue}
          </ThemedText>
        )}
        {subtitle != null && (
          <ThemedText variant="secondary" size="xs">
            {subtitle}
          </ThemedText>
        )}
        {mapLink && (
          <TouchableOpacity
            style={[
              styles.mapButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={openMaps}
            activeOpacity={0.8}
          >
            <ThemedIcon
              name="map-outline"
              size={20}
              color={theme.colors.primary}
            />
            <ThemedText
              style={[styles.mapButtonText, { color: theme.colors.primary }]}
            >
              {t("feedback.field.openMap", "Xem vị trí trên bản đồ")}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
