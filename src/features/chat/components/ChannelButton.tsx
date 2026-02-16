import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/shared/components/themed";
import { useTheme } from "@/shared/theme";
import type { RoomChatChannel } from "@/shared/hooks/useMatchRoomSignalR";

interface ChannelButtonProps {
  channel: RoomChatChannel;
  currentChannel: RoomChatChannel;
  label: string;
  onPress: (channel: RoomChatChannel) => void;
}

export const ChannelButton: React.FC<ChannelButtonProps> = ({
  channel,
  currentChannel,
  label,
  onPress,
}) => {
  const { theme } = useTheme();
  const isActive = currentChannel === channel;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isActive
            ? theme.colors.neonGreen + "20"
            : "transparent",
        },
      ]}
      onPress={() => onPress(channel)}
    >
      <ThemedText
        size="xs"
        weight={isActive ? "bold" : "medium"}
        style={{
          color: isActive ? theme.colors.neonGreen : theme.colors.textSecondary,
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
