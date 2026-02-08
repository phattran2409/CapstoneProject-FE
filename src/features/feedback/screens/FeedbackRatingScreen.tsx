import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useToast } from "@/shared/toast";
import SwipeableRatingCard, { Player } from "../components/SwipeableRatingCard";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";

type FeedbackRatingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FeedbackRating"
>;
type FeedbackRatingScreenRouteProp = RouteProp<
  RootStackParamList,
  "FeedbackRating"
>;

interface FeedbackRatingScreenProps {
  navigation: FeedbackRatingScreenNavigationProp;
  route: FeedbackRatingScreenRouteProp;
}

// Mock data - replace with actual API call
const MOCK_PLAYERS: Player[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    role: "TIỀN ĐẠO CÁNH TRÁI",
    jerseyNumber: 10,
  },
  {
    id: "2",
    name: "Trần Văn Bình",
    role: "TIỀN ĐẠO CÁNH PHẢI",
    jerseyNumber: 7,
  },
  {
    id: "3",
    name: "Lê Văn Cường",
    role: "TIỀN VỆ TRUNG TÂM",
    jerseyNumber: 8,
  },
];

const FeedbackRatingScreen: React.FC<FeedbackRatingScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingPlayerId, setReportingPlayerId] = useState<string | null>(
    null,
  );

  const progressAnim = useSharedValue(0);
  const nextCardAnim = useSharedValue(0);

  React.useEffect(() => {
    const progress = (currentIndex + 1) / MOCK_PLAYERS.length;
    progressAnim.value = withSpring(progress);

    // Animate next card when index changes
    nextCardAnim.value = 0;
    nextCardAnim.value = withSpring(1, {
      damping: 20,
      stiffness: 100,
    });
  }, [currentIndex]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progressAnim.value, [0, 1], [0, 100])}%`,
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(nextCardAnim.value, [0, 1], [0.3, 0.5]),
      transform: [
        {
          scale: interpolate(nextCardAnim.value, [0, 1], [0.9, 0.95]),
        },
      ],
    };
  });

  // Shift card container up for last player to cover progress bar
  const isLastPlayer = currentIndex === MOCK_PLAYERS.length - 1;
  const cardContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(isLastPlayer ? -40 : 0, {
            damping: 20,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  const currentPlayer = MOCK_PLAYERS[currentIndex];

  const handleRatingChange = useCallback(
    (rating: number) => {
      setRatings((prev) => ({ ...prev, [currentPlayer.id]: rating }));
    },
    [currentPlayer.id],
  );

  const handleCommentChange = useCallback(
    (comment: string) => {
      setComments((prev) => ({ ...prev, [currentPlayer.id]: comment }));
    },
    [currentPlayer.id],
  );

  const handleValidate = useCallback((rating: number) => {
    // Rating is required (must be at least 1)
    return rating > 0;
  }, []);

  const handleComplete = useCallback(() => {
    // Collect all ratings (including those not rated - will be 0)
    const allRatings = MOCK_PLAYERS.map((p) => ({
      playerId: p.id,
      rating: ratings[p.id] || 0,
      comment: comments[p.id] || "",
    }));

    // Submit all ratings (no validation - freedom to skip players)
    console.log("Submitting ratings:", allRatings);

    // Navigate to completion screen
    navigation.replace("FeedbackComplete");
  }, [ratings, comments, navigation]);

  const handleSwipeRight = useCallback(() => {
    // Validate rating before submitting
    const currentRating = ratings[currentPlayer.id] || 0;
    if (currentRating === 0) {
      // Show error - rating is required
      toast.error(
        t("feedback.validation.ratingRequired", "Đánh giá bắt buộc"),
        t(
          "feedback.validation.ratingRequiredMessage",
          "Vui lòng chọn số sao đánh giá trước khi gửi.",
        ),
      );
      return;
    }

    // If last player, complete the feedback
    if (currentIndex === MOCK_PLAYERS.length - 1) {
      handleComplete();
    } else {
      // Move to next player immediately
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, currentPlayer.id, ratings, toast, t, handleComplete]);

  const handleSwipeLeft = useCallback(() => {
    // Skip this player - move immediately
    if (currentIndex < MOCK_PLAYERS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // If last player and skipped, go to complete
      navigation.replace("FeedbackComplete");
    }
  }, [currentIndex, navigation]);

  const handleReport = () => {
    console.log("Report clicked");
  }


  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t("feedback.rating.title", "Đánh giá Đồng đội")}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t("feedback.rating.subtitle", "TRẬN ĐẤU CHỦ NHẬT")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.helpButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="help-circle-outline"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text
          style={[styles.progressLabel, { color: theme.colors.textSecondary }]}
        >
          {t("feedback.rating.progress", "TIẾN TRÌNH")}
        </Text>
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                { backgroundColor: theme.colors.primary },
                progressStyle,
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.primary }]}>
            {currentIndex + 1}/{MOCK_PLAYERS.length}
          </Text>
        </View>
      </View>

      {/* Rating Card Container with Stack Effect */}
      <Animated.View style={[styles.cardContainer, cardContainerStyle]}>
        {/* Next Card (behind current) - for smooth transition */}
        {currentIndex < MOCK_PLAYERS.length - 1 && (
          <Animated.View style={[styles.nextCardContainer, nextCardStyle]}>
            <SwipeableRatingCard
              key={`next-${MOCK_PLAYERS[currentIndex + 1].id}`}
              player={MOCK_PLAYERS[currentIndex + 1]}
              rating={ratings[MOCK_PLAYERS[currentIndex + 1].id] || 0}
              comment={comments[MOCK_PLAYERS[currentIndex + 1].id] || ""}
              onRatingChange={() => {}}
              onCommentChange={() => {}}
              onSwipeRight={() => {}}
              onSwipeLeft={() => {}}
              onValidate={handleValidate}
              isLastPlayer={currentIndex + 1 === MOCK_PLAYERS.length - 1}
            />
          </Animated.View>
        )}

        {/* Current Card (on top) */}
        <SwipeableRatingCard
          key={currentPlayer.id} // Force re-render when player changes
          player={currentPlayer}
          rating={ratings[currentPlayer.id] || 0}
          comment={comments[currentPlayer.id] || ""}
          onRatingChange={handleRatingChange}
          onCommentChange={handleCommentChange}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onReport={handleReport}
          onValidate={handleValidate}
          isLastPlayer={currentIndex === MOCK_PLAYERS.length - 1}
          onComplete={handleComplete}
        />
      </Animated.View>

      {/* Swipe Indicators */}
      <View style={styles.swipeIndicators}>
        <View style={styles.swipeIndicator}>
          <View
            style={[
              styles.swipeIcon,
              { backgroundColor: theme.colors.textTertiary },
            ]}
          >
            <Ionicons name="close" size={24} color="#000" />
          </View>
          <Text
            style={[styles.swipeLabel, { color: theme.colors.textSecondary }]}
          >
            {t("feedback.rating.swipeLeft", "VUỐT TRÁI")}
          </Text>
        </View>

        <View style={styles.swipeIndicator}>
          <View
            style={[
              styles.swipeIcon,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="checkmark" size={24} color="#000" />
          </View>
          <Text style={[styles.swipeLabel, { color: theme.colors.primary }]}>
            {t("feedback.rating.swipeRight", "VUỐT PHẢI")}
          </Text>
        </View>
      </View>

      {/* Tip */}
      <Text style={[styles.tip, { color: theme.colors.textTertiary }]}>
        {t(
          "feedback.rating.tip",
          "Mẹo: Đánh giá trung thực giúp hệ thống cân bằng đội hình tốt hơn.",
        )}
      </Text>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 40,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    position: "relative",
  },
  nextCardContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.3,
    transform: [{ scale: 0.95 }],
    zIndex: 0,
  },
  swipeIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    paddingVertical: 16,
  },
  swipeIndicator: {
    alignItems: "center",
    gap: 8,
  },
  swipeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  tip: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  reportReasons: {
    maxHeight: 200,
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: "#FF5252",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FeedbackRatingScreen;
