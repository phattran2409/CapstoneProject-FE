import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";

export type ReportType = "post" | "user";

export interface ReportModalProps {
  visible: boolean;
  type: ReportType;
  onClose: () => void;
  onSubmit: (reason: string, customReason?: string) => Promise<void> | void;
  isLoading?: boolean;
}

// Predefined reasons for posts
const POST_REASONS = [
  "spam",
  "inappropriate",
  "harassment",
  "false_information",
  "copyright",
  "other",
] as const;

// Predefined reasons for users
const USER_REASONS = [
  "inappropriate_behavior",
  "harassment",
  "spam",
  "fake_account",
  "scam",
  "other",
] as const;

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  type,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reasons = type === "post" ? POST_REASONS : USER_REASONS;
  const isOtherSelected = selectedReason === "other";

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setError(null);
    if (reason !== "other") {
      setCustomReason("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError(t("reportModal.validation.noReason"));
      return;
    }

    if (isOtherSelected && !customReason.trim()) {
      setError(t("reportModal.validation.noCustomReason"));
      return;
    }

    setError(null);
    const finalReason = isOtherSelected ? customReason.trim() : selectedReason;
    await onSubmit(selectedReason, isOtherSelected ? finalReason : undefined);
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason(null);
      setCustomReason("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t(`reportModal.title.${type}`)}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                styles.modalDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t(`reportModal.description.${type}`)}
            </Text>

            {/* Reason Selection */}
            <View style={styles.reasonsContainer}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor:
                        selectedReason === reason
                          ? `${theme.colors.primary}20`
                          : theme.colors.surface,
                      borderColor:
                        selectedReason === reason
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleReasonSelect(reason)}
                  disabled={isLoading}
                >
                  <View style={styles.reasonContent}>
                    <Ionicons
                      name={
                        selectedReason === reason
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        selectedReason === reason
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.reasonText,
                        {
                          color:
                            selectedReason === reason
                              ? theme.colors.text
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {t(`reportModal.reasons.${type}.${reason}`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Reason Input */}
            {isOtherSelected && (
              <View style={styles.customReasonContainer}>
                <Text
                  style={[
                    styles.customReasonLabel,
                    { color: theme.colors.text },
                  ]}
                >
                  {t("reportModal.customReason.label")}
                </Text>
                <TextInput
                  style={[
                    styles.customReasonInput,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: error
                        ? theme.colors.error
                        : theme.colors.border,
                    },
                  ]}
                  value={customReason}
                  onChangeText={(text) => {
                    setCustomReason(text);
                    setError(null);
                  }}
                  placeholder={t("reportModal.customReason.placeholder")}
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  editable={!isLoading}
                />
                <Text
                  style={[
                    styles.characterCount,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {customReason.length} / 500
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.footerButtonText,
                  { color: theme.colors.text },
                ]}
              >
                {t("common.buttons.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.submitButton,
                {
                  backgroundColor: theme.colors.error,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.white}
                />
              ) : (
                <Text
                  style={[
                    styles.footerButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  {t("reportModal.submit")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  customReasonContainer: {
    marginTop: 8,
  },
  customReasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  customReasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReportModal;

