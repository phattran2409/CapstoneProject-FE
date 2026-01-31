import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { useAlert } from "@/shared/hooks/useAlert";
import { validateContent as validateContentUtil } from "@/shared/utils";

export interface ActionButtonProps {
  contentType: "post" | "comment";
  contentId: string;
  currentContent: string;
  onEdit: (contentId: string, newContent: string) => void | Promise<void>;
  onDelete: (contentId: string) => void | Promise<void>;
  isLoading?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  contentType,
  contentId,
  currentContent,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { visible, alertOptions, showDanger, hideAlert } = useAlert();

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState(currentContent);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleEditPress = () => {
    setShowMenu(false);
    setEditedContent(currentContent);
    setValidationError(null);
    setShowEditModal(true);
  };

  const handleDeletePress = () => {
    setShowMenu(false);
    showDanger(
      t("actionButton.deleteConfirmTitle", {
        type: t(`actionButton.${contentType}`),
      }),
      t("actionButton.deleteConfirmMessage", {
        type: t(`actionButton.${contentType}`),
      }),
      async () => {
        try {
          await onDelete(contentId);
        } catch (error) {
          console.error("Error deleting:", error);
        }
      },
      undefined,
      t("actionButton.delete"),
      t("common.buttons.cancel"),
    );
  };

  const validateContent = (content: string): boolean => {
    const { isValid, errorKey } = validateContentUtil(content);

    if (!isValid && errorKey) {
      setValidationError(t(errorKey));
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSaveEdit = async () => {
    if (!validateContent(editedContent)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(contentId, editedContent.trim());
      setShowEditModal(false);
      setValidationError(null);
    } catch (error) {
      console.error("Error editing:", error);
      setValidationError(t("actionButton.validation.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditedContent(currentContent);
    setValidationError(null);
  };

  return (
    <>
      {/* Action Button (3 dots) */}
      <TouchableOpacity
        onPress={handleMenuPress}
        disabled={isLoading}
        style={styles.actionButton}
      >
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseMenu}>
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {/* Edit Option */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={handleEditPress}
            >
              <Ionicons
                name="create-outline"
                size={22}
                color={theme.colors.neonGreen}
              />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                {t("actionButton.edit")}
              </Text>
            </TouchableOpacity>

            {/* Delete Option */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={theme.colors.error}
              />
              <Text style={[styles.menuText, { color: theme.colors.error }]}>
                {t("actionButton.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.editModalOverlay}>
          <View
            style={[
              styles.editModalContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.editModalHeader,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <Text
                style={[styles.editModalTitle, { color: theme.colors.text }]}
              >
                {t("actionButton.editTitle", {
                  type: t(`actionButton.${contentType}`),
                })}
              </Text>
              <TouchableOpacity
                onPress={handleCancelEdit}
                disabled={isSubmitting}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Content Input */}
            <View style={styles.editModalBody}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: validationError
                      ? theme.colors.error
                      : theme.colors.border,
                  },
                ]}
                value={editedContent}
                onChangeText={(text) => {
                  setEditedContent(text);
                  if (validationError) {
                    validateContent(text);
                  }
                }}
                multiline
                placeholder={t("actionButton.contentPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={5000}
                editable={!isSubmitting}
              />

              {/* Validation Error */}
              {validationError && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {validationError}
                </Text>
              )}

              {/* Character Count */}
              <Text
                style={[
                  styles.characterCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {editedContent.length} / 5000
              </Text>
            </View>

            {/* Footer Buttons */}
            <View
              style={[
                styles.editModalFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={handleCancelEdit}
                disabled={isSubmitting}
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
                  styles.saveButton,
                  {
                    backgroundColor: theme.colors.neonGreen,
                    opacity: isSubmitting ? 0.6 : 1,
                  },
                ]}
                onPress={handleSaveEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.background}
                  />
                ) : (
                  <Text
                    style={[
                      styles.footerButtonText,
                      { color: theme.colors.background },
                    ]}
                  >
                    {t("actionButton.save")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Component */}
      {visible && alertOptions && (
        <Modal transparent visible={visible} animationType="fade">
          <View style={styles.alertOverlay}>
            <View
              style={[
                styles.alertContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                {alertOptions.title}
              </Text>
              {alertOptions.message && (
                <Text
                  style={[
                    styles.alertMessage,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {alertOptions.message}
                </Text>
              )}
              <View style={styles.alertButtons}>
                {alertOptions.onCancel && (
                  <TouchableOpacity
                    style={[
                      styles.alertButton,
                      { backgroundColor: theme.colors.surface },
                    ]}
                    onPress={alertOptions.onCancel}
                  >
                    <Text
                      style={[
                        styles.alertButtonText,
                        { color: theme.colors.text },
                      ]}
                    >
                      {alertOptions.cancelText || t("common.buttons.cancel")}
                    </Text>
                  </TouchableOpacity>
                )}
                {alertOptions.onConfirm && (
                  <TouchableOpacity
                    style={[
                      styles.alertButton,
                      { backgroundColor: theme.colors.error },
                    ]}
                    onPress={alertOptions.onConfirm}
                  >
                    <Text
                      style={[
                        styles.alertButtonText,
                        { color: theme.colors.white },
                      ]}
                    >
                      {alertOptions.confirmText || t("actionButton.delete")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    borderRadius: 12,
    minWidth: 200,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  editModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  editModalBody: {
    padding: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 300,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
  },
  editModalFooter: {
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
  },
  saveButton: {
    minHeight: 48,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: "row",
    gap: 12,
  },
  alertButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ActionButton;
