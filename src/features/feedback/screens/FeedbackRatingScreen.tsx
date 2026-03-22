import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { useFeedbackSessionStore } from "../store/feedbackSessionStore";
import { useSubmitMatchFeedbacksBatch, useReportPlayer } from "../hooks/useFeedback";
import {
  DEFAULT_PLAYER_FEEDBACK_ID,
  type MatchFeedbackBatchItem,
} from "../types/feedback.types";
import { useAuthStore } from "@/features/auth";

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

  const session = useFeedbackSessionStore((s) => s.session);
  const savePlayerRating = useFeedbackSessionStore((s) => s.savePlayerRating);
  const advancePlayer = useFeedbackSessionStore((s) => s.advancePlayer);
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

  const replaceWithFieldRating = useCallback(() => {
    navigation.replace("FeedbackFieldRating", {
      venueId: session?.venue?.venueId,
    });
  }, [navigation, session?.venue?.venueId]);

  /** Không có đồng đội → bỏ qua bước đánh giá người */
  useEffect(() => {
    if (!session || players.length > 0) return;
    let cancelled = false;
    void (async () => {
      await setStep("fieldRating");
      if (!cancelled) {
        replaceWithFieldRating();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, players.length, setStep, replaceWithFieldRating]);

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
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
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
    if (!session || !user?.userId) {
      toast.error(
        t("feedback.rating.sessionErrorTitle", "Thiếu thông tin"),
        t(
          "feedback.rating.sessionErrorMessage",
          "Không thể gửi đánh giá. Vui lòng quay lại phòng và thử lại.",
        ),
      );
      return;
    }

    const feedbacks: MatchFeedbackBatchItem[] = players
      .map((p) => ({
        feedbackId: DEFAULT_PLAYER_FEEDBACK_ID,
        revieweeId: p.id,
        comment: comments[p.id] ?? "",
        rating: ratings[p.id] ?? 0,
      }))
      .filter((f) => f.rating > 0);

    if (feedbacks.length === 0) {
      await setStep("fieldRating");
      replaceWithFieldRating();
      return;
    }

    try {
      await submitBatchMutation.mutateAsync({
        matchId: session.roomId,
        reviewerId: user.userId,
        feedbacks,
      });
      await setStep("fieldRating");
      replaceWithFieldRating();
    } catch {
      toast.error(
        t("feedback.rating.submitErrorTitle", "Gửi đánh giá thất bại"),
        t(
          "feedback.rating.submitErrorMessage",
          "Vui lòng thử lại sau.",
        ),
      );
    }
  }, [
    session,
    user?.userId,
    players,
    comments,
    ratings,
    submitBatchMutation,
    setStep,
    replaceWithFieldRating,
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
    reportType: string,
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

      setShowReportModal(false);
      setSelectedReportType(null);
      setReportDescription("");
      setReportError(null);
      toast.info(t("reportModal.success.user"));
    } catch (error) {
      console.error("Error reporting player:", error);
      toast.error(t("reportModal.error.user"));
    } finally {
      setIsReporting(false);
    }
  };


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
            {t("feedback.rating.subtitle", "TRẬN ĐẤU CHỦ NHẬT")}
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
          "Mẹo: Đánh giá trung thực giúp hệ thống cân bằng đội hình tốt hơn.",
        )}
      </Text>

      {/* Custom Report Overlay for player */}
      {showReportModal && (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t("feedback.report.title", "Báo cáo người chơi")}
            </Text>
            <Text
              style={[
                styles.modalDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t(
                "feedback.report.description",
                "Vui lòng cho chúng tôi biết lý do bạn muốn báo cáo người chơi này.",
              )}
            </Text>

            <ScrollView style={styles.reportReasons}>
              {["inappropriate_behavior", "harassment", "toxic_behavior", "AFK", "other"].map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.reasonItem,
                      {
                        borderColor:
                          selectedReportType === type
                            ? theme.colors.primary
                            : theme.colors.border,
                        backgroundColor:
                          selectedReportType === type
                            ? `${theme.colors.primary}20`
                            : theme.colors.background,
                      },
                    ]}
                    onPress={() => {
                      setSelectedReportType(type);
                      setReportError(null);
                    }}
                    disabled={isReporting}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        {
                          color:
                            selectedReportType === type
                              ? theme.colors.text
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {t(`reportModal.reasons.user.${type}`)}
                    </Text>
                    {selectedReportType === type && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>

            <Text
              style={[styles.modalDescription, { color: theme.colors.text }]}
            >
              {t("feedback.report.descriptionLabel", "Mô tả chi tiết")}
            </Text>
            <TextInput
              style={[
                styles.modalDescription,
                {
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  borderColor: reportError
                    ? theme.colors.error
                    : theme.colors.border,
                  color: theme.colors.text,
                  minHeight: 80,
                  textAlignVertical: "top",
                },
              ]}
              placeholder={t(
                "feedback.report.descriptionPlaceholder",
                "Nhập mô tả chi tiết về hành vi vi phạm...",
              )}
              placeholderTextColor={theme.colors.textTertiary}
              value={reportDescription}
              onChangeText={(text) => {
                setReportDescription(text);
                setReportError(null);
              }}
              editable={!isReporting}
              multiline
              maxLength={500}
            />

            {reportError && (
              <Text style={{ color: theme.colors.error, marginTop: 8 }}>
                {reportError}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => {
                  if (!isReporting) {
                    setShowReportModal(false);
                    setSelectedReportType(null);
                    setReportDescription("");
                    setReportError(null);
                  }
                }}
                disabled={isReporting}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  {t("common.buttons.cancel", "Hủy")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  { backgroundColor: theme.colors.error },
                ]}
                onPress={async () => {
                  if (!selectedReportType) {
                    setReportError(
                      t(
                        "feedback.report.validation.typeRequired",
                        "Vui lòng chọn lý do báo cáo.",
                      ),
                    );
                    return;
                  }
                  if (!reportDescription.trim()) {
                    setReportError(
                      t(
                        "feedback.report.validation.descriptionRequired",
                        "Vui lòng nhập mô tả chi tiết.",
                      ),
                    );
                    return;
                  }

                  await handleReportSubmit(
                    selectedReportType,
                    reportDescription.trim(),
                  );
                }}
                disabled={isReporting}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: "#fff" },
                  ]}
                >
                  {isReporting
                    ? t("feedback.report.submitting", "Đang gửi...")
                    : t("feedback.report.submit", "Gửi báo cáo")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 100,
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
