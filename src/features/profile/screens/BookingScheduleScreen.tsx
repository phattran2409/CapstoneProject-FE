import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "@/app/navigation/types";
import { useTheme } from "@/shared/theme";
import { formatCurrency } from "@/shared/utils/formatters";
import { formatDateYYYYMMDDLocal } from "@/shared/utils/dateUtils";
import {
  ThemedSafeAreaView,
  ThemedScrollView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import { EmptyState } from "@/shared/components/EmptyState";
import { BookingItem } from "../api/profileApi";
import { useMyBookings } from "../hooks";

type BookingScheduleNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BookingSchedule"
>;

interface BookingScheduleScreenProps {
  navigation: BookingScheduleNavigationProp;
}

const PAGE_SIZE = 10;

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const BookingScheduleScreen: React.FC<BookingScheduleScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(getTomorrowDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [page, setPage] = useState(1);

  const dateParam = useMemo(
    () => formatDateYYYYMMDDLocal(selectedDate),
    [selectedDate],
  );

  const { data, isLoading, isFetching, isError, refetch } = useMyBookings(
    dateParam,
    page,
    PAGE_SIZE,
  );

  const canGoPrev = page > 1;
  const canGoNext = (data?.totalPages ?? 1) > page;

  const handleDateChange = (_event: unknown, nextDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (!nextDate) return;

    const tomorrow = getTomorrowDate();
    if (nextDate < tomorrow) {
      setSelectedDate(tomorrow);
    } else {
      setSelectedDate(nextDate);
    }
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#F59E0B";
      case "Cancelled":
        return theme.colors.error;
      case "Confirmed":
        return theme.colors.neonGreen;
      case "Completed":
        return theme.colors.neonGreen;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderItem = ({ item }: { item: BookingItem }) => {
    return (
      <ThemedView
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.rowBetween}>
          <View style={[styles.row, { flex: 1, marginRight: theme.spacing.s }]}>
            <Ionicons
              name="football-outline"
              size={15}
              color={theme.colors.neonGreen}
              style={{ marginRight: 6 }}
            />
            <ThemedText size="m" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
              {item.fieldName}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}18`, borderColor: `${getStatusColor(item.status)}55` },
            ]}
          >
            <ThemedText
              size="s"
              weight="semiBold"
              style={{ color: getStatusColor(item.status) }}
            >
              {t(`bookingSchedule.status.${item.status}`)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.row, { marginTop: theme.spacing.xs }]}>
          <Ionicons
            name="location-outline"
            size={13}
            color={theme.colors.textSecondary}
            style={{ marginRight: 5 }}
          />
          <ThemedText variant="secondary" size="s" style={{ flex: 1 }} numberOfLines={1}>
            {item.venueName}
          </ThemedText>
        </View>

        <View style={[styles.row, { marginTop: theme.spacing.xs }]}>
          <Ionicons
            name="time-outline"
            size={13}
            color={theme.colors.textSecondary}
            style={{ marginRight: 5 }}
          />
          <ThemedText variant="secondary" size="s">
            {`${item.startTime.substring(0, 5)} - ${item.endTime.substring(0, 5)}`}
          </ThemedText>
        </View>

        <View
          style={[
            styles.amountRow,
            { marginTop: theme.spacing.s, borderTopColor: theme.colors.border },
          ]}
        >
          <Ionicons name="cash-outline" size={15} color={theme.colors.neonGreen} />
          <ThemedText size="m" weight="bold" style={{ color: theme.colors.neonGreen }}>
            {formatCurrency(item.totalAmount)}
          </ThemedText>
        </View>
      </ThemedView>
    );
  };

  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.xl,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText size="xl" weight="bold">
          {t("bookingSchedule.title")}
        </ThemedText>
        <View style={styles.headerRight} />
      </ThemedView>
      {/* Date Picker */} 
      <View style={{ padding: theme.spacing.l }}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.colors.text} />
          <ThemedText size="m" style={{ marginHorizontal: theme.spacing.s }}>
            {dateParam}
          </ThemedText>
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={getTomorrowDate()}
        />
      )}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.neonGreen}
          style={{ marginTop: theme.spacing.xl }}
        />
      ) : isError ? (
        <View style={{ paddingHorizontal: theme.spacing.l }}>
          <EmptyState
            icon="alert-circle-outline"
            title={t("bookingSchedule.errorTitle")}
            description={t("bookingSchedule.errorDescription")}
          />
          <TouchableOpacity
            onPress={() => refetch()}
            style={[
              styles.retryButton,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <ThemedText size="m" weight="semiBold">
              {t("bookingSchedule.retry")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          refreshing={isFetching}
          onRefresh={refetch}
          data={data?.bookings ?? []}
          keyExtractor={(item) => item.bookingId}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.l,
            paddingBottom: theme.spacing.xl,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-clear-outline"
              title={t("bookingSchedule.emptyTitle")}
              description={t("bookingSchedule.emptyDescription")}
            />
          }
          ListFooterComponent={
            data && data.totalPages > 1 ? (
              <View style={[styles.rowBetween, { marginTop: theme.spacing.m }]}>
                <TouchableOpacity
                  disabled={!canGoPrev}
                  onPress={() => setPage((prev) => prev - 1)}
                  style={[
                    styles.pageButton,
                    {
                      opacity: canGoPrev ? 1 : 0.5,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText>{t("bookingSchedule.prev")}</ThemedText>
                </TouchableOpacity>
                <ThemedText variant="secondary">
                  {`${data.page}/${data.totalPages}`}
                </ThemedText>
                <TouchableOpacity
                  disabled={!canGoNext}
                  onPress={() => setPage((prev) => prev + 1)}
                  style={[
                    styles.pageButton,
                    {
                      opacity: canGoNext ? 1 : 0.5,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText>{t("bookingSchedule.next")}</ThemedText>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      {isFetching && !isLoading && (
        <ActivityIndicator
          size="small"
          color={theme.colors.neonGreen}
          style={{ marginBottom: theme.spacing.m }}
        />
      )}
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 36,
    height: 36,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  pageButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default BookingScheduleScreen;
