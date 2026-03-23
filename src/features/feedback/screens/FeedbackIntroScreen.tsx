import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useFeedbackSessionStore } from "../store/feedbackSessionStore";

const { width } = Dimensions.get("window");

type FeedbackIntroScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FeedbackIntro"
>;

interface FeedbackIntroScreenProps {
  navigation: FeedbackIntroScreenNavigationProp;
}

const FeedbackIntroScreen: React.FC<FeedbackIntroScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const session = useFeedbackSessionStore((s) => s.session);
  const setStep = useFeedbackSessionStore((s) => s.setStep);

  // Animation values
  const scaleAnim = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const teamScale = useSharedValue(1);

  React.useEffect(() => {
    // Pulsing animation for main icon - slower and gentler
    scaleAnim.value = withRepeat(
      withSpring(1.03, { damping: 15, stiffness: 50 }), // Reduced scale and slower
      -1,
      true,
    );

    // Glow animation - slower fade
    glowOpacity.value = withRepeat(
      withTiming(1, { duration: 3000 }), // Increased from 2000ms to 3000ms
      -1,
      true,
    );

    // Team icons animation - slower and subtler
    teamScale.value = withRepeat(
      withSpring(1.05, { damping: 20, stiffness: 80 }), // Reduced scale and slower
      -1,
      true,
    );
  }, []);

  const mainIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0, 1], [0.3, 0.7]),
  }));

  const teamIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: teamScale.value }],
  }));

  const handleStart = async () => {
    await setStep("matchResult");
    navigation.navigate("FeedbackMatchResult");
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.background,
          `${theme.colors.background}DD`,
        ]}
        style={styles.gradient}
      >
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Main Balance Icon */}
          <Animated.View style={[styles.mainIconContainer, mainIconStyle]}>
            <Animated.View style={[styles.glowCircle, glowStyle]} />
            <View
              style={[styles.mainIcon, { borderColor: theme.colors.primary }]}
            >
              <Ionicons
                name="scale-outline"
                size={80}
                color={theme.colors.primary}
              />
            </View>
          </Animated.View>

          {/* Team Icons */}
          <View style={styles.teamsContainer}>
            <Animated.View style={teamIconStyle}>
              <View
                style={[styles.teamIcon, { borderColor: theme.colors.primary }]}
              >
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.teamLabel, { color: theme.colors.text }]}>
                {session?.teamAName ?? t("feedback.intro.teamA", "ĐỘI A")}
              </Text>
            </Animated.View>

            <View
              style={[
                styles.connector,
                { backgroundColor: theme.colors.primary },
              ]}
            />

            <Animated.View style={teamIconStyle}>
              <View
                style={[styles.teamIcon, { borderColor: theme.colors.primary }]}
              >
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.teamLabel, { color: theme.colors.text }]}>
                {session?.teamBName ?? t("feedback.intro.teamB", "ĐỘI B")}
              </Text>
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t("feedback.intro.title", "Giúp hệ thống cân bằng trận đấu")}
          </Text>

          {/* Description */}
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {t(
              "feedback.intro.description",
              "Đánh giá đồng đội một cách công tâm để giúp chúng tôi tổ chức những trận đấu cân sức và hấp dẫn hơn cho bạn.",
            )}
          </Text>

          {/* Start Button */}
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.startButtonText,
                { color: theme.colors.background },
              ]}
            >
              {t("feedback.intro.startButton", "Bắt đầu đánh giá")}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.colors.background}
              style={styles.startButtonIcon}
            />
          </TouchableOpacity>

          {/* Progress Indicators */}
          <View style={styles.progressIndicators}>
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.textTertiary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.textTertiary },
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  mainIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  glowCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#97FB57",
    opacity: 0.2,
  },
  mainIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48,
    gap: 16,
  },
  teamIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  connector: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  startButtonIcon: {
    marginLeft: 4,
  },
  progressIndicators: {
    flexDirection: "row",
    gap: 8,
    marginTop: 48,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default FeedbackIntroScreen;
