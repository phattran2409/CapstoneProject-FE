import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { EmptyState, ErrorState } from "@/shared/components";
import { getRelativeTime } from "@/shared/utils/dateUtils";
import {
  useReceivedFeedbacks,
  useReplyToReceivedFeedback,
} from "../hooks/useReceivedFeedbacks";
import type { ReceivedFeedbackItem } from "../types/feedback.types";
import { RECEIVED_FEEDBACK_REPLY_MAX_LENGTH } from "../types/feedback.types";
import { useToast } from "@/shared/toast";

type Nav = NativeStackNavigationProp<RootStackParamList, "ReceivedFeedback">;

type TimeFilter = "all" | "7d" | "30d" | "90d";

interface Props {
  navigation: Nav;
}

const ReceivedFeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, isLoading, isError, error, refetch } = useReceivedFeedbacks();
  const { mutate: sendReply, isPending: isSending } = useReplyToReceivedFeedback();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const items = data?.items ?? [];

  const filteredItems = useMemo(() => {
    let list = [...items];
    const q = matchSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const label = (i.matchLabel || "").toLowerCase();
        const room = (i.roomId || "").toLowerCase();
        return label.includes(q) || room.includes(q);
      });
    }
    if (ratingFilter !== "all") {
      list = list.filter(
        (i) => Math.round(Math.min(5, Math.max(0, i.rating))) === ratingFilter,
      );
    }
    if (timeFilter !== "all") {
      const days = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 90;
      const cut = Date.now() - days * 86400_000;
      list = list.filter((i) => {
        const ts = new Date(i.receivedAt).getTime();
        return !Number.isNaN(ts) && ts >= cut;
      });
    }
    return list.sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
  }, [items, matchSearchQuery, ratingFilter, timeFilter]);

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

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
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
    const hasResponse = item.myResponse != null && item.myResponse.length > 0;

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
          <View style={{ flex: 1 }}>
            <Text style={[styles.reviewer, { color: theme.colors.text }]}>
              {item.reviewerName || t("receivedFeedback.anonymous")}
            </Text>
            <Text
              style={[styles.matchLabel, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.matchLabel || item.roomId}
            </Text>
          </View>
        </View>
        {renderStars(item.rating)}
        {item.sentimentLabel ? (
          <View style={styles.sentimentRow}>
            <Text style={[styles.sentimentText, { color: theme.colors.neonGreen }]}>
              {`Sentiment: ${item.sentimentLabel}${
                typeof item.sentimentScore === "number"
                  ? ` (${item.sentimentScore.toFixed(2)})`
                  : ""
              }`}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.comment, { color: theme.colors.text }]}>
          {item.comment || "—"}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {item.receivedAt
            ? getRelativeTime(item.receivedAt)
            : t("receivedFeedback.timeUnknown")}
        </Text>

        {hasResponse ? (
          <View
            style={[
              styles.responseBox,
              { borderColor: theme.colors.neonGreen, backgroundColor: `${theme.colors.neonGreen}18` },
            ]}
          >
            <Text style={[styles.responseLabel, { color: theme.colors.neonGreen }]}>
              {t("receivedFeedback.yourResponse")}
            </Text>
            <Text style={{ color: theme.colors.text }}>{item.myResponse}</Text>
            {item.respondedAt ? (
              <Text style={[styles.time, { marginTop: 6 }]}>
                {getRelativeTime(item.respondedAt)}
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
              onChangeText={(t) => setDraft(item.feedbackId, t)}
              editable={!isSending}
            />
            <View style={styles.inputFooter}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {draft.length}/{RECEIVED_FEEDBACK_REPLY_MAX_LENGTH}
              </Text>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: theme.colors.neonGreen, opacity: isSending ? 0.6 : 1 },
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
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border },
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
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {t("receivedFeedback.title")}
          </Text>
          <View style={styles.headerSideSlot} />
          <TouchableOpacity onPress={() => navigation.navigate("GivenFeedback")}>
            <Ionicons name="paper-plane-outline" size={24} color={theme.colors.neonGreen} />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.headerSearchRow,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.headerSearchInput, { color: theme.colors.text }]}
            placeholder={t("receivedFeedback.matchSearchPlaceholder")}
            placeholderTextColor={theme.colors.textSecondary}
            value={matchSearchQuery}
            onChangeText={setMatchSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {matchSearchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setMatchSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {!isLoading && !isError && items.length > 0 && (
        <View style={styles.filtersBlock}>
          <Text style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}>
            {t("receivedFeedback.filterTime")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {(
              [
                ["all", t("receivedFeedback.timeAll")] as const,
                ["7d", t("receivedFeedback.time7d")] as const,
                ["30d", t("receivedFeedback.time30d")] as const,
                ["90d", t("receivedFeedback.time90d")] as const,
              ] as const
            ).map(([key, label]) => (
              <View key={key}>{renderChip(label, timeFilter === key, () => setTimeFilter(key))}</View>
            ))}
          </ScrollView>

          <Text style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}>
            {t("receivedFeedback.filterRating")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
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
      )}

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.neonGreen} />
        </View>
      )}

      {isError && (
        <ErrorState
          error={
            error instanceof Error
              ? error.message
              : t("receivedFeedback.loadError")
          }
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && filteredItems.length === 0 && (
        <EmptyState
          icon="chatbox-ellipses-outline"
          title={
            items.length === 0
              ? t("receivedFeedback.emptyTitle")
              : matchSearchQuery.trim()
                ? t("receivedFeedback.emptySearchTitle")
                : t("receivedFeedback.emptyFilterTitle")
          }
          description={
            items.length === 0
              ? t("receivedFeedback.emptyDesc")
              : matchSearchQuery.trim()
                ? t("receivedFeedback.emptySearchDesc")
                : t("receivedFeedback.emptyFilterDesc")
          }
        />
      )}

      {!isLoading && !isError && filteredItems.length > 0 && (
        <FlatList
          data={filteredItems}
          keyExtractor={(i) => i.feedbackId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  title: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },
  ratingChipStars: { flexDirection: "row", gap: 1, alignItems: "center" },
  subtitle: { fontSize: 13, marginTop: 8, marginBottom: 4 },
  filtersBlock: { paddingBottom: 8 },
  filterSectionTitle: { fontSize: 12, fontWeight: "600", marginLeft: 16, marginTop: 8, marginBottom: 6 },
  chipRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 4,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  reviewer: { fontSize: 16, fontWeight: "700" },
  matchLabel: { fontSize: 13, marginTop: 2 },
  criteriaPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  starsRow: { flexDirection: "row", gap: 2, marginBottom: 8 },
  sentimentRow: { marginBottom: 6 },
  sentimentText: { fontSize: 12, fontWeight: "600" },
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
});

export default ReceivedFeedbackScreen;
