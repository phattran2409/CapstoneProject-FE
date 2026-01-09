import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "@/shared/components/themed";

import { UpdateProfileData } from "../types/profile.types";
import { ProfileFormField } from "./ProfileFormField";
import { ProfileSelectionField } from "./ProfileSelectionField";
import {
  editProfileSchema,
  type EditProfileFormData,
  POSITIONS,
  GENDERS,
  PREFERRED_FOOT_OPTIONS,
} from "../validation/profileSchemas";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EditProfileFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: UpdateProfileData) => void;
  initialData?: Partial<UpdateProfileData>;
  isLoading?: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  visible,
  onClose,
  onSave,
  initialData = {},
  isLoading = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      bio: initialData.bio || "",
      phone: initialData.phone || "",
      dateOfBirth: initialData.dateOfBirth || "",
      gender: initialData.gender,
      position: initialData.position || "",
      preferredFoot: initialData.preferredFoot,
      shirtNumber: initialData.shirtNumber,
    },
  });

  // Watch dateOfBirth for display
  const dateOfBirth = watch("dateOfBirth");
  const position = watch("position");

  // Reset form when initialData changes
  useEffect(() => {
    if (visible) {
      reset({
        name: initialData.name || "",
        bio: initialData.bio || "",
        phone: initialData.phone || "",
        dateOfBirth: initialData.dateOfBirth || "",
        gender: initialData.gender,
        position: initialData.position || "",
        preferredFoot: initialData.preferredFoot,
        shirtNumber: initialData.shirtNumber,
      });
    }
  }, [visible, initialData, reset]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      setValue("dateOfBirth", dateString);
    }
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const onSubmit = (data: EditProfileFormData) => {
    // Transform to UpdateProfileData format
    const profileData: UpdateProfileData = {
      name: data.name,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender,
      position: data.position || undefined,
      preferredFoot: data.preferredFoot,
      shirtNumber: typeof data.shirtNumber === "number" ? data.shirtNumber : undefined,
    };
    onSave(profileData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={100}
          tint={isDark ? "dark" : "light"}
          style={styles.blurContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Header */}
            <LinearGradient
              colors={
                isDark
                  ? [theme.colors.neonGreen, "transparent"]
                  : ["rgb(255, 255, 255)", "transparent"]
              }
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <ThemedText variant="primary" size="title" weight="bold">
                  {t("personalPage.editForm.title")}
                </ThemedText>
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.colors.neonGreen },
                  ]}
                >
                  {isLoading ? (
                    <Ionicons
                      name="hourglass"
                      size={20}
                      color={theme.colors.black}
                    />
                  ) : (
                    <Text
                      style={[styles.saveButtonText, { color: theme.colors.black }]}
                    >
                      {t("personalPage.editForm.save")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Form Content */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <View
                  style={[
                    styles.avatarContainer,
                    {
                      borderColor: theme.colors.neonGreen,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={48}
                    color={theme.colors.textSecondary}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.changeAvatarButton,
                    { backgroundColor: theme.colors.neonGreen },
                  ]}
                >
                  <Ionicons name="camera" size={16} color={theme.colors.black} />
                </TouchableOpacity>
              </View>

              {/* Personal Info Section */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}
                >
                  {t("personalPage.editForm.sections.personal")}
                </Text>

                <ProfileFormField
                  control={control}
                  name="name"
                  label={t("personalPage.editForm.fields.name")}
                  icon="person"
                  placeholder={t("personalPage.editForm.fields.namePlaceholder")}
                  maxLength={50}
                  error={errors.name}
                />

                <ProfileFormField
                  control={control}
                  name="bio"
                  label={t("personalPage.editForm.fields.bio")}
                  icon="document-text"
                  placeholder={t("personalPage.editForm.fields.bioPlaceholder")}
                  multiline
                  maxLength={200}
                  error={errors.bio}
                />

                <ProfileFormField
                  control={control}
                  name="phone"
                  label={t("personalPage.editForm.fields.phone")}
                  icon="call"
                  placeholder="0123456789"
                  keyboardType="phone-pad"
                  maxLength={11}
                  error={errors.phone}
                />

                {/* Date of Birth */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={theme.colors.neonGreen}
                    />
                    <ThemedText variant="primary" size="s" weight="bold">
                      {t("personalPage.editForm.fields.dateOfBirth")}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={[
                      styles.inputContainer,
                      styles.dateButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        {
                          color: dateOfBirth
                            ? theme.colors.text
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {dateOfBirth
                        ? formatDateDisplay(dateOfBirth)
                        : t("personalPage.editForm.fields.dateOfBirthPlaceholder")}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1950, 0, 1)}
                  />
                )}

                <ProfileSelectionField
                  control={control}
                  name="gender"
                  label={t("personalPage.editForm.fields.gender")}
                  icon="male-female"
                  options={GENDERS}
                  error={errors.gender}
                />
              </View>

              {/* Football Info Section */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}
                >
                  {t("personalPage.editForm.sections.football")}
                </Text>

                {/* Position Grid */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons
                      name="football"
                      size={16}
                      color={theme.colors.neonGreen}
                    />
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {t("personalPage.editForm.fields.position")}
                    </Text>
                  </View>
                  <View style={styles.positionsGrid}>
                    {POSITIONS.map((pos) => (
                      <TouchableOpacity
                        key={pos.id}
                        onPress={() => setValue("position", pos.id)}
                        style={[
                          styles.positionChip,
                          {
                            backgroundColor:
                              position === pos.id
                                ? theme.colors.neonGreen
                                : theme.colors.surface,
                            borderColor:
                              position === pos.id
                                ? theme.colors.neonGreen
                                : theme.colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.positionChipText,
                            {
                              color:
                                position === pos.id
                                  ? theme.colors.black
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {pos.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.position && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {t(errors.position.message || "")}
                    </Text>
                  )}
                </View>

                <ProfileSelectionField
                  control={control}
                  name="preferredFoot"
                  label={t("personalPage.editForm.fields.preferredFoot")}
                  icon="footsteps"
                  options={PREFERRED_FOOT_OPTIONS}
                  error={errors.preferredFoot}
                />

                <ProfileFormField
                  control={control}
                  name="shirtNumber"
                  label={t("personalPage.editForm.fields.shirtNumber")}
                  icon="shirt"
                  placeholder={t("personalPage.editForm.fields.shirtNumberPlaceholder")}
                  keyboardType="number-pad"
                  error={errors.shirtNumber}
                />
              </View>

              {/* Extra padding for keyboard */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  blurContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  keyboardView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: SCREEN_WIDTH / 2 - 65,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  dateText: {
    fontSize: 16,
  },
  positionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  positionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 52,
    alignItems: "center",
  },
  positionChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default EditProfileForm;
