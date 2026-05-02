import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useToast } from "@/shared/toast";
import SwipeableRatingCard, { Player } from "../components/SwipeableRatingCard";
import { ReportPlayerModal } from "../components/ReportPlayerModal";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useFeedbackSessionStore } from "../store/feedbackSessionStore";
import { useSubmitMatchFeedbacksBatch, useReportPlayer } from "../hooks";
import {
  DEFAULT_PLAYER_FEEDBACK_ID,
  type MatchFeedbackBatchItem,
  ReportType,
} from "../types/feedback.types";
import { useAuthStore } from "@/features/auth";
import { getTranslatedError } from "@/shared/utils/errorTranslations";
import { formatDate } from "@/shared/utils/formatters";

type FeedbackRatingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FeedbackRating"
>;

interface FeedbackRatingScreenProps {
  navigation: FeedbackRatingScreenNavigationProp;
}

const FeedbackRatingScreen: React.FC<FeedbackRatingScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const session = useFeedbackSessionStore((s) => s.session);
  const savePlayerRating = useFeedbackSessionStore((s) => s.savePlayerRating);
  const advancePlayer = useFeedbackSessionStore((s) => s.advancePlayer);
  const markPlayerReported = useFeedbackSessionStore((s) => s.markPlayerReported);
  const setStep = useFeedbackSessionStore((s) => s.setStep);
  const user = useAuthStore((s) => s.user);
  const submitBatchMutation = useSubmitMatchFeedbacksBatch();
  const reportPlayerMutation = useReportPlayer();

  // Chuyển teammates sang format Player cho SwipeableRatingCard
  const players: Player[] = useMemo(() =>
    (session?.teammates ?? []).map((p) => ({
      id: p.userId,
      name: p.fullName,
      role: p.position?.toUpperCase() ?? "",
      avatarUrl: p.avatarUrl ?? undefined,
    })),
    [session?.teammates],
  );

  const matchSubtitle = useMemo(() => {
    if (!session?.matchDate) {
      return t("feedback.rating.subtitleFallback", "Trận đấu của bạn");
    }
    const dateLabel = formatDate(session.matchDate, "short");
    const timePart = session.startTime?.trim().substring(0, 5);
    return timePart ? `${dateLabel} · ${timePart}` : dateLabel;
  }, [session?.matchDate, session?.startTime, t]);

  const replaceWithNextStep = useCallback(() => {
    const opponents = session?.opponents ?? [];
    if (opponents.length > 0) {
      navigation.replace("FeedbackOpponentRating");
    } else {
      navigation.replace("FeedbackFieldRating", {
        venueId: session?.venue?.venueId,
      });
    }
  }, [navigation, session?.opponents, session?.venue?.venueId]);

  /** Không có đồng đội → bỏ qua bước đánh giá đồng đội */
  useEffect(() => {
    if (!session || players.length > 0) return;
    let cancelled = false;
    void (async () => {
      const opponents = session.opponents ?? [];
      const nextStep = opponents.length > 0 ? "opponentRating" : "fieldRating";
      await setStep(nextStep as any);
      if (!cancelled) {
        replaceWithNextStep();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, players.length, setStep, replaceWithNextStep]);

  // Khôi phục index từ store (resume khi tắt app giữa chừng)
  const [currentIndex, setCurrentIndex] = useState(
    () => session?.currentPlayerIndex ?? 0,
  );
  const [ratings, setRatings] = useState<Record<string, number>>(
    () => Object.fromEntries(
      Object.entries(session?.playerRatings ?? {}).map(([k, v]) => [k, v.rating]),
    ),
  );
  const [comments, setComments] = useState<Record<string, string>>(
    () => Object.fromEntries(
      Object.entries(session?.playerRatings ?? {}).map(([k, v]) => [k, v.comment]),
    ),
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);

  const progressAnim = useSharedValue(0);
  const nextCardAnim = useSharedValue(0);

  React.useEffect(() => {
    const total = players.length || 1;
    const progress = (currentIndex + 1) / total;
    progressAnim.value = withSpring(progress);

    nextCardAnim.value = 0;
    nextCardAnim.value = withSpring(1, {
      damping: 20,
      stiffness: 100,
    });
  }, [currentIndex, players.length]);

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
  // const isLastPlayer = currentIndex === MOCK_PLAYERS.length - 1;
  // const cardContainerStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [
  //       {
  //         translateY: withSpring(isLastPlayer ? -40 : 0, {
  //           damping: 20,
  //           stiffness: 100,
  //         }),
  //       },
  //     ],
  //   };
  // });

  const currentPlayer = players[currentIndex];

  const handleRatingChange = useCallback(
    (rating: number) => {
      if (!currentPlayer) return;
      setRatings((prev) => ({ ...prev, [currentPlayer.id]: rating }));
    },
    [currentPlayer?.id],
  );

  const handleCommentChange = useCallback(
    (comment: string) => {
      if (!currentPlayer) return;
      setComments((prev) => ({ ...prev, [currentPlayer.id]: comment }));
    },
    [currentPlayer?.id],
  );

  const handleValidate = useCallback((rating: number) => {
    // Rating is required (must be at least 1)
    return rating > 0;
  }, []);

  /**
   * Gom mọi đánh giá đã chọn (rating > 0) → một request batch, rồi sang màn sân.
   * Nếu không ai được chấm → chỉ chuyển màn (không gọi API).
   */
  const submitBatchAndGoToField = useCallback(async () => {
    const liveSession = useFeedbackSessionStore.getState().session;
    if (!liveSession || !user?.userId) {
      toast.error(
        t("feedback.rating.sessionErrorTitle", "Thiếu thông tin"),
        t(
          "feedback.rating.sessionErrorMessage",
          "Không thể gửi đánh giá. Vui lòng quay lại phòng và thử lại.",
        ),
      );
      return;
    }

    const reportedIds = new Set(liveSession.reportedUserIds ?? []);
    const feedbacks: MatchFeedbackBatchItem[] = players
      .filter((p) => !reportedIds.has(p.id))
      .map((p) => ({
        feedbackId: DEFAULT_PLAYER_FEEDBACK_ID,
        revieweeId: p.id,
        comment: comments[p.id] ?? "",
        rating: ratings[p.id] ?? 0,
      }))
      .filter((f) => f.rating > 0);

    const opponents = liveSession.opponents ?? [];
    const nextStep = opponents.length > 0 ? "opponentRating" : "fieldRating";

    if (feedbacks.length === 0) {
      await setStep(nextStep as any);
      replaceWithNextStep();
      return;
    }

    try {
      await submitBatchMutation.mutateAsync({
        matchId: liveSession.roomId,
        reviewerId: user.userId,
        feedbacks,
      });
      await setStep(nextStep as any);
      replaceWithNextStep();
    } catch (error: any) {
      toast.error(
        t("feedback.rating.submitErrorTitle", "Gửi đánh giá thất bại"),
        getTranslatedError(error?.message) ||
        t(
          "feedback.rating.submitErrorMessage",
          "Vui lòng thử lại sau.",
        ),
      );
    }
  }, [
    user?.userId,
    players,
    comments,
    ratings,
    submitBatchMutation,
    setStep,
    replaceWithNextStep,
    toast,
    t,
  ]);

  const handleSwipeRight = useCallback(async () => {
    if (submitBatchMutation.isPending) return;
    if (!session || !user?.userId || !currentPlayer) {
      toast.error(
        t("feedback.rating.sessionErrorTitle", "Thiếu thông tin"),
        t(
          "feedback.rating.sessionErrorMessage",
          "Không thể gửi đánh giá. Vui lòng quay lại phòng và thử lại.",
        ),
      );
      return;
    }

    const currentRating = ratings[currentPlayer.id] || 0;
    if (currentRating === 0) {
      toast.error(
        t("feedback.validation.ratingRequired", "Đánh giá bắt buộc"),
        t(
          "feedback.validation.ratingRequiredMessage",
          "Vui lòng chọn số sao đánh giá trước khi gửi.",
        ),
      );
      return;
    }

    await savePlayerRating(
      currentPlayer.id,
      currentRating,
      comments[currentPlayer.id] ?? "",
    );

    if (currentIndex === players.length - 1) {
      await submitBatchAndGoToField();
    } else {
      await advancePlayer();
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    submitBatchMutation.isPending,
    session,
    user?.userId,
    currentPlayer,
    ratings,
    comments,
    currentIndex,
    players.length,
    toast,
    t,
    savePlayerRating,
    advancePlayer,
    submitBatchAndGoToField,
  ]);

  const handleSwipeLeft = useCallback(async () => {
    if (submitBatchMutation.isPending) return;
    if (currentIndex < players.length - 1) {
      await advancePlayer();
      setCurrentIndex((prev) => prev + 1);
    } else {
      await submitBatchAndGoToField();
    }
  }, [
    submitBatchMutation.isPending,
    currentIndex,
    players.length,
    advancePlayer,
    submitBatchAndGoToField,
  ]);

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleReportSubmit = async (
    reportType: ReportType,
    description: string,
  ) => {
    if (!session || !currentPlayer) {
      toast.error(
        t("feedback.report.sessionMissing", "Thiếu thông tin trận"),
        t("feedback.report.sessionMissingMessage", "Không thể gửi báo cáo."),
      );
      return;
    }

    setIsReporting(true);
    try {
      await reportPlayerMutation.mutateAsync({
        reportedUserId: currentPlayer.id,
        reportType,
        description,
        matchId: session.roomId,
      });

      await markPlayerReported(currentPlayer.id);
      setRatings((prev) => {
        const next = { ...prev };
        delete next[currentPlayer.id];
        return next;
      });
      setComments((prev) => {
        const next = { ...prev };
        delete next[currentPlayer.id];
        return next;
      });

      setShowReportModal(false);
      setSelectedReportType(null);
      setReportDescription("");
      setReportError(null);
      toast.info(t("reportModal.success.user"));

      const isLastTeammate = currentIndex === players.length - 1;
      if (isLastTeammate) {
        await submitBatchAndGoToField();
      } else {
        await advancePlayer();
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Error reporting player:", error);
      toast.error(
        getTranslatedError(error?.message) || t("reportModal.error.user"),
      );
    } finally {
      setIsReporting(false);
    }
  };


  const handleBack = () => {
    // Flow feedback chỉ tiến tới, không pop stack / không quay lại màn trước
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleBack}
        >
          {/* <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textSecondary}
          /> */}
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
            {matchSubtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.helpButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* <Ionicons
            name="help-circle-outline"
            size={24}
            color={theme.colors.textSecondary}
          /> */}
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
            {currentIndex + 1}/{players.length}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 108 : 0}
      >
        <ScrollView
          style={styles.keyboardScroll}
          contentContainerStyle={styles.keyboardScrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* Rating Card Container with Stack Effect */}
          <Animated.View style={[styles.cardContainer]}>
            {/* Next Card (behind current) - for smooth transition */}
            {currentIndex < players.length - 1 && (
              <Animated.View style={[styles.nextCardContainer, nextCardStyle]}>
                <SwipeableRatingCard
                  key={`next-${players[currentIndex + 1].id}`}
                  player={players[currentIndex + 1]}
                  rating={ratings[players[currentIndex + 1].id] || 0}
                  comment={comments[players[currentIndex + 1].id] || ""}
                  onRatingChange={() => {}}
                  onCommentChange={() => {}}
                  onSwipeRight={() => {}}
                  onSwipeLeft={() => {}}
                  onValidate={handleValidate}
                  isLastPlayer={currentIndex + 1 === players.length - 1}
                />
              </Animated.View>
            )}

            {/* Current Card (on top) */}
            {currentPlayer && (
              <SwipeableRatingCard
                key={currentPlayer.id}
                player={currentPlayer}
                rating={ratings[currentPlayer.id] || 0}
                comment={comments[currentPlayer.id] || ""}
                onRatingChange={handleRatingChange}
                onCommentChange={handleCommentChange}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
                onReport={handleReport}
                onValidate={handleValidate}
                isLastPlayer={currentIndex === players.length - 1}
                onComplete={submitBatchAndGoToField}
              />
            )}
          </Animated.View>

          {/* Swipe Indicators as Buttons */}
          <View style={styles.swipeIndicators}>
            <TouchableOpacity
              style={styles.swipeIndicator}
              activeOpacity={0.8}
              onPress={handleSwipeLeft}
              disabled={submitBatchMutation.isPending}
            >
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
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.swipeIndicator}
              activeOpacity={0.8}
              onPress={handleSwipeRight}
              disabled={submitBatchMutation.isPending}
            >
              <View
                style={[
                  styles.swipeIcon,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                {submitBatchMutation.isPending ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons name="checkmark" size={24} color="#000" />
                )}
              </View>
              <Text style={[styles.swipeLabel, { color: theme.colors.primary }]}>
                {t("feedback.rating.swipeRight", "VUỐT PHẢI")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tip */}
          <Text style={[styles.tip, { color: theme.colors.textTertiary }]}>
            {t(
              "feedback.rating.tip",
              "Chọn số sao rồi bấm nút xác nhận (hoặc vuốt phải). Bỏ qua người này nếu bạn không muốn chấm. Các đánh giá đã chọn sẽ được gửi khi bạn hoàn tất danh sách.",
            )}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <ReportPlayerModal
        visible={showReportModal}
        isReporting={isReporting}
        selectedReportType={selectedReportType}
        reportDescription={reportDescription}
        reportError={reportError}
        onSelectType={(type) => {
          setSelectedReportType(type);
          setReportError(null);
        }}
        onChangeDescription={(text) => {
          setReportDescription(text);
          setReportError(null);
        }}
        setReportError={setReportError}
        onRequestClose={() => {
          setShowReportModal(false);
          setSelectedReportType(null);
          setReportDescription("");
          setReportError(null);
        }}
        onSubmit={handleReportSubmit}
      />
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
  keyboardAvoid: {
    flex: 1,
  },
  keyboardScroll: {
    flex: 1,
  },
  keyboardScrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
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
});

export default FeedbackRatingScreen;
