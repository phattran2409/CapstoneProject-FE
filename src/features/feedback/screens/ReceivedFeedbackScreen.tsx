import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  EmptyState,
  ErrorState,
  ExpandableText,
  ListSkeleton,
  LoadingMoreIndicator,
  ReportModal,
} from "@/shared/components";
import { ThemedText } from "@/shared/components/themed/ThemedText";
import { getRelativeTime } from "@/shared/utils/dateUtils";
import {
  useReceivedFeedbacks,
  useReplyToReceivedFeedback,
} from "../hooks/useReceivedFeedbacks";
import type { ReceivedFeedbackItem } from "../types/feedback.types";
import {
  RECEIVED_FEEDBACK_REPLY_MAX_LENGTH,
  ReportType,
} from "../types/feedback.types";
import { useToast } from "@/shared/toast";
import { getImageAvatar } from "@/shared/utils/imageSource";
import { useReportPlayer } from "../hooks";
import { getTranslatedError } from "@/shared/utils/errorTranslations";
import { BadgesSentiment } from "../components/BadgesSentiment";

/** Khóa lý do trong `ReportModal` (type=user) → enum gửi API */
function mapUserReasonToReportType(reason: string): ReportType {
  switch (reason) {
    case "inappropriate_behavior":
      return ReportType.InappropriateBehavior;
    case "harassment":
      return ReportType.Harassment;
    case "spam":
      return ReportType.Spamming;
    case "fake_account":
      return ReportType.FakeAccount;
    case "scam":
      return ReportType.Scamming;
    case "other":
    default:
      return ReportType.InappropriateBehavior;
  }
}

type Nav = NativeStackNavigationProp<RootStackParamList, "ReceivedFeedback">;

type TimeFilter = "all" | "7d" | "30d" | "90d";

const getFromDate = (timeFilter: TimeFilter): string | undefined => {
  if (timeFilter === "all") return undefined;
  const days = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 86400_000).toISOString();
};

interface Props {
  navigation: Nav;
}

const ReceivedFeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [reportModalVisible, setReportModalVisible] = useState({
    visible: false,
    userId: "",
    matchId: "",
  });
  const fromDate = useMemo(() => getFromDate(timeFilter), [timeFilter]);
  const beRating = ratingFilter === "all" ? undefined : ratingFilter;
  
  const {
    receivedFeedbacks,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
  } = useReceivedFeedbacks({
    pageSize: 10,
    fromDate,
    rating: beRating,
  });
  
  const {
    mutateAsync: reportPlayerAsync,
    isPending: isReportingFeedback,
  } = useReportPlayer();

  const { mutate: sendReply, isPending: isSending } = useReplyToReceivedFeedback();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const setDraft = useCallback((id: string, text: string) => {
    setDrafts((d) => ({ ...d, [id]: text }));
  }, []);

  const handleSendReply = useCallback(
    (item: ReceivedFeedbackItem) => {
      const text = (drafts[item.feedbackId] ?? "").trim();
      if (!text) {
        toast.error(t("receivedFeedback.replyEmpty"));
        return;
      }
      if (text.length > RECEIVED_FEEDBACK_REPLY_MAX_LENGTH) {
        toast.error(t("receivedFeedback.replyTooLong"));
        return;
      }
      sendReply(
        { feedbackId: item.feedbackId, responseText: text },
        {
          onSuccess: () => {
            toast.success(t("receivedFeedback.replySent"));
            setDrafts((d) => {
              const next = { ...d };
              delete next[item.feedbackId];
              return next;
            });
          },
          onError: () => {
            toast.error(t("receivedFeedback.replyError"));
          },
        },
      );
    },
    [drafts, sendReply, toast, t],
  );

  const renderStars = (rating: number) => {
    const full = Math.round(Math.min(5, Math.max(0, rating)));
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons
            key={n}
            name={n <= full ? "star" : "star-outline"}
            size={16}
            color={theme.colors.neonGreen}
          />
        ))}
      </View>
    );
  };
  const handleReportModalVisible = (
    visible: boolean,
    userId = "",
    matchId = "",
  ) => {
    setReportModalVisible({ visible, userId, matchId });
  };

  const renderRatingChip = (stars: number, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? theme.colors.neonGreen : theme.colors.border,
          backgroundColor: selected
            ? `${theme.colors.neonGreen}33`
            : theme.colors.surface,
        },
      ]}
    >
      <View style={styles.ratingChipStars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons
            key={n}
            name={n <= stars ? "star" : "star-outline"}
            size={14}
            color={theme.colors.neonGreen}
          />
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? theme.colors.neonGreen : theme.colors.border,
          backgroundColor: selected
            ? `${theme.colors.neonGreen}33`
            : theme.colors.surface,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          color: selected ? theme.colors.neonGreen : theme.colors.textSecondary,
          fontWeight: selected ? "700" : "500",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: ReceivedFeedbackItem }) => {
    const draft = drafts[item.feedbackId] ?? "";
    const hasResponse =
      item.revieweeResponse != null && item.revieweeResponse.length > 0;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Image
              source={getImageAvatar({ uri: item.reviewerAvatarUrl || "" })}
              style={styles.cardAvatar}
            />
            <Text
              style={[styles.reviewer, { color: theme.colors.text }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.reviewerName || t("receivedFeedback.anonymous")}
            </Text>
          </View>
          <View>
            <TouchableOpacity style={[styles.viewDetailBtn, { borderColor: theme.colors.neonGreen, backgroundColor: `${theme.colors.neonGreen}18` }]} onPress={() => navigation.navigate("RoomInformation", { roomId: item.matchId })}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.neonGreen + "5A"} />
              <Text style={{ color: theme.colors.neonGreen, fontSize: 12, fontWeight: "600" }}>{t("common.buttons.viewMatchDetail")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderStars(item.rating)}
        {item.sentimentLabel ? (
          <View style={styles.sentimentRow}>
            <BadgesSentiment sentimentLabel={item.sentimentLabel} t={t} />
            {typeof item.sentimentScore === "number" ? (
              <Text
                style={[styles.sentimentScore, { color: theme.colors.textSecondary }]}
              >
                {` (${item.sentimentScore.toFixed(2)})`}
              </Text>
            ) : null}
          </View>
        ) : null}
        <ExpandableText text={item.comment || "—"} maxLines={3} textStyle={[styles.comment, { color: theme.colors.text }]} />
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {item.createdAt
            ? getRelativeTime(item.createdAt)
            : t("receivedFeedback.timeUnknown")}
        </Text>

        {hasResponse ? (
          <View
            style={[
              styles.responseBox,
              {
                borderColor: theme.colors.neonGreen,
                backgroundColor: `${theme.colors.neonGreen}18`,
              },
            ]}
          >
            <Text style={[styles.responseLabel, { color: theme.colors.neonGreen }]}>
              {t("receivedFeedback.yourResponse")}
            </Text>
            <ExpandableText text={item.revieweeResponse || "—"} maxLines={3} textStyle={{ color: theme.colors.text }} />
            {item.responseDate ? (
              <Text style={[styles.time, { marginTop: 6 }]}>
                {getRelativeTime(item.responseDate)}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={{ marginTop: 12 }}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholder={t("receivedFeedback.replyPlaceholder")}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              maxLength={RECEIVED_FEEDBACK_REPLY_MAX_LENGTH}
              value={draft}
              onChangeText={(text) => setDraft(item.feedbackId, text)}
              editable={!isSending}
            />
            <View style={styles.inputFooter}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {draft.length}/{RECEIVED_FEEDBACK_REPLY_MAX_LENGTH}
              </Text>
              <View style={styles.footerCtn}>
                <TouchableOpacity style={[styles.reportBtn, { borderColor: theme.colors.error, backgroundColor: `${theme.colors.error}18` }]}
                onPress={() =>
                  handleReportModalVisible(true, item.reviewerId, item.matchId)
                }
                >
                  <Ionicons name="warning-outline" size={24} color={theme.colors.error} />
                  <Text style={{ fontSize: 12, color: theme.colors.error }}>
                    {t("common.buttons.report")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    {
                      backgroundColor: theme.colors.neonGreen,
                      opacity: isSending ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => handleSendReply(item)}
                  disabled={isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={{ fontWeight: "700", color: "#000" }}>
                      {t("receivedFeedback.sendReply")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    const hasActiveFilter = timeFilter !== "all" || ratingFilter !== "all";
    return (
      <EmptyState
        icon="chatbox-ellipses-outline"
        title={hasActiveFilter ? t("receivedFeedback.emptyFilterTitle") : t("receivedFeedback.emptyTitle")}
        description={hasActiveFilter ? t("receivedFeedback.emptyFilterDesc") : t("receivedFeedback.emptyDesc")}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.headerSideSlot}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold" variant="primary" style={{ flex: 1, textAlign: "center" }}>
            {t("receivedFeedback.title")}
          </ThemedText>
          <TouchableOpacity
            onPress={() => navigation.navigate("GivenFeedback")}
            style={styles.headerSideSlot}
          >
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={theme.colors.neonGreen}
            />
          </TouchableOpacity>
        </View>
      </View>

        <View style={styles.filtersBlock}>
          <Text
            style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}
          >
            {t("receivedFeedback.filterTime")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {(
              [
                ["all", t("receivedFeedback.timeAll")] as const,
                ["7d", t("receivedFeedback.time7d")] as const,
                ["30d", t("receivedFeedback.time30d")] as const,
                ["90d", t("receivedFeedback.time90d")] as const,
              ] as const
            ).map(([key, label]) => (
              <View key={key}>
                {renderChip(label, timeFilter === key, () => setTimeFilter(key))}
              </View>
            ))}
          </ScrollView>

          <Text
            style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}
          >
            {t("receivedFeedback.filterRating")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {renderChip(t("receivedFeedback.ratingAll"), ratingFilter === "all", () =>
              setRatingFilter("all"),
            )}
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <View key={n}>
                {renderRatingChip(n, ratingFilter === n, () => setRatingFilter(n))}
              </View>
            ))}
          </ScrollView>
        </View>
      

      {loading && <ListSkeleton />}

      {error && <ErrorState error={error} onRetry={refresh} />}

      {!loading && !error && (
        <FlatList
          data={receivedFeedbacks}
          keyExtractor={(i) => i.feedbackId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
      <ReportModal
        visible={reportModalVisible.visible}
        type="user"
        isLoading={isReportingFeedback}
        onClose={() => handleReportModalVisible(false, "", "")}
        onSubmit={async (reason, customReason) => {
          const { userId, matchId } = reportModalVisible;
          if (!userId || !matchId) {
            toast.error(
              t("feedback.report.sessionMissing", "Thiếu thông tin"),
              t(
                "feedback.report.sessionMissingMessage",
                "Không thể gửi báo cáo.",
              ),
            );
            return;
          }
          const reportType = mapUserReasonToReportType(reason);
          const description = (customReason?.trim() || reason).trim();
          try {
            await reportPlayerAsync({
              reportedUserId: userId,
              reportType,
              description,
              matchId,
            });
            toast.success(t("reportModal.success.user"));
            handleReportModalVisible(false, "", "");
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            toast.error(
              getTranslatedError(message) || t("reportModal.error.user"),
            );
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    gap: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSideSlot: { width: 40, alignItems: "center", justifyContent: "center" },
  headerSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filtersBlock: { paddingBottom: 8 },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 4,
  },
  ratingChipStars: { flexDirection: "row", gap: 1, alignItems: "center" },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardHeaderAction: {
    flexShrink: 0,
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  reviewer: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    minWidth: 0,
  },
  matchLabel: { fontSize: 13, marginTop: 2 },
  starsRow: { flexDirection: "row", gap: 2, marginBottom: 8 },
  sentimentRow: {
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  sentimentScore: { fontSize: 12, fontWeight: "600" },
  comment: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 12, color: "#888", marginTop: 8 },
  responseBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  responseLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewDetailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
  },
  viewDetailBtnLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },
  footerCtn :  {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
});

export default ReceivedFeedbackScreen;
