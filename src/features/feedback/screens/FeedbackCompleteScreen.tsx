import React, { useEffect } from "react";
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

const { width } = Dimensions.get("window");

type FeedbackCompleteScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FeedbackComplete"
>;

interface FeedbackCompleteScreenProps {
  navigation: FeedbackCompleteScreenNavigationProp;
}

const FeedbackCompleteScreen: React.FC<FeedbackCompleteScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Animation values
  const scaleAnim = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    scaleAnim.value = withSpring(1, { damping: 10, stiffness: 100 });
    
    setTimeout(() => {
      checkmarkScale.value = withSpring(1, { damping: 8, stiffness: 150 });
    }, 200);

    setTimeout(() => {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }, 400);

    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    }, 600);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: scaleAnim.value,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      glowOpacity.value,
      [0, 1],
      [0.3, 0.7]
    );
    return {
      opacity,
    };
  });

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonScale.value,
  }));

  const handleFinish = () => {
    // Navigate back to previous screen or home
    navigation.getParent()?.goBack();
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
        <Animated.View style={[styles.content, containerStyle]}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.glowCircle, glowStyle]} />
            <Animated.View
              style={[
                styles.checkmarkContainer,
                { borderColor: theme.colors.primary },
                checkmarkStyle,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={80}
                color={theme.colors.primary}
              />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t(
              "feedback.complete.title",
              "Cảm ơn bạn đã đánh giá!"
            )}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {t(
              "feedback.complete.description",
              "Đánh giá của bạn đã được ghi nhận. Chúng tôi sẽ sử dụng thông tin này để tổ chức những trận đấu cân sức và công bằng hơn."
            )}
          </Text>

          {/* Stats or Additional Info */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons
                name="star"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                12
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t("feedback.complete.playersRated", "Người chơi đã đánh giá")}
              </Text>
            </View>
          </View>

          {/* Finish Button */}
          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={[
                styles.finishButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.finishButtonText,
                  { color: theme.colors.background },
                ]}
              >
                {t("feedback.complete.finishButton", "Hoàn thành")}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.background}
                style={styles.finishButtonIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
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
    opacity: 0.3,
  },
  checkmarkContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
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
  statsContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 48,
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  finishButtonIcon: {
    marginLeft: 4,
  },
});

export default FeedbackCompleteScreen;

