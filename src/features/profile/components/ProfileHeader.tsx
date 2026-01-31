import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FriendshipActionButton } from "./FriendshipActionButton";
import { FriendshipStatus } from "@/features/friends/types/friends.types";
import { JerseyBadge } from "./JerseyBadge";

interface ProfileHeaderProps {
  avatar?: string;
  name: string;
  elo: number;
  description?: string;
  position?: string;
  shirtNumber?: number;
  isCurrentUser?: boolean;
  onEditPress?: () => void;
  // Friendship actions
  friendshipStatus?: FriendshipStatus;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onAcceptRequest?: () => void;
  onCancelRequest?: () => void;
  isFriendshipLoading?: boolean;
}

//SVG Jersey Badge
JerseyBadge

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatar,
  name,
  elo,
  description,
  position = "Forward",
  shirtNumber = 10,
  isCurrentUser,
  onEditPress,
  friendshipStatus,
  onAddFriend,
  onRemoveFriend,
  onAcceptRequest,
  onCancelRequest,
  isFriendshipLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </View>

      {/* Name */}
      <View style={{ alignItems: "center", marginBottom: theme.spacing.m }}>
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
        {/* Description */}
        <Text
          style={[
            styles.quote,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.textSecondary,
              textAlign: "center",
            },
          ]}
        >
          {description}
        </Text>
      </View>

      {/* Rank Badge */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              theme.colors.border === "#E0E0E0" ? "#2C2C2C" : "#2C2C2C",
            borderRadius: theme.radius.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
          },
        ]}
      >
        <Ionicons name="trophy" size={18} color={theme.colors.neonGreen} />
        <Text
          style={[
            styles.elo,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.neonGreen,
              marginLeft: theme.spacing.xs,
            },
          ]}
        >
          {elo.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.rank,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.white,
              marginLeft: theme.spacing.s,
            },
          ]}
        >
          Điểm Elo
        </Text>
      </View>
      <JerseyBadge
        number={shirtNumber}
        accent={theme.colors.neonGreen}
        text={position}
      />

      {/* Edit Button or Friendship Action Button */}
      {isCurrentUser ? (
        <TouchableOpacity
          onPress={onEditPress}
          style={[
            styles.editButton,
            {
              backgroundColor: theme.colors.neonGreen,
              borderRadius: theme.radius.m,
              paddingVertical: theme.spacing.s,
              paddingHorizontal: theme.spacing.xl,
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
          />
        )
      )}
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
    paddingVertical: 8,
    paddingHorizontal: 32,
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
});
