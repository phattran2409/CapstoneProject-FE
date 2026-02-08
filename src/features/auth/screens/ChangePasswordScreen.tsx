import React, { useState } from "react";
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  View,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/shared/theme";
import { useChangePassword, useAuthStore } from "@/features/auth";
import { Button } from "@/shared/components";
import { useToast } from "@/shared/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { changePasswordSchema, type ChangePasswordFormData } from "../validation/authSchemas";
import { ScrollView } from "react-native";
import { RootStackParamList } from "@/app/navigation/types";

type ChangePasswordScreenProps = NativeStackScreenProps<RootStackParamList, "ChangePassword">;

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuthStore();
  const { email } = route.params;
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // React Query mutation
  const { mutate: changePassword, isPending: loading } = useChangePassword();

  // Helper to get translated error message
  const getErrorMessage = (message?: string) => {
    if (!message) return "";
    return message.startsWith("validation.") ? t(message) : message;
  };

  const onSubmit = (data: ChangePasswordFormData) => {
    console.log('Data change password :', data);
    if (!user?.email && !email) {
      toast.error( 
        t("changePassword.errors.title"),
        t("changePassword.errors.failed")
      );
      return;
    }

    changePassword(
      {
        email: user?.email || email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success(
            t("changePassword.success.title"),
            t("changePassword.success.message")
          );
          reset();
          navigation.goBack();
        },
        onError: (error: any) => {
          toast.error(
            t("changePassword.errors.title"),
            error.message || t("changePassword.errors.failed")
          );
        },
      }
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.softWhite}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.softWhite }]}>
            {t("changePassword.title")}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
            paddingBottom: theme.spacing.xl * 2,
          }}
        >
          {/* Subtitle */}
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
            ]}
          >
            {t("changePassword.subtitle")}
          </Text>

          {/* Current Password Field */}
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.colors.softWhite }]}>
              {t("changePassword.currentPassword")}
            </Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.currentPassword
                        ? theme.colors.error
                        : "#3b3b3b",
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={
                      errors.currentPassword
                        ? theme.colors.error
                        : theme.colors.textSecondary
                    }
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputFlex,
                      { color: theme.colors.softWhite },
                    ]}
                    placeholder={t("changePassword.currentPasswordPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showCurrentPassword}
                  />
                  <Pressable onPress={() => setShowCurrentPassword((prev) => !prev)}>
                    <Ionicons
                      name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />
            {errors.currentPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {getErrorMessage(errors.currentPassword.message)}
              </Text>
            )}
          </View>

          {/* New Password Field */}
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.colors.softWhite }]}>
              {t("changePassword.newPassword")}
            </Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.newPassword
                        ? theme.colors.error
                        : "#3b3b3b",
                    },
                  ]}
                >
                  <Ionicons
                    name="key"
                    size={20}
                    color={
                      errors.newPassword
                        ? theme.colors.error
                        : theme.colors.textSecondary
                    }
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputFlex,
                      { color: theme.colors.softWhite },
                    ]}
                    placeholder={t("changePassword.newPasswordPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showNewPassword}
                  />
                  <Pressable onPress={() => setShowNewPassword((prev) => !prev)}>
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />
            {errors.newPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {getErrorMessage(errors.newPassword.message)}
              </Text>
            )}
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.colors.softWhite }]}>
              {t("changePassword.confirmNewPassword")}
            </Text>
            <Controller
              control={control}
              name="confirmNewPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.confirmNewPassword
                        ? theme.colors.error
                        : "#3b3b3b",
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={
                      errors.confirmNewPassword
                        ? theme.colors.error
                        : theme.colors.textSecondary
                    }
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputFlex,
                      { color: theme.colors.softWhite },
                    ]}
                    placeholder={t("changePassword.confirmNewPasswordPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />
            {errors.confirmNewPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {getErrorMessage(errors.confirmNewPassword.message)}
              </Text>
            )}
          </View>

          {/* Password Requirements */}
          <View style={[styles.requirementsContainer, { marginTop: theme.spacing.m }]}>
            <Text style={[styles.requirementsTitle, { color: theme.colors.textSecondary }]}>
              {t("validation.password.tooShort", "Password requirements:")}
            </Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                {t("validation.password.tooShort")}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                {t("validation.password.alphanumeric")}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title={t("changePassword.submit")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  formSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 48,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
  },
  inputFlex: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(151, 251, 87, 0.1)",
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  requirementText: {
    fontSize: 12,
  },
  submitButton: {
    marginTop: 32,
  },
});

export default ChangePasswordScreen;

