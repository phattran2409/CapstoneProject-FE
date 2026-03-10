import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import {
  ThemedSafeAreaView,
  ThemedScrollView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import { useAuthStore, useLogout } from "@/features/auth";

import { useAppStore } from "@/store/appStore";
import { RootStackParamList, TabParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useScrollToHideTabBar } from "@/shared/hooks/useScrollToHideTabBar";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "../hooks";

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Profile">,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [postNotifications, setPostNotifications] = useState(false);
  const [notificationExpanded, setNotificationExpanded] = useState(false);
  const [friendshipNotifications, setFriendshipNotifications] = useState(false);
  const chevronRotation = useRef(new Animated.Value(0)).current;

  const { data: notificationSettings } = useNotificationSettings();
  const { mutate: updateNotificationSettings } =
    useUpdateNotificationSettings();

  // Sync local state when data is loaded from API
  React.useEffect(() => {
    if (notificationSettings) {
      setMatchNotifications(notificationSettings.matchRoom);
      setPostNotifications(notificationSettings.post);
      setFriendshipNotifications(notificationSettings.friendship);
    }
  }, [notificationSettings]);

  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleNotificationDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(chevronRotation, {
      toValue: notificationExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setNotificationExpanded((prev) => !prev);
  };

  // ✅ Use logout
  const { logout } = useLogout();
  const scrollHandler = useScrollToHideTabBar();

  const handleLogout = () => {
    logout();
  };

  const handleAvatarPress = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("PersonalPage", { userId: user?.userId });
    }
  };

  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView
          style={[
            styles.header,
            {
              paddingHorizontal: theme.spacing.l,
              paddingVertical: theme.spacing.m,
              marginTop: theme.spacing.xl,
            },
          ]}
        >
          <ThemedText variant="primary" size="xxl" weight="bold">
            {t("profile.title")}
          </ThemedText>
        </ThemedView>
        <ThemedView
          style={{
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
          }}
        >
          {/* Compact Profile Section - rectangular card leading to personal page */}
          <TouchableOpacity
            onPress={handleAvatarPress}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: theme.spacing.m,
              borderRadius: theme.radius.l,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              marginBottom: theme.spacing.l,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#E8D5C4",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: theme.colors.neonGreen,
                marginRight: theme.spacing.m,
              }}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/default_avatar.png")}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              )}
            </View>

            {/* Name + info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: theme.fontSizes.m,
                  color: theme.colors.text,
                  fontWeight: "700",
                  marginBottom: theme.spacing.xs / 2,
                }}
              >
                {user?.fullName || "Người dùng"}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSizes.s,
                  color: theme.colors.textSecondary,
                }}
                numberOfLines={1}
              >
                {t("profile.personalPage")}
              </Text>
            </View>

            {/* Arrow icon to indicate go to personal page */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Account Section */}
          <View style={{ marginBottom: theme.spacing.l }}>
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                fontWeight: "600",
                marginBottom: theme.spacing.m,
                textTransform: "uppercase",
              }}
            >
              {t("profile.account")}
            </Text>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  paddingVertical: theme.spacing.m,
                  paddingHorizontal: theme.spacing.m,
                  borderRadius: theme.radius.m,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.m,
                    marginLeft: theme.spacing.m,
                  },
                ]}
              >
                {t("profile.changePassword")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={{ marginBottom: theme.spacing.l }}>
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                fontWeight: "600",
                marginBottom: theme.spacing.m,
                textTransform: "uppercase",
              }}
            >
              {t("profile.notifications")}
            </Text>

            {/* Notification Header – tap to expand/collapse */}
            <TouchableOpacity
              onPress={toggleNotificationDropdown}
              activeOpacity={0.8}
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.colors.surface,
                  paddingVertical: theme.spacing.m,
                  paddingHorizontal: theme.spacing.m,
                  borderRadius: notificationExpanded
                    ? theme.radius.m
                    : theme.radius.m,
                  borderBottomLeftRadius: notificationExpanded
                    ? 0
                    : theme.radius.m,
                  borderBottomRightRadius: notificationExpanded
                    ? 0
                    : theme.radius.m,
                  marginBottom: 0,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.m,
                    marginLeft: theme.spacing.m,
                  },
                ]}
              >
                {t("profile.notifications")}
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: chevronRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "90deg"],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </Animated.View>
            </TouchableOpacity>

            {/* Dropdown rows */}
            {notificationExpanded && (
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderTopWidth: 0,
                  borderColor: theme.colors.border,
                  borderBottomLeftRadius: theme.radius.m,
                  borderBottomRightRadius: theme.radius.m,
                  marginBottom: theme.spacing.xs,
                  overflow: "hidden",
                }}
              >
                {/* Match Notification */}
                <View
                  style={[
                    styles.settingItem,
                    {
                      paddingVertical: theme.spacing.m,
                      paddingHorizontal: theme.spacing.m,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="football-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.settingText,
                      {
                        color: theme.colors.text,
                        fontSize: theme.fontSizes.s,
                        marginLeft: theme.spacing.m,
                      },
                    ]}
                  >
                    {t("profile.matchNotification")}
                  </Text>
                  <Switch
                    value={matchNotifications}
                    onValueChange={(val) => {
                      setMatchNotifications(val);
                      updateNotificationSettings({
                        matchRoom: val,
                        post: postNotifications,
                        friendship: friendshipNotifications,
                      });
                    }}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.neonGreen,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </View>

                {/* Post Notification */}
                <View
                  style={[
                    styles.settingItem,
                    {
                      paddingVertical: theme.spacing.m,
                      paddingHorizontal: theme.spacing.m,
                    },
                  ]}
                >
                  <Ionicons
                    name="newspaper-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.settingText,
                      {
                        color: theme.colors.text,
                        fontSize: theme.fontSizes.s,
                        marginLeft: theme.spacing.m,
                      },
                    ]}
                  >
                    {t("profile.postNotification")}
                  </Text>
                  <Switch
                    value={postNotifications}
                    onValueChange={(val) => {
                      setPostNotifications(val);
                      updateNotificationSettings({
                        matchRoom: matchNotifications,
                        post: val,
                        friendship: friendshipNotifications,
                      });
                    }}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.neonGreen,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </View>
                {/* Friendship Notification */}
                <View
                  style={[
                    styles.settingItem,
                    {
                      paddingVertical: theme.spacing.m,
                      paddingHorizontal: theme.spacing.m,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.settingText,
                      {
                        color: theme.colors.text,
                        fontSize: theme.fontSizes.s,
                        marginLeft: theme.spacing.m,
                      },
                    ]}
                  >
                    {t("profile.friendshipNotification")}
                  </Text>
                  <Switch
                    value={friendshipNotifications}
                    onValueChange={(val) => {
                      setFriendshipNotifications(val);
                      updateNotificationSettings({
                        matchRoom: matchNotifications,
                        post: postNotifications,
                        friendship: val,
                      });
                    }}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.neonGreen,
                    }}
                    thumbColor={theme.colors.white}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Application Section */}
          <View style={{ marginBottom: theme.spacing.l }}>
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                fontWeight: "600",
                marginBottom: theme.spacing.m,
                textTransform: "uppercase",
              }}
            >
              {t("profile.application")}
            </Text>
            <TouchableOpacity
              onPress={() => setLanguage(language === "vi" ? "en" : "vi")}
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  paddingVertical: theme.spacing.m,
                  paddingHorizontal: theme.spacing.m,
                  borderRadius: theme.radius.m,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              <Ionicons
                name="globe-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.m,
                    marginLeft: theme.spacing.m,
                  },
                ]}
              >
                {t("profile.language")}
              </Text>
              <Text
                style={[
                  styles.settingValue,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.s,
                  },
                ]}
              >
                {language === "vi"
                  ? t("common.language.vietnamese")
                  : t("common.language.english")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  paddingVertical: theme.spacing.m,
                  paddingHorizontal: theme.spacing.m,
                  borderRadius: theme.radius.m,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.m,
                    marginLeft: theme.spacing.m,
                  },
                ]}
              >
                {t("profile.interface")}
              </Text>

              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.neonGreen,
                }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: theme.colors.surface,
                  paddingVertical: theme.spacing.m,
                  paddingHorizontal: theme.spacing.m,
                  borderRadius: theme.radius.m,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.m,
                    marginLeft: theme.spacing.m,
                  },
                ]}
              >
                {t("profile.termsOfService")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button - thêm marginBottom để không bị CustomTabBar đè, dễ bấm */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: theme.colors.neonGreen,
                shadowColor: theme.colors.neonGreen,
                borderRadius: theme.radius.l,
                paddingVertical: theme.spacing.m,
                marginTop: theme.spacing.m,
                marginBottom: theme.spacing.xl,
              },
            ]}
            onPress={handleLogout}
          >
            <ThemedText
              size="l"
              weight="bold"
              style={{ color: theme.colors.background, textAlign: "center" }}
            >
              {t("common.buttons.logout")}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /** Khoảng trống đáy để nội dung không bị CustomTabBar (height 70 + bottom 20) đè, dễ scroll và bấm logout */
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
    fontWeight: "500",
  },
  settingValue: {
    marginRight: 4,
  },
  logoutButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ProfileScreen;
