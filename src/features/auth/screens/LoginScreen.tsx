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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useLogin } from "@/features/auth";
import { NativeWindButton } from "@/shared/components";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Use React Query login hook
  const { mutate: login, isPending: loading } = useLogin();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    login(
      { email, password },
      {
        onSuccess: () => {
          // Navigation will happen automatically via StackNavigator
          setTimeout(() => {
            navigation.replace("MainTabs");
          }, 100);
        },
        onError: (error: any) => {
          Alert.alert("Login Failed", error.message || "Invalid credentials");
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-5 pt-16 pb-8">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-[#1c2a16] items-center justify-center mb-8">
              <View className="w-full h-full rounded-full  items-center justify-center ">
                <Image
                  source={require("../../../assets/kickify/logo_only.png")}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text className="text-4xl font-bold mb-2">
              <Text className="text-soft-white">kick</Text>
              <Text className="text-medium-gray">ify</Text>
            </Text>
            <Text className="text-lg text-medium-gray mb-10 text-center font-semibold">
              {t("login.subtitle", "Đăng nhập để tiếp tục sân chơi của bạn.")}
            </Text>
          </View>

          <View className="mt-2 mb-3">
            <Text className="text-soft-white font-semibold mb-3">Email</Text>
            <View className="flex-row items-center gap-2 border border-[#3b3b3b] rounded-2xl px-4 py-1">
              <Ionicons
                name="mail"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                className="bg-transparent text-soft-white text-base"
                placeholder={t("login.emailPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mt-5">
            <View className="flex-row justify-between mb-3">
              <Text className="text-soft-white font-semibold">
                {t("login.passwordLabel", "Mật khẩu")}
              </Text>
              <Text className="text-medium-gray">
                {t("login.forgot", "Quên mật khẩu?")}
              </Text>
            </View>
            <View className="gap-2 border border-[#3b3b3b] rounded-2xl px-4 py-1 flex-row items-center">
              <Ionicons
                name="lock-closed"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                className="flex-1 text-soft-white text-base"
                placeholder={t("login.passwordPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Text className="text-soft-white text-base">
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </Text>
              </Pressable>
            </View>
          </View>

          <NativeWindButton
            title={t("common.buttons.login")}
            onPress={handleLogin}
            loading={loading}
            className="mt-10"
            variant="primary"
            size="lg"
          />

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-[#2b2b2b]" />
            <Text className="mx-4 text-medium-gray">
              {t("login.or", "hoặc")}
            </Text>
            <View className="flex-1 h-px bg-[#2b2b2b]" />
          </View>

          <View className="flex-row justify-between px-6">
            {[
              require("@assets/images/logo_google.png"),
              require("@assets/images/logo_facebook.png"),
              require("@assets/images/logo_apple.png"),
            ].map((logo, index) => (
              <TouchableOpacity
                key={`social-${index}`}
                className="w-16 h-16 rounded-2xl border border-[#2f2f2f] items-center justify-center bg-[#0f0f0f]"
              >
                <Image source={logo} className="w-8 h-8" resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Link to Register */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-medium-gray">
              {t("login.noAccount", "Chưa có tài khoản?")}{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-neon-green font-semibold">
                {t("login.registerNow", "Đăng ký ngay")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
