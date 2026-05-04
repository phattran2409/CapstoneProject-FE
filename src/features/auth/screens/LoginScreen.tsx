import React, { useState } from "react";
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  View,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/shared/theme";
import { useLogin, useGoogleSignIn, useAuthStore, useForgotPassword } from "@/features/auth";
import { Button } from "@/shared/components";
import { useToast } from "@/shared/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { loginSchema, forgotPasswordSchema, type LoginFormData } from "../validation/authSchemas";
import { ScrollView } from "react-native";
import { RootStackParamList } from "@/app/navigation/types";
import { authApi } from "@/features/auth/api";
import { getFcmToken } from "@/shared/firebase/messaging";
import { getTranslatedError } from "@/shared/utils/errorTranslations";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuthStore();
  
  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  
  // Forgot Password mutation
  const { mutate: forgotPassword, isPending: forgotLoading } = useForgotPassword();

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // React Query mutations
  const { mutate: login, isPending: loading } = useLogin();
  const { mutate: signInWithGoogle, isPending: googleLoading } = useGoogleSignIn();

  const onSubmit = (data: LoginFormData) => {
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          // Toast đăng nhập: hiển thị trên Home sau khi chuyển stack (xem pendingLoginSuccessToast)
          getFcmToken().then((token) => {
            if (token) authApi.updateFcmToken(token);
          });
        },
        onError: (error: any) => {
          const isNotVerified =
            error?.code === "NotVerified" || error?.status === 409;
          const userId =
            error?.userId ?? error?.details?.userId;

          if (isNotVerified && userId) {
            toast.info(
              t("login.errors.notVerified", "Tài khoản chưa xác thực"),
              t("login.errors.notVerifiedMessage", "Vui lòng nhập mã OTP gửi đến email của bạn.")
            );
            navigation.navigate("OTPVerification", {
              email: data.email,
              userId: String(userId),
            });
            return;
          }

          toast.error(
            t("login.errors.failed", "Đăng nhập thất bại"),
            getTranslatedError(error?.message) ||
              t("login.errors.invalidCredentials", "Thông tin đăng nhập không hợp lệ")
          );
        },
      }
    );
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle(undefined, {
      onSuccess: () => {
        // Toast chào mừng hiển thị trên Home (pendingLoginSuccessToast)
        getFcmToken().then((token) => {
          if (token) authApi.updateFcmToken(token);
        });
      },
      onError: (error: any) => {
        toast.error(
          t("login.errors.googleFailed", "Đăng nhập Google thất bại"),
          getTranslatedError(error?.message) ||
            t(
              "login.errors.googleTryAgain",
              "Không thể đăng nhập bằng Google. Vui lòng thử lại."
            )
        );
      },
    });
  };

  // Helper to get translated error message
  const getErrorMessage = (message?: string) => {
    if (!message) return "";
    return message.startsWith("validation.") ? t(message) : message;
  };

  // Handle Forgot Password - Using Zod validation and useForgotPassword hook
  const handleForgotPassword = () => {
    // Validate email using Zod schema
    const result = forgotPasswordSchema.safeParse({ email: forgotEmail });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message;
      const translatedError = errorMessage?.startsWith("validation.") 
        ? t(errorMessage) 
        : t("login.forgot.invalidEmail", "Email không hợp lệ");
      setForgotEmailError(translatedError);
      return;
    }
    
    // Clear error on valid input
    setForgotEmailError("");
    
    // Call forgot password API using hook
    forgotPassword(
      { email: result.data.email },
      {
        onSuccess: () => {
          toast.success(
            t("login.forgot.success", "Đã gửi email"),
            t("login.forgot.successMessage", "Vui lòng kiểm tra email để đặt lại mật khẩu")
          );
          navigation.navigate("ChangePassword", { email: result.data.email });
          setShowForgotModal(false);
          setForgotEmail("");
          setForgotEmailError("");
        },
        onError: (error: any) => {
          toast.error(
            t("login.forgot.error", "Lỗi"),
            getTranslatedError(error?.message) || t("login.forgot.errorMessage", "Không thể gửi email. Vui lòng thử lại.")
          );
        },
      }
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.xl * 2, paddingBottom: theme.spacing.l }}
      >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: "#1c2a16" }]}>
              <View style={styles.logoInner}>
                <Image
                  source={require("../../../assets/kickify/logo_only.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={[styles.title, { fontSize: theme.fontSizes.xxl * 1.5 }]}>
              <Text style={{ color: theme.colors.softWhite }}>kick</Text>
              <Text style={{ color: theme.colors.textSecondary }}>ify</Text>
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary, fontSize: theme.fontSizes.l },
              ]}
            >
              {t("login.subtitle", "Đăng nhập để tiếp tục sân chơi của bạn.")}
            </Text>
          </View>

          {/* Email Field */}
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.colors.softWhite }]}>
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.email ? theme.colors.error : "#3b3b3b",
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
                    style={[styles.input, styles.inputFlex, { color: theme.colors.softWhite }]}
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
          <View style={styles.formSection}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("login.passwordLabel", "Mật khẩu")}
              </Text>
              <TouchableOpacity onPress={() => setShowForgotModal(true)}>
                <Text style={{ color: theme.colors.neonGreen }}>
                  {t("login.forgot", "Quên mật khẩu?")}
                </Text>
              </TouchableOpacity>
            </View>
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
                    style={[
                      styles.input,
                      styles.inputFlex,
                      { color: theme.colors.softWhite },
                    ]}
                    placeholder={t("login.passwordPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {getErrorMessage(errors.password.message)}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <Button
            title={t("common.buttons.login")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: "#2b2b2b" }]} />
            <Text
              style={[styles.dividerText, { color: theme.colors.textSecondary }]}
            >
              {t("login.or", "hoặc")}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: "#2b2b2b" }]} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  borderColor: "#2f2f2f",
                  backgroundColor: "#0f0f0f",
                  opacity: googleLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              <Image
                source={require("@assets/images/logo_google.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
              <Text style={{ color: theme.colors.softWhite }}>{t("login.googleLogin")}</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[
                styles.socialButton,
                { borderColor: "#2f2f2f", backgroundColor: "#0f0f0f" },
              ]}
              disabled
            >
              <Image
                source={require("@assets/images/logo_facebook.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity> */}

            {/* <TouchableOpacity
              style={[
                styles.socialButton,
                { borderColor: "#2f2f2f", backgroundColor: "#0f0f0f" },
              ]}
              disabled
            >
              <Image
                source={require("@assets/images/logo_apple.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity> */}
          </View>

          {/* Register Link */}
          <View style={styles.registerLink}>
            <Text style={{ color: theme.colors.textSecondary }}>
              {t("login.noAccount", "Chưa có tài khoản?")}{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text
                style={[styles.registerLinkText, { color: theme.colors.neonGreen }]}
              >
                {t("login.registerNow", "Đăng ký ngay")}
              </Text>
            </TouchableOpacity>
          </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowForgotModal(false);
          setForgotEmailError("");
        }}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowForgotModal(false);
            setForgotEmailError("");
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardView}
          >
            <Pressable 
              style={[styles.modalContent, { backgroundColor: theme.colors.darkBlack }]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.softWhite }]}>
                  {t("login.forgot.title", "Quên mật khẩu")}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowForgotModal(false);
                  setForgotEmailError("");
                }}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                {t("login.forgot.description", "Nhập email của bạn để nhận link đặt lại mật khẩu")}
              </Text>

              {/* Email Input */}
              <View
                style={[
                  styles.inputContainer,
                  { 
                    borderColor: forgotEmailError ? theme.colors.error : "#3b3b3b", 
                    marginTop: 16 
                  },
                ]}
              >
                <Ionicons
                  name="mail"
                  size={20}
                  color={forgotEmailError ? theme.colors.error : theme.colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, styles.inputFlex, { color: theme.colors.softWhite }]}
                  placeholder={t("login.emailPlaceholder", "Nhập email của bạn")}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={forgotEmail}
                  onChangeText={(text) => {
                    setForgotEmail(text);
                    if (forgotEmailError) setForgotEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
              {forgotEmailError && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {forgotEmailError}
                </Text>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.neonGreen },
                  forgotLoading && { opacity: 0.7 },
                ]}
                onPress={handleForgotPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <ActivityIndicator color={theme.colors.darkBlack} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: theme.colors.darkBlack }]}>
                    {t("login.forgot.submit", "Gửi email")}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowForgotModal(false);
                  setForgotEmailError("");
                }}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  {t("common.buttons.cancel", "Hủy")}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
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
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logoInner: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "600",
  },
  formSection: {
    marginTop: 8,
    marginBottom: 12,
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
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 40,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  socialButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  socialButton: {
    flex: 1,
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  registerLinkText: {
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalKeyboardView: {
    width: "100%",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2b2b2b",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
});

export default LoginScreen;
