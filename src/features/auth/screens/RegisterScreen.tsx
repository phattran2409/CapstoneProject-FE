import React, { useState } from "react";
import {
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/shared/theme";
import { useRegister } from "@/features/auth";
import { Button } from "@/shared/components";
import { useToast } from "@/shared/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedIcon } from "@/shared/components/themed";
import {
  registerSchema,
  type RegisterFormData,
} from "../validation/authSchemas";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string; userId: string };
  MainTabs: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // React Query mutation
  const { mutate: register, isPending: loading } = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    // Transform to API request format (name instead of username)
    register(
      {
        fullName: data.username,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (response) => {
          console.log(response.data);
          toast.success(
            t("register.success.title", "Đăng ký thành công"),
            t("register.success.message", "Tài khoản đã được tạo!")
          );
          // Navigation tự động xảy ra khi isAuthenticated thay đổi
          navigation.navigate("OTPVerification", {email: data.email, userId: response.data?.userId as string});
        },
        onError: (error: any) => {
          toast.error(
            t("register.errors.failed", "Đăng ký thất bại"),
            error.message || t("register.errors.tryAgain", "Vui lòng thử lại.")
          );
        },
      }
    );
  };

  // Helper to get translated error message
  const getErrorMessage = (message?: string) => {
    if (!message) return "";
    return message.startsWith("validation.") ? t(message) : message;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ThemedIcon name="arrow-back" size={24} variant="secondary" />
        </TouchableOpacity>

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: "#1c2a16" }]}>
              <Image
                source={require("../../../assets/kickify/logo_only.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.softWhite,
                  fontSize: theme.fontSizes.xxl * 1.5,
                },
              ]}
            >
              {t("register.title")}
            </Text>
            <Text style={[styles.subtitle, { color: "#9ca3af" }]}>
              {t("register.subtitle")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Field */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("register.usernameLabel")}
              </Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: errors.username
                          ? theme.colors.error
                          : "#3b3b3b",
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={20}
                      color={
                        errors.username
                          ? theme.colors.error
                          : theme.colors.textSecondary
                      }
                    />
                    <TextInput
                      style={[styles.input, { color: theme.colors.softWhite }]}
                      placeholder={t("register.usernamePlaceholder")}
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {errors.username && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {getErrorMessage(errors.username.message)}
                </Text>
              )}
            </View>

            {/* Email Field */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("common.email")}
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: errors.email
                          ? theme.colors.error
                          : "#3b3b3b",
                      },
                    ]}
                  >
                    <Ionicons
                      name="mail"
                      size={20}
                      color={
                        errors.email
                          ? theme.colors.error
                          : theme.colors.textSecondary
                      }
                    />
                    <TextInput
                      style={[styles.input, { color: theme.colors.softWhite }]}
                      placeholder={t("login.emailPlaceholder")}
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {getErrorMessage(errors.email.message)}
                </Text>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("login.passwordLabel")}
              </Text>
              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: errors.password
                            ? theme.colors.error
                            : "#3b3b3b",
                        },
                      ]}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={
                          errors.password
                            ? theme.colors.error
                            : theme.colors.textSecondary
                        }
                      />
                      <TextInput
                        style={[styles.input, { color: theme.colors.softWhite }]}
                        placeholder={t("login.passwordPlaceholder")}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                      />
                    </View>
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {getErrorMessage(errors.password.message)}
                </Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("register.confirmPasswordLabel")}
              </Text>
              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: errors.confirmPassword
                            ? theme.colors.error
                            : "#3b3b3b",
                        },
                      ]}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={
                          errors.confirmPassword
                            ? theme.colors.error
                            : theme.colors.textSecondary
                        }
                      />
                      <TextInput
                        style={[styles.input, { color: theme.colors.softWhite }]}
                        placeholder={t("register.confirmPasswordPlaceholder")}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showConfirmPassword}
                      />
                    </View>
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {getErrorMessage(errors.confirmPassword.message)}
                </Text>
              )}
            </View>

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={t("common.buttons.register")}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                variant="primary"
                size="large"
                style={styles.fullWidth}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View
                style={[styles.dividerLine, { backgroundColor: "#374151" }]}
              />
              <Text style={[styles.dividerText, { color: "#9ca3af" }]}>
                {t("login.or")}
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: "#374151" }]}
              />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              {[
                require("@assets/images/logo_google.png"),
                require("@assets/images/logo_facebook.png"),
                require("@assets/images/logo_apple.png"),
              ].map((logo, index) => (
                <TouchableOpacity
                  key={`social-${index}`}
                  style={[
                    styles.socialButton,
                    { borderColor: "#2f2f2f", backgroundColor: "#0f0f0f" },
                  ]}
                  disabled
                >
                  <Image
                    source={logo}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={{ color: "#9ca3af" }}>
                {t("register.alreadyHaveAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={[
                    styles.loginLinkText,
                    { color: theme.colors.neonGreen },
                  ]}
                >
                  {t("common.buttons.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginLeft: 20,
  },
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    gap: 8,
  },
  formField: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
    flex: 1,
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: "25%",
  },
  buttonContainer: {
    marginTop: 24,
  },
  fullWidth: {
    width: "100%",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  loginLinkText: {
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default RegisterScreen;
