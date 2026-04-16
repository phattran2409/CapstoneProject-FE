import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
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
import { useFeedbackSessionStore, type MatchResult } from "../store/feedbackSessionStore";
import { useGenerateSuggestionComment, useVoteMatchResult } from "../hooks/useFeedback";
import { useToast } from "@/shared/toast";
import { getTranslatedError } from "@/shared/utils/errorTranslations";

const { width } = Dimensions.get("window");

type FeedbackMatchResultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FeedbackMatchResult"
>;

interface FeedbackMatchResultScreenProps {
  navigation: FeedbackMatchResultScreenNavigationProp;
}

const CARD_WIDTH = (width - 64) / 2; // 2 cards + margins

const FeedbackMatchResultScreen: React.FC<FeedbackMatchResultScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);

  const session = useFeedbackSessionStore((s) => s.session);
  const setMatchResult = useFeedbackSessionStore((s) => s.setMatchResult);
  const voteMatchResultMutation = useVoteMatchResult();
  const toast = useToast();

  // Animations
  const glowOpacity = useSharedValue(0.5);
  const winnerScale = useSharedValue(1);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(1, { duration: 2500 }), -1, true);
    winnerScale.value = withRepeat(
      withSpring(1.03, { damping: 18, stiffness: 80 }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0, 1], [0.2, 0.6]),
  }));

  const winnerPillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winnerScale.value }],
  }));

  const handleContinue = async () => {
    if (!selectedResult || !session) return;
    try {
      await voteMatchResultMutation.mutateAsync({
        roomId: session.roomId,
        vote: selectedResult,
      });
      await setMatchResult(selectedResult);
      navigation.replace("FeedbackRating");
    } catch (error: any) {  
      const detail =
        getTranslatedError(error?.message) ||
        t(
          "feedback.result.voteErrorMessage",
          "Vui lòng kiểm tra kết nối và thử lại.",
        );
      toast.error(
        t("feedback.result.voteErrorTitle", "Không gửi được kết quả"),
        detail,
      );
    }
  };


  const isTeamASelected = selectedResult === "TeamAWin";
  const isTeamBSelected = selectedResult === "TeamBWin";
  const isDrawSelected = selectedResult === "Draw";

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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t("feedback.result.headerTitle", "Xác nhận Kết quả")}
          </Text>
          {/* Spacer for symmetry */}
          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t("feedback.result.title", "Ai là người chiến thắng?")}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t(
              "feedback.result.subtitle",
              "Chọn kết quả cuối cùng của trận đấu để cập nhật bảng xếp hạng.",
            )}
          </Text>
          {/* Team Cards */}
          <View style={styles.teamsRow}>
            {/* Team A */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.teamCardWrapper,
                isTeamASelected && styles.teamCardWrapperSelected,
              ]}
              onPress={() => setSelectedResult("TeamAWin")}
            >
              {isTeamASelected && (
                <>
                  <Animated.View
                    style={[
                      styles.glowCard,
                      { backgroundColor: theme.colors.primary },
                      glowStyle,
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.winnerPill,
                      { backgroundColor: theme.colors.primary },
                      winnerPillStyle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.winnerPillText,
                        { color: theme.colors.background },
                      ]}
                    >
                      {t("feedback.result.winner", "WINNER")}
                    </Text>
                  </Animated.View>
                </>
              )}
              <View
                style={[
                  styles.teamCard,
                  {
                    borderColor: isTeamASelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shirtCircle,
                    {
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name="shirt-outline"
                    size={34}
                    color={
                      isTeamASelected
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.teamName,
                    {
                      color: isTeamASelected
                        ? theme.colors.primary
                        : theme.colors.text,
                    },
                  ]}
                >
                  {session?.teamAName ?? t("feedback.result.teamA", "Đội A")}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Team B */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.teamCardWrapper,
                isTeamBSelected && styles.teamCardWrapperSelected,
              ]}
              onPress={() => setSelectedResult("TeamBWin")}
            >
              {isTeamBSelected && (
                <>
                  <Animated.View
                    style={[
                      styles.glowCard,
                      { backgroundColor: theme.colors.primary },
                      glowStyle,
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.winnerPill,
                      { backgroundColor: theme.colors.primary },
                      winnerPillStyle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.winnerPillText,
                        { color: theme.colors.background },
                      ]}
                    >
                      {t("feedback.result.winner", "WINNER")}
                    </Text>
                  </Animated.View>
                </>
              )}
              <View
                style={[
                  styles.teamCard,
                  {
                    borderColor: isTeamBSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shirtCircle,
                    {
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name="shirt-outline"
                    size={34}
                    color={
                      isTeamBSelected
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.teamName,
                    {
                      color: isTeamBSelected
                        ? theme.colors.primary
                        : theme.colors.text,
                    },
                  ]}
                >
                  {session?.teamBName ?? t("feedback.result.teamB", "Đội B")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* Draw Option */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.drawCard,
              {
                borderColor: isDrawSelected
                  ? theme.colors.primary
                  : theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
            onPress={() => setSelectedResult("Draw")}
          >
            <View style={styles.drawLeft}>
              <Ionicons
                name="scale-outline"
                size={22}
                color={
                  isDrawSelected ? theme.colors.primary : theme.colors.text
                }
              />
              <Text
                style={[
                  styles.drawText,
                  {
                    color: isDrawSelected
                      ? theme.colors.primary
                      : theme.colors.text,
                  },
                ]}
              >
                {t("feedback.result.draw", "Trận đấu Hòa")}
              </Text>
            </View>
            <View style={styles.drawRight}>
              {isDrawSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </View>
          </TouchableOpacity>
          {/* Continue Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.continueButton,
              {
                backgroundColor: selectedResult
                  ? theme.colors.primary
                  : theme.colors.textTertiary,
                opacity: selectedResult ? 1 : 0.6,
              },
            ]}
            disabled={!selectedResult || voteMatchResultMutation.isPending}
            onPress={handleContinue}
          >
            {voteMatchResultMutation.isPending ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  { color: theme.colors.background },
                ]}
              >
                {t("feedback.result.continue", "TIẾP TỤC")}
              </Text>
            )}
          </TouchableOpacity>
          {/* Footer Note */}
          <Text
            style={[
              styles.footerText,
              { color: theme.colors.textTertiary },
            ]}
          >
            {t(
              "feedback.result.footer",
              "Sau khi nhấn, yêu cầu sẽ được gửi tới đội trưởng đội phương để xác nhận kết quả.",
            )}
          </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerRightPlaceholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  teamCardWrapper: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 2,
  },
  teamCardWrapperSelected: {
    shadowColor: "#97FB57",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  glowCard: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 24,
  },
  winnerPill: {
    position: "absolute",
    top: -10,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  winnerPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamCard: {
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    paddingVertical: 24,
  },
  shirtCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  drawCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  drawLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  drawText: {
    fontSize: 14,
    fontWeight: "600",
  },
  drawRight: {
    alignItems: "center",
    justifyContent: "center",
  },

  continueButton: {
    marginTop: "auto",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
});

export default FeedbackMatchResultScreen;


