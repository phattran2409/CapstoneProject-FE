import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FriendshipActionButton } from "./FriendshipActionButton";
import { FriendshipStatus } from "@/features/friends/types/friends.types";
import * as ImagePicker from "expo-image-picker";
import { useAlert } from "@/shared/hooks";
import { useUpdateAvatar } from "../hooks";
import { useToast } from "@/shared/toast";
import { RankBadge } from "@/shared/components";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface ProfileHeaderProps {
  avatar?: string;
  name?: string;
  elo: number;
  description?: string | null;
  position?: string | null;
  shirtNumber?: number | null;
  isCurrentUser?: boolean;
  onEditPress?: () => void;
  // Friendship actions
  friendshipStatus?: FriendshipStatus;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onAcceptRequest?: () => void;
  onCancelRequest?: () => void;
  onAchievementsPress?: () => void;
  isFriendshipLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatar,
  name,
  elo,
  description,
  position,
  shirtNumber,
  isCurrentUser,
  onEditPress,
  friendshipStatus,
  onAddFriend,
  onRemoveFriend,
  onAcceptRequest,
  onCancelRequest,
  onAchievementsPress,
  isFriendshipLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { mutateAsync: updateAvatar } = useUpdateAvatar();

  const handleUploadImage = async (uri: string) => {
    try {
      // Create file object for upload
      const file = {
        uri: uri,
        type: "image/jpeg",
        name: `avatar_${Date.now()}.jpg`,
      };
      // Upload avatar
      await updateAvatar(file);
      toast.success(t("personalPage.editForm.toast.avatarUpdateSuccess"));
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(t("personalPage.editForm.toast.avatarUpdateError"));
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        toast.error(t("profileHeader.cameraPermissionRequired"));
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error(t("profileHeader.takePhotoError"));
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      // Request media library permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.error(t("profileHeader.libraryPermissionRequired"));
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      toast.error(t("profileHeader.pickPhotoError"));
    }
  };

  const handleAvatarUpload = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("profileHeader.cancel"), t("profileHeader.takePhoto"), t("profileHeader.chooseFromLibrary")],
          cancelButtonIndex: 0,
          title: t("profileHeader.chooseAvatarTitle"),
          message: t("profileHeader.chooseAvatarMessage"),
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickFromLibrary();
          }
        },
      );
    } else {
      Alert.alert(
        t("profileHeader.chooseAvatarTitle"),
        t("profileHeader.chooseAvatarMessage"),
        [
          { text: t("profileHeader.takePhoto"), onPress: handleTakePhoto },
          { text: t("profileHeader.chooseFromLibrary"), onPress: handlePickFromLibrary },
          { text: t("profileHeader.cancel"), style: "cancel" },
        ],
        { cancelable: true },
      );
    }
  };

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.l }]}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            borderColor: theme.colors.neonGreen,
            backgroundColor: "#E8D5C4",
            marginBottom: theme.spacing.m,
          },
        ]}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Image
            source={require("../../../assets/images/default_avatar.png")}
            style={styles.avatar}
          />
        )}
        {isCurrentUser && (
          <TouchableOpacity
            onPress={handleAvatarUpload}
            style={[
              styles.changeAvatarButton,
              { backgroundColor: theme.colors.neonGreen },
            ]}
          >
            <Ionicons name="camera" size={16} color={theme.colors.black} />
          </TouchableOpacity>
        )}
      </View>

      {/* Name */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={[
            styles.name,
            {
              fontSize: theme.fontSizes.xxl,
              color: theme.colors.text,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {name}
        </Text>
        {/* Bio */}
        {description && (
          <Text
            style={[
              styles.quote,
              {
                fontSize: theme.fontSizes.m,
                color: theme.colors.textSecondary,
                textAlign: "center",
              },
              { marginBottom: theme.spacing.m },
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      <View style={styles.rankSection}>
        <RankBadge
          elo={elo}
          size="large"
          showElo
          transparent
          showLabel={true}
          eloColor={theme.colors.text}
        />
      </View>

      {/* Edit Button or Friendship Action Button */}
      {isCurrentUser ? (
        <TouchableOpacity
          onPress={onEditPress}
          style={[
            styles.editButton,
            {
              backgroundColor: theme.colors.neonGreen,
              borderRadius: theme.radius.m,
              paddingVertical: theme.spacing.m,
              width: "90%",
              maxWidth: 400,
              alignItems: "center",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.s,
            }}
          >
            <Ionicons name="pencil" size={18} color={theme.colors.black} />
            <Text
              style={[
                styles.editButtonText,
                {
                  fontSize: theme.fontSizes.m,
                  color: theme.colors.background,
                },
              ]}
            >
              {t("personalPage.editProfile")}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        friendshipStatus && (
          <FriendshipActionButton
            status={friendshipStatus}
            onAddFriend={onAddFriend || (() => {})}
            onRemoveFriend={onRemoveFriend || (() => {})}
            onAcceptRequest={onAcceptRequest}
            onCancelRequest={onCancelRequest}
            isLoading={isFriendshipLoading}
            style={{
              width: "90%",
              maxWidth: 400,
              alignSelf: "center",
              alignItems: "center",
            }}
          />
        )
      )}
      <TouchableOpacity
      onPress={onAchievementsPress}
        activeOpacity={0.7}
        style={{ width: "90%", maxWidth: 400, marginTop: theme.spacing.m }}
      >
        <BlurView
          intensity={40}
          tint="dark"
          style={[styles.card, { borderRadius: theme.radius.m, width: "100%" }]}
        >
          <LinearGradient
            colors={[`${theme.colors.neonGreen}20`, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.achievementsContent}>
              <View
                style={[
                  styles.achievementsIcon,
                  { backgroundColor: `${theme.colors.neonGreen}30` },
                ]}
              >
                <Ionicons
                  name="trophy"
                  size={20}
                  color={theme.colors.neonGreen}
                />
              </View>
              <Text
                style={[styles.achievementsTitle, { color: theme.colors.text }]}
              >
                {t("profileHeader.achievementsTitle")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.neonGreen}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  name: {
    fontWeight: "700",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
  },
  elo: {
    fontWeight: "600",
  },
  rank: {
    fontWeight: "600",
  },
  quote: {
    fontStyle: "italic",
  },
  editButton: {
    paddingVertical: 12,
  },
  editButtonText: {
    fontWeight: "600",
  },
  addFriendButton: {
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  addFriendButtonText: {
    fontWeight: "600",
  },
  statsContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: "row",
    gap: 12,
  },
  jerseyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  positionContainer: {
    alignItems: "flex-start",
  },
  positionLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  positionText: {
    fontWeight: "800",
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  innerBorder: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 15,
    borderWidth: 1,
    pointerEvents: "none",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardGradient: {
    padding: 16,
    width: "100%",
  },
  achievementsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  achievementsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  rankSection: {
    alignItems: "center",
    marginTop: -10,
    marginBottom: 12,
    transform: [{ scale: 1.3 }],
  },
});
