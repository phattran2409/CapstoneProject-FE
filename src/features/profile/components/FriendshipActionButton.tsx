import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FriendshipStatus } from "@/features/friends/types/friends.types";
import { useAlert } from "@/shared/hooks/useAlert";
import { Alert } from "@/shared/components";

interface FriendshipActionButtonProps {
  status: FriendshipStatus;
  onAddFriend: () => void;
  onRemoveFriend: () => void;
  onAcceptRequest?: () => void;
  onCancelRequest?: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const FriendshipActionButton: React.FC<FriendshipActionButtonProps> = ({
  status,
  onAddFriend,
  onRemoveFriend,
  onAcceptRequest,
  onCancelRequest,
  isLoading = false,
  style,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { visible, alertOptions, showDanger, hideAlert } = useAlert();

  const handleRemoveFriendWithConfirm = () => {
    showDanger(
      "Xóa bạn bè",
      "Bạn có chắc chắn muốn xóa người này khỏi danh sách bạn bè? Hành động này không thể hoàn tác!",
      () => {
        onRemoveFriend();
      },
      () => {
        console.log("Cancelled remove friend");
      },
      "Xóa bạn",
      "Hủy",
    );
  };

  const getButtonConfig = () => {
    switch (status) {
      case "None":
        return {
          icon: "person-add" as const,
          text: t("personalPage.addFriend"),
          onPress: onAddFriend,
          backgroundColor: theme.colors.neonGreen,
          disabled: false,
          opacity: 1,
        };

      case "PendingSentByMe":
        return {
          icon: "hourglass" as const,
          text: "Đã gửi lời mời",
          onPress: onCancelRequest,
          backgroundColor: theme.colors.textSecondary,
          disabled: true,
          opacity: 0.6,
        };

      case "PendingReceivedFromThem":
        return {
          icon: "checkmark-circle" as const,
          text: "Chấp nhận kết bạn",
          onPress: onAcceptRequest || (() => {}),
          backgroundColor: theme.colors.neonGreen,
          disabled: false,
          opacity: 1,
        };

      case "Friends":
        return {
          icon: "person-remove" as const,
          text: "Hủy kết bạn",
          onPress: handleRemoveFriendWithConfirm,
          backgroundColor: theme.colors.error || "#FF4444",
          disabled: false,
          opacity: 1,
        };

      default:
        return {
          icon: "person-add" as const,
          text: t("personalPage.addFriend"),
          onPress: onAddFriend,
          backgroundColor: theme.colors.neonGreen,
          disabled: false,
          opacity: 1,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <TouchableOpacity
        onPress={buttonConfig.onPress}
        disabled={buttonConfig.disabled || isLoading}
        style={[
          styles.button,
          {
            backgroundColor: buttonConfig.backgroundColor,
            borderRadius: theme.radius.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.xl,
            opacity: isLoading ? 0.6 : buttonConfig.opacity,
          },
          style,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.s,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Ionicons
              name={buttonConfig.icon}
              size={18}
              color={theme.colors.background}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: theme.fontSizes.m,
                color: theme.colors.background,
              },
            ]}
          >
            {isLoading ? "Đang xử lý..." : buttonConfig.text}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Alert Component */}
      {alertOptions && (
        <Alert visible={visible} {...alertOptions} onClose={hideAlert} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontWeight: "600",
  },
});
