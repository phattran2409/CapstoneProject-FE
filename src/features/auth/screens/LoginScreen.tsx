import React, { useState } from "react";
import {
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  View,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useLogin, useGoogleSignIn } from "@/features/auth";
import { Button } from "@/shared/components";
import { useToast } from "@/shared/toast";
import Ionicons from "@expo/vector-icons/Ionicons";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Use React Query login hook
  const { mutate: login, isPending: loading } = useLogin();
  const { mutate: signInWithGoogle, isPending: googleLoading } = useGoogleSignIn();
  const handleLogin = () => {
    if (!email || !password) {
      // toast.error(
      //   t("login.errors.emptyFields", "Lỗi"),
      //   t("login.errors.pleaseEnter", "Vui lòng nhập email và mật khẩu")
      // );
      // toast.error("Lỗi", "Vui lòng nhập email và mật khẩu");
      toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập email và mật khẩu",
        visibilityTime: 3000,
        position: "bottom",
      });
      return;
    }

    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success(
            t("login.success.title", "Đăng nhập thành công"),
            t("login.success.message", "Chào mừng bạn trở lại!")
          );
          // Navigation will happen automatically via StackNavigator
          setTimeout(() => {
            navigation.replace("MainTabs");
          }, 100);
        },
        onError: (error: any) => {
          toast.error(
            t("login.errors.failed", "Đăng nhập thất bại"),
            error.message || t("login.errors.invalidCredentials", "Thông tin đăng nhập không hợp lệ") 
            
          );
        },
      }
    );
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle(undefined, {
      onSuccess: () => {
        toast.success(
          t("login.success.title", "Đăng nhập thành công"),
          t("login.success.googleMessage", "Đăng nhập bằng Google thành công!")
        );
        // Navigation will happen automatically via StackNavigator
        setTimeout(() => {
          navigation.replace("MainTabs");
        }, 100);
      },
      onError: (error: any) => {
        toast.error(
          t("login.errors.googleFailed", "Đăng nhập Google thất bại"),
          error.message || t("login.errors.googleTryAgain", "Không thể đăng nhập bằng Google. Vui lòng thử lại.")
        );
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <View style={[styles.content, { paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.xl * 2, paddingBottom: theme.spacing.l }]}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: '#1c2a16' }]}>
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
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.fontSizes.l }]}>
              {t("login.subtitle", "Đăng nhập để tiếp tục sân chơi của bạn.")}
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.colors.softWhite }]}>Email</Text>
            <View style={[styles.inputContainer, { borderColor: '#3b3b3b' }]}>
              <Ionicons
                name="mail"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.softWhite }]}
                placeholder={t("login.emailPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("login.passwordLabel", "Mật khẩu")}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                {t("login.forgot", "Quên mật khẩu?")}
              </Text>
            </View>
            <View style={[styles.inputContainer, { borderColor: '#3b3b3b' }]}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={[styles.input, styles.inputFlex, { color: theme.colors.softWhite }]}
                placeholder={t("login.passwordPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
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
          </View>

          <Button
            title={t("common.buttons.login")}
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: '#2b2b2b' }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
              {t("login.or", "hoặc")}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: '#2b2b2b' }]} />
          </View>

          <View style={styles.socialButtons}>
            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  borderColor: '#2f2f2f',
                  backgroundColor: '#0f0f0f',
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
            </TouchableOpacity>

            {/* Facebook Sign-In Button (Placeholder) */}
            <TouchableOpacity
              style={[styles.socialButton, { borderColor: '#2f2f2f', backgroundColor: '#0f0f0f' }]}
              disabled
            >
              <Image
                source={require("@assets/images/logo_facebook.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Apple Sign-In Button (Placeholder) */}
            <TouchableOpacity
              style={[styles.socialButton, { borderColor: '#2f2f2f', backgroundColor: '#0f0f0f' }]}
              disabled
            >
              <Image
                source={require("@assets/images/logo_apple.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Link to Register */}
          <View style={styles.registerLink}>
            <Text style={{ color: theme.colors.textSecondary }}>
              {t("login.noAccount", "Chưa có tài khoản?")}{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={[styles.registerLinkText, { color: theme.colors.neonGreen }]}>
                {t("login.registerNow", "Đăng ký ngay")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  formSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  inputFlex: {
    flex: 1,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  registerLinkText: {
    fontWeight: '600',
  },
});

export default LoginScreen;
