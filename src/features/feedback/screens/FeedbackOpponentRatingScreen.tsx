import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useToast } from "@/shared/toast";
import {
  useFeedbackSessionStore,
  type FeedbackPlayer,
} from "../store/feedbackSessionStore";
import { useSubmitMatchFeedbacksBatch, useReportPlayer } from "../hooks";
import {
  DEFAULT_PLAYER_FEEDBACK_ID,
  type MatchFeedbackBatchItem,
  ReportType,
} from "../types/feedback.types";
import { useAuthStore } from "@/features/auth";
import { getImageAvatar } from "@/shared/utils/imageSource";
import { getTranslatedError } from "@/shared/utils/errorTranslations";
import { ReportPlayerModal } from "../components/ReportPlayerModal";
import CommentSection from "../components/CommentSection";

type Nav = NativeStackNavigationProp<RootStackParamList, "FeedbackOpponentRating">;

interface Props {
  navigation: Nav;
}

const FeedbackOpponentRatingScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const session = useFeedbackSessionStore((s) => s.session);
  const setStep = useFeedbackSessionStore((s) => s.setStep);
  const markPlayerReported = useFeedbackSessionStore((s) => s.markPlayerReported);
  const user = useAuthStore((s) => s.user);
  const submitBatchMutation = useSubmitMatchFeedbacksBatch();
  const reportPlayerMutation = useReportPlayer();

  // Report modal state
  const [reportTargetPlayer, setReportTargetPlayer] = useState<FeedbackPlayer | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);

  const opponents: FeedbackPlayer[] = useMemo(
    () => session?.opponents ?? [],
    [session?.opponents],
  );

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [modalPlayer, setModalPlayer] = useState<FeedbackPlayer | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");

  const handleReport = (player: FeedbackPlayer) => {
    setReportTargetPlayer(player);
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reportType: ReportType, description: string) => {
    if (!session || !reportTargetPlayer) {
      toast.error(
        t("feedback.report.sessionMissing", "Thiếu thông tin trận"),
        t("feedback.report.sessionMissingMessage", "Không thể gửi báo cáo."),
      );
      return;
    }
    setIsReporting(true);
    try {
      await reportPlayerMutation.mutateAsync({
        reportedUserId: reportTargetPlayer.userId,
        reportType,
        description,
        matchId: session.roomId,
      });
      await markPlayerReported(reportTargetPlayer.userId);
      // Clear rating/comment for reported player
      setRatings((prev) => {
        const next = { ...prev };
        delete next[reportTargetPlayer.userId];
        return next;
      });
      setComments((prev) => {
        const next = { ...prev };
        delete next[reportTargetPlayer.userId];
        return next;
      });
      setShowReportModal(false);
      setReportTargetPlayer(null);
      setSelectedReportType(null);
      setReportDescription("");
      setReportError(null);
      toast.info(t("reportModal.success.user"));
    } catch (error: any) {
      console.error("Error reporting opponent:", error);
      toast.error(
        getTranslatedError(error?.message) || t("reportModal.error.user"),
      );
    } finally {
      setIsReporting(false);
    }
  };

  const navigateToFieldRating = useCallback(async () => {
    await setStep("fieldRating");
    navigation.replace("FeedbackFieldRating", {
      venueId: session?.venue?.venueId,
    });
  }, [navigation, session?.venue?.venueId, setStep]);

  const openModal = (player: FeedbackPlayer) => {
    setModalPlayer(player);
    setDraftRating(ratings[player.userId] ?? 0);
    setDraftComment(comments[player.userId] ?? "");
  };

  const closeModal = () => {
    setModalPlayer(null);
    setDraftRating(0);
    setDraftComment("");
  };

  const confirmModal = () => {
    if (!modalPlayer) return;
    if (draftRating === 0) {
      toast.error(
        t("feedback.validation.ratingRequired", "Đánh giá bắt buộc"),
        t(
          "feedback.validation.ratingRequiredMessage",
          "Vui lòng chọn số sao đánh giá trước khi xác nhận.",
        ),
      );
      return;
    }
    setRatings((prev) => ({ ...prev, [modalPlayer.userId]: draftRating }));
    setComments((prev) => ({ ...prev, [modalPlayer.userId]: draftComment }));
    closeModal();
  };

  const handleSubmit = useCallback(async () => {
    if (!user?.userId || !session) {
      toast.error(t("feedback.rating.sessionErrorTitle", "Thiếu thông tin"));
      return;
    }

    const feedbacks: MatchFeedbackBatchItem[] = opponents
      .filter((p) => (ratings[p.userId] ?? 0) > 0)
      .map((p) => ({
        feedbackId: DEFAULT_PLAYER_FEEDBACK_ID,
        revieweeId: p.userId,
        comment: comments[p.userId] ?? "",
        rating: ratings[p.userId],
      }));

    if (feedbacks.length === 0) {
      await navigateToFieldRating();
      return;
    }

    try {
      await submitBatchMutation.mutateAsync({
        matchId: session.roomId,
        reviewerId: user.userId,
        feedbacks,
      });
      await navigateToFieldRating();
    } catch (error: any) {
      toast.error(
        t("feedback.rating.submitErrorTitle", "Gửi đánh giá thất bại"),
        getTranslatedError(error?.message) ||
          t("feedback.rating.submitErrorMessage", "Vui lòng thử lại sau."),
      );
    }
  }, [
    user?.userId,
    session,
    opponents,
    ratings,
    comments,
    submitBatchMutation,
    navigateToFieldRating,
    toast,
    t,
  ]);

  const ratedCount = opponents.filter((p) => (ratings[p.userId] ?? 0) > 0).length;

  const renderItem = ({ item }: { item: FeedbackPlayer }) => {
    const rated = (ratings[item.userId] ?? 0) > 0;
    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.surface,
            borderColor: rated ? `${theme.colors.primary}55` : theme.colors.border,
          },
        ]}
      >
        <Image
          source={getImageAvatar({ uri: item.avatarUrl ?? "" })}
          style={styles.avatar}
        />
        <View style={styles.rowInfo}>
          <Text
            style={[styles.rowName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.fullName}
          </Text>
          {!!item.position && (
            <Text style={[styles.rowPosition, { color: theme.colors.textSecondary }]}>
              {item.position.toUpperCase()}
            </Text>
          )}
          {rated && (
            <View style={styles.ratedStarsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= ratings[item.userId] ? "star" : "star-outline"}
                  size={12}
                  color={theme.colors.primary}
                />
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.rateBtn,
            rated
              ? {
                  backgroundColor: `${theme.colors.primary}22`,
                  borderColor: theme.colors.primary,
                }
              : {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
          ]}
          onPress={() => openModal(item)}
        >
          <Ionicons
            name={rated ? "star" : "star-outline"}
            size={14}
            color={rated ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: rated ? theme.colors.primary : theme.colors.textSecondary,
              marginLeft: 4,
            }}
          >
            {rated
              ? t("feedback.opponent.rated", "Đã đánh giá")
              : t("feedback.opponent.rate", "Đánh giá")}
          </Text>
        </TouchableOpacity>
        {/* Report button */}
        <TouchableOpacity
          style={styles.reportRowBtn}
          onPress={() => handleReport(item)}
          hitSlop={8}
        >
          <Ionicons name="flag-outline" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t("feedback.opponent.title", "Đánh giá Đối thủ")}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {t("feedback.opponent.subtitle", "Bạn cảm thấy thế nào về đội bạn trận này?")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={navigateToFieldRating}
          style={styles.skipBtn}
          disabled={submitBatchMutation.isPending}
        >
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            {t("common.buttons.skip", "Bỏ qua")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={opponents}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <Text
            style={[styles.listHint, { color: theme.colors.textSecondary }]}
          >
            {t(
              "feedback.opponent.listHint",
              'Nhấn "Đánh giá" để chấm điểm từng người. Bạn có thể bỏ qua hoàn toàn bước này.',
            )}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={48}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t("feedback.opponent.empty", "Không có thành viên đội đối phương.")}
            </Text>
          </View>
        }
      />

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          {
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.skipBarBtn, { borderColor: theme.colors.border }]}
          onPress={navigateToFieldRating}
          disabled={submitBatchMutation.isPending}
        >
          <Text style={[styles.skipBarText, { color: theme.colors.textSecondary }]}>
            {t("common.buttons.skip", "Bỏ qua")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor:
                ratedCount > 0 ? theme.colors.primary : `${theme.colors.primary}66`,
            },
          ]}
          onPress={handleSubmit}
          disabled={submitBatchMutation.isPending}
        >
          {submitBatchMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitText}>
              {ratedCount > 0
                ? t("feedback.opponent.submitWithCount", {
                    count: ratedCount,
                    defaultValue: `Gửi ${ratedCount} đánh giá`,
                  })
                : t("feedback.opponent.continue", "Tiếp tục")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Rating Modal — absolute overlay */}
      {modalPlayer && (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKAV}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={closeModal}
            />
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              {/* Modal header */}
              <View style={styles.modalPlayerRow}>
                <Image
                  source={getImageAvatar({ uri: modalPlayer.avatarUrl ?? "" })}
                  style={styles.modalAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.modalName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {modalPlayer.fullName}
                  </Text>
                  {!!modalPlayer.position && (
                    <Text
                      style={[
                        styles.modalPosition,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {modalPlayer.position.toUpperCase()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={closeModal} hitSlop={8}>
                  <Ionicons
                    name="close"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Stars */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>
                {t("feedback.opponent.ratingLabel", "Chấm điểm")}
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setDraftRating(n)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={n <= draftRating ? "star" : "star-outline"}
                      size={36}
                      color={
                        n <= draftRating
                          ? theme.colors.primary
                          : theme.colors.textTertiary
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>
                {t("feedback.opponent.commentLabel", "Nhận xét (tùy chọn)")}
              </Text>
              <CommentSection
                rating={draftRating}
                comment={draftComment}
                onCommentChange={setDraftComment}
                playerRole={modalPlayer?.position ?? ""}
                placeholder={t(
                  "feedback.opponent.commentPlaceholder",
                  "Nhận xét về cầu thủ này...",
                )}
                maxHeight={110}
              />

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.modalCancelBtn,
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={closeModal}
                >
                  <Text
                    style={[styles.modalBtnText, { color: theme.colors.text }]}
                  >
                    {t("common.buttons.cancel", "Hủy")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.modalConfirmBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={confirmModal}
                >
                  <Text style={[styles.modalBtnText, { color: "#000" }]}>
                    {t("common.buttons.confirm", "Xác nhận")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>

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
          setReportTargetPlayer(null);
          setSelectedReportType(null);
          setReportDescription("");
          setReportError(null);
        }}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    gap: 2,
  },
  skipText: { fontSize: 14, fontWeight: "500" },
  listContent: { padding: 16, paddingBottom: 8 },
  listHint: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, flexShrink: 0 },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 15, fontWeight: "600" },
  rowPosition: { fontSize: 12, marginTop: 2 },
  ratedStarsRow: { flexDirection: "row", gap: 1, marginTop: 4 },
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  reportRowBtn: {
    padding: 6,
    flexShrink: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  skipBarBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBarText: { fontSize: 15, fontWeight: "600" },
  submitBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#000" },
  // Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  modalKAV: {
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modalAvatar: { width: 48, height: 48, borderRadius: 24 },
  modalName: { fontSize: 16, fontWeight: "700" },
  modalPosition: { fontSize: 12, marginTop: 2 },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: { borderWidth: 1 },
  modalConfirmBtn: {},
  modalBtnText: { fontSize: 15, fontWeight: "600" },
});

export default FeedbackOpponentRatingScreen;
