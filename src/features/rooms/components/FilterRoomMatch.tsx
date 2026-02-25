import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/shared/components/themed";
import { MatchFormat } from "../types/room.types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDateDDMMYYYY, formatDateYYYYMMDDLocal } from "@/shared/utils/dateUtils";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";


interface FilterRoomMatchProps {
  theme: any;
  visible: boolean;
  onApply: (filters: {
    matchFormat?: MatchFormat;
    date?: string;
  }) => void;
  onClose: () => void;
}

const DISPLAY_FORMATS: { label: string; value: MatchFormat }[] = [
  { label: "5vs5", value: "FiveVsFive" },
  { label: "7vs7", value: "SevenVsSeven" },
  { label: "11vs11", value: "ElevenVsEleven" },
];

export const FilterRoomMatch: React.FC<FilterRoomMatchProps> = ({
  visible,
  onApply,
  onClose,
  theme,
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>(new Date());
  const [matchFormat, setMatchFormat] = useState<MatchFormat>("FiveVsFive");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const clearFilters = () => {
    setDate(new Date());
    setMatchFormat("FiveVsFive");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              padding: theme.spacing.l,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText
              style={[
                styles.headerTitle,
                { color: theme.colors.text },
              ]}
            >
              {t("filterRoomMatch.title", "Lọc phòng đấu")}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.iconButton, { borderColor: theme.colors.border }]}
            >
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Section 1 - Date */}
            <View style={styles.section}>
              <ThemedText
                style={[
                  styles.sectionLabel,
                  { color: theme.colors.text },
                ]}
              >
                {t("filterRoomMatch.matchDateLabel", "Ngày thi đấu")}
              </ThemedText>

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
                style={[
                  styles.dateButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={theme.colors.text}
                />
                <ThemedText
                  style={[
                    styles.dateText,
                    { color: theme.colors.text },
                  ]}
                >
                  {formatDateDDMMYYYY(formatDateYYYYMMDDLocal(date))}
                </ThemedText>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  style={styles.datePicker}
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Section 2 - Match format */}
            <View style={styles.section}>
              <ThemedText
                style={[
                  styles.sectionLabel,
                  { color: theme.colors.text },
                ]}
              >
                {t("filterRoomMatch.matchFormatLabel", "Hình thức thi đấu")}
              </ThemedText>

              <View style={styles.formatRow}>
                {DISPLAY_FORMATS.map(({ label, value }) => {
                  const isActive = matchFormat === value;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setMatchFormat(value)}
                      activeOpacity={0.8}
                      style={[
                        styles.formatChip,
                        {
                          borderColor: isActive
                            ? theme.colors.primary
                            : theme.colors.border,
                          backgroundColor: isActive
                            ? theme.colors.primary + "22"
                            : theme.colors.card,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.formatChipText,
                          {
                            color: isActive
                              ? theme.colors.primary
                              : theme.colors.text,
                          },
                        ]}
                      >
                        {label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Footer - Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.footerButtonSecondary,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              onPress={clearFilters}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.footerButtonText,
                  { color: theme.colors.text },
                ]}
              >
                {t("filterRoomMatch.resetButton", "Đặt lại")}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.footerButtonPrimary,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() =>
                onApply({
                  matchFormat,
                  date: date.toISOString(),
                })
              }
              activeOpacity={0.85}
            >
              <ThemedText style={[styles.footerButtonTextPrimary, { color: theme.colors.mediumGray + "80%", }]}>
                {t("filterRoomMatch.applyButton", "Áp dụng")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  body: {
    gap: 16,
  },
  section: {
    width: "100%",
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
  },
  datePicker: {
    width: "100%",
    marginTop: 8,
  },
  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  formatChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  formatChipText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonSecondary: {
    borderWidth: 1,
  },
  footerButtonPrimary: {},
  footerButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footerButtonTextPrimary: {
    fontSize: 14,
    fontWeight: "600",
  },
}); 
