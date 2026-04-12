import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import type { MatchRoomStatus } from "@/features/rooms";

export interface MatchRoomStatusIconProps {
  status?: MatchRoomStatus;
  size?: number;
}

export const MatchRoomStatusIcon: React.FC<MatchRoomStatusIconProps> = ({
  status,
  size = 24,
}) => {
  const { theme } = useTheme();

  switch (status) {
    case "Locked":
      return (
        <Ionicons name="lock-closed" size={size} color={theme.colors.textSecondary} />
      );
    case "Closed":
      return (
        <Ionicons name="close-outline" size={size} color={theme.colors.textSecondary} />
      );
    case "Completed":
      return <Ionicons name="trophy" size={size} color={theme.colors.neonGreen} />;
    case "Cancelled":
      return (
        <Ionicons
          name="close-circle-outline"
          size={size}
          color={theme.colors.error}
        />
      );
    case "Reviewing":
      return (
        <Ionicons
          name="git-compare-outline"
          size={size}
          color={theme.colors.textMuted}
        />
      );
    case "InProgress":
      return <Ionicons name="pulse" size={size} color={theme.colors.neonGreen} />;
    case "Open":
    case "Full":
      return (
        <Ionicons name="time-outline" size={size} color={theme.colors.info} />
      );
    default:
      return null;
  }
};

export default MatchRoomStatusIcon;
