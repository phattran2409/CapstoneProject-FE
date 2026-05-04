import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { ReportType } from "../types/feedback.types";

const reportTypeOptions: ReportType[] = [
  ReportType.InappropriateBehavior,
  ReportType.Harassment,
  ReportType.Spamming,
  ReportType.FakeAccount,
  ReportType.Scamming,
];

const reportTypeTranslationKeys: Record<ReportType, string> = {
  [ReportType.InappropriateBehavior]: "inappropriate_behavior",
  [ReportType.Harassment]: "harassment",
  [ReportType.Spamming]: "spamming",
  [ReportType.FakeAccount]: "fake_account",
  [ReportType.Scamming]: "scamming",
};

const reportTypeFallbackLabels: Record<ReportType, string> = {
  [ReportType.InappropriateBehavior]: "Hành vi không phù hợp",
  [ReportType.Harassment]: "Quấy rối",
  [ReportType.Spamming]: "Spam",
  [ReportType.FakeAccount]: "Tài khoản giả mạo",
  [ReportType.Scamming]: "Lừa đảo",
};

export interface ReportPlayerModalProps {
  visible: boolean;
  isReporting: boolean;
  selectedReportType: ReportType | null;
  reportDescription: string;
  reportError: string | null;
  onSelectType: (type: ReportType) => void;
  onChangeDescription: (text: string) => void;
  setReportError: (error: string | null) => void;
  onRequestClose: () => void;
  onSubmit: (reportType: ReportType, description: string) => void | Promise<void>;
}

export const ReportPlayerModal: React.FC<ReportPlayerModalProps> = ({
  visible,
  isReporting,
  selectedReportType,
  reportDescription,
  reportError,
  onSelectType,
  onChangeDescription,
  setReportError,
  onRequestClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay} pointerEvents="auto">
      <View
        style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
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
          {reportTypeOptions.map((type) => (
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
              onPress={() => onSelectType(type)}
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
                {t(
                  `reportModal.reasons.user.${reportTypeTranslationKeys[type]}`,
                  reportTypeFallbackLabels[type],
                )}
              </Text>
              {selectedReportType === type && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
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
          onChangeText={onChangeDescription}
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
                onRequestClose();
              }
            }}
            disabled={isReporting}
          >
            <Text
              style={[styles.modalButtonText, { color: theme.colors.text }]}
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

              await onSubmit(selectedReportType, reportDescription.trim());
            }}
            disabled={isReporting}
          >
            <Text style={[styles.modalButtonText, { color: "#fff" }]}>
              {isReporting
                ? t("feedback.report.submitting", "Đang gửi...")
                : t("feedback.report.submit", "Gửi báo cáo")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
