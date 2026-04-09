import React, { useMemo, useState } from "react";
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
import { useGivenFeedbacks } from "../hooks/useGivenFeedbacks";
import type { GivenFeedbackItem } from "../types/feedback.types";

type Nav = NativeStackNavigationProp<RootStackParamList, "GivenFeedback">;

type TimeFilter = "all" | "7d" | "30d" | "90d";

interface Props {
  navigation: Nav;
}

const GivenFeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useGivenFeedbacks();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [matchSearchQuery, setMatchSearchQuery] = useState("");

  const items = data?.items ?? [];

  const filteredItems = useMemo(() => {
    let list = [...items];
    const q = matchSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const label = (i.matchLabel || "").toLowerCase();
        const room = (i.roomId || "").toLowerCase();
        const name = (i.revieweeName || "").toLowerCase();
        return label.includes(q) || room.includes(q) || name.includes(q);
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
        const ts = new Date(i.givenAt).getTime();
        return !Number.isNaN(ts) && ts >= cut;
      });
    }
    return list.sort(
      (a, b) => new Date(b.givenAt).getTime() - new Date(a.givenAt).getTime(),
    );
  }, [items, matchSearchQuery, ratingFilter, timeFilter]);

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

  const renderItem = ({ item }: { item: GivenFeedbackItem }) => {
    const hasTheirReply =
      item.theirResponse != null && item.theirResponse.trim().length > 0;

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
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {item.revieweeName || t("givenFeedback.anonymous")}
            </Text>
            <Text
              style={[styles.matchLabel, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.matchLabel || item.roomId}
            </Text>
          </View>
        </View>
        <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
          {t("givenFeedback.yourRating")}
        </Text>
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
          {item.myComment || "—"}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {item.givenAt
            ? getRelativeTime(item.givenAt)
            : t("givenFeedback.timeUnknown")}
        </Text>

        {hasTheirReply ? (
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
              {t("givenFeedback.theirReply")}
            </Text>
            <Text style={{ color: theme.colors.text }}>{item.theirResponse}</Text>
            {item.theyRespondedAt ? (
              <Text style={[styles.time, { marginTop: 6 }]}>
                {getRelativeTime(item.theyRespondedAt)}
              </Text>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.pendingBox,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
            ]}
          >
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              {t("givenFeedback.noReplyYet")}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.headerSideSlot}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {t("givenFeedback.title")}
          </Text>
          <View style={styles.headerSideSlot} />
        </View>
        {/* <View
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
            placeholder={t("givenFeedback.matchSearchPlaceholder")}
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
        </View> */}
      </View>


      {/* {!isLoading && !isError && items.length > 0 && (
        <View style={styles.filtersBlock}>
          <Text style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}>
            {t("givenFeedback.filterTime")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {(
              [
                ["all", t("givenFeedback.timeAll")] as const,
                ["7d", t("givenFeedback.time7d")] as const,
                ["30d", t("givenFeedback.time30d")] as const,
                ["90d", t("givenFeedback.time90d")] as const,
              ] as const
            ).map(([key, label]) => (
              <View key={key}>{renderChip(label, timeFilter === key, () => setTimeFilter(key))}</View>
            ))}
          </ScrollView>

          <Text style={[styles.filterSectionTitle, { color: theme.colors.textSecondary }]}>
            {t("givenFeedback.filterRating")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {renderChip(t("givenFeedback.ratingAll"), ratingFilter === "all", () =>
              setRatingFilter("all"),
            )}
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <View key={n}>
                {renderRatingChip(n, ratingFilter === n, () => setRatingFilter(n))}
              </View>
            ))}
          </ScrollView>
        </View>
      )} */}

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.neonGreen} />
        </View>
      )}

      {isError && (
        <ErrorState
          error={
            error instanceof Error ? error.message : t("givenFeedback.loadError")
          }
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && filteredItems.length === 0 && (
        <EmptyState
          icon="paper-plane-outline"
          title={
            items.length === 0
              ? t("givenFeedback.emptyTitle")
              : matchSearchQuery.trim()
                ? t("givenFeedback.emptySearchTitle")
                : t("givenFeedback.emptyFilterTitle")
          }
          description={
            items.length === 0
              ? t("givenFeedback.emptyDesc")
              : matchSearchQuery.trim()
                ? t("givenFeedback.emptySearchDesc")
                : t("givenFeedback.emptyFilterDesc")
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
  subtitle: { fontSize: 13, marginTop: 8, marginBottom: 4 },
  filtersBlock: { paddingBottom: 8 },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  chipRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 4,
  },
  ratingChipStars: { flexDirection: "row", gap: 1, alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "700" },
  matchLabel: { fontSize: 13, marginTop: 2 },
  criteriaPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  sectionHint: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
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
  pendingBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
});

export default GivenFeedbackScreen;
