import React, { useState } from "react";
import {
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useRegister } from "@/features/auth";
import { Button } from "@/shared/components";
import Ionicons from "@expo/vector-icons/Ionicons";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string; username: string; password: string };
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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Use React Query register hook
  const { mutate: register, isPending: loading } = useRegister();

  const handleRegister = () => {
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(t("register.errors.allFieldsRequired"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("register.errors.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("register.errors.passwordTooShort"));
      return;
    }

    // ✅ Call register mutation
    register(
      {
        name: username,
        email,
        password,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Account created successfully!");
          // Navigate to Main or OTPVerification if needed
          setTimeout(() => {
            navigation.replace("MainTabs" as any);
          }, 100);
        },
        onError: (error: any) => {
          Alert.alert(t("register.errors.failed"), error.message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header với icon */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: '#1c2a16' }]}>
              <Image
                source={require("../../../assets/kickify/logo_only.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.softWhite, fontSize: theme.fontSizes.xxl * 1.5 }]}>
              {t("register.title")}
            </Text>
            <Text style={[styles.subtitle, { color: '#9ca3af' }]}>
              {t("register.subtitle")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("register.usernameLabel")}
              </Text>
              <View style={[styles.inputContainer, { borderColor: '#3b3b3b' }]}>
                <Ionicons
                  name="person"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.softWhite }]}
                  placeholder={t("register.usernamePlaceholder")}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("common.email")}
              </Text>
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

            {/* Password */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("login.passwordLabel")}
              </Text>
              <View style={styles.passwordWrapper}>
                <View style={[styles.inputContainer, { borderColor: '#3b3b3b' }]}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.softWhite }]}
                    placeholder={t("login.passwordPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
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
            </View>

            {/* Confirm Password */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: theme.colors.softWhite }]}>
                {t("register.confirmPasswordLabel")}
              </Text>
              <View style={styles.passwordWrapper}>
                <View style={[styles.inputContainer, { borderColor: '#3b3b3b' }]}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.softWhite }]}
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={t("common.buttons.register")}
                onPress={handleRegister}
                loading={loading}
                variant="primary"
                size="large"
                style={styles.fullWidth}
              />
            </View>

            {/* Divider với "hoặc đăng ký bằng" */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: '#374151' }]} />
              <Text style={[styles.dividerText, { color: '#9ca3af' }]}>{t("login.or")}</Text>
              <View style={[styles.dividerLine, { backgroundColor: '#374151' }]} />
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
                  style={[styles.socialButton, { borderColor: '#2f2f2f', backgroundColor: '#0f0f0f' }]}
                >
                  <Image
                    source={logo}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Link to Login */}
            <View style={styles.loginLink}>
              <Text style={{ color: '#9ca3af' }}>
                {t("register.alreadyHaveAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginLinkText, { color: theme.colors.neonGreen }]}>
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
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  formField: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
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
    flex: 1,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  fullWidth: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  loginLinkText: {
    fontWeight: '600',
  },
});

export default RegisterScreen;
