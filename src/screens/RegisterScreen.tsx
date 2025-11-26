import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { NativeWindButton } from '../components';
import Ionicons from '@expo/vector-icons/Ionicons';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string; username: string; password: string };
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(t('register.errors.allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('register.errors.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t('register.errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to send OTP
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      
      // Navigate to OTP verification
      navigation.navigate('OTPVerification', { email, username, password });
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert(t('register.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header với icon */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-[#1c2a16] items-center justify-center mb-6">
              <Ionicons name="football-outline" size={40} color={theme.colors.neonGreen} /> 
            </View>
            <Text className="text-4xl font-bold text-white mb-2">
              {t('register.title')}
            </Text>
            <Text className="text-base text-gray-400 text-center">
              {t('register.subtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-2 gap-4">
            {/* Username */}
            <View>
              <Text className="text-white text-base mb-2">
                {t('register.usernameLabel')}
              </Text>
              <View className="flex-row items-center gap-2 border border-[#3b3b3b] rounded-2xl px-4 py-1">
                <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  className="bg-transparent text-soft-white text-base"
                  placeholder={t('register.usernamePlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none" />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-white text-base mb-2">
                {t('common.email')}
              </Text>
              <View className="flex-row items-center gap-2 border border-[#3b3b3b] rounded-2xl px-4 py-1">
                <Ionicons name="mail" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  className="bg-transparent text-soft-white text-base"
                  placeholder={t('login.emailPlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-white text-base mb-2">
                {t('login.passwordLabel')}
              </Text>
              <View className="relative">
                <View className="flex-row items-center gap-2 border border-[#3b3b3b] rounded-2xl px-4 py-1">
                  <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    className="bg-transparent text-soft-white text-base"
                    placeholder={t('login.passwordPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                   <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-white text-base mb-2">
                {t('register.confirmPasswordLabel')}
              </Text>
              <View className="relative">
                <View className="flex-row items-center gap-2 border border-[#3b3b3b] rounded-2xl px-4 py-1">
                  <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    className="bg-transparent text-soft-white text-base"
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                </View>
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <View className="mt-6">
              <NativeWindButton
                title={t('common.buttons.register')}
                onPress={handleRegister}
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full"
              />
            </View>

            {/* Divider với "hoặc đăng ký bằng" */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-700" />
              <Text className="mx-4 text-gray-400">{t('login.or')}</Text>
              <View className="flex-1 h-px bg-gray-700" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex-row justify-between px-6 mb-6">
              {
                (
                  [
                    require('../../assets/logo_google.png'),
                    require('../../assets/logo_facebook.png'),
                    require('../../assets/logo_apple.png')
                  ].map((logo, index) => (
                    <TouchableOpacity
                      key={`social-${index}`}
                      className="w-16 h-16 rounded-2xl border border-[#2f2f2f] items-center justify-center bg-[#0f0f0f]"
                    >
                      <Image source={logo} className="w-8 h-8" resizeMode="contain" />
                    </TouchableOpacity>
                  ))
                )
              }
            </View>

            {/* Link to Login */}
            <View className="flex-row justify-center items-center mt-4 mb-8">
              <Text className="text-gray-400">{t('register.alreadyHaveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-neon-green font-semibold">{t('common.buttons.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

