import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeWindButton } from '../components';
import { useAuthStore } from '../store/authStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme';

type RootStackParamList = {
  OTPVerification: { email: string; username: string; password: string };
  MainTabs: undefined;
};

type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OTPVerification'
>;
type OTPVerificationScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

interface OTPVerificationScreenProps {
  navigation: OTPVerificationScreenNavigationProp;
  route: OTPVerificationScreenRouteProp;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email, username, password } = route.params;
  const { theme } = useTheme();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Paste scenario
      const otpArray = value.slice(0, 6).split('');
      setOtp([...otpArray, ...Array(6 - otpArray.length).fill('')]);
      inputRefs.current[5]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      Alert.alert(t('otp.errors.incomplete'));
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to verify OTP
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      
      // If successful, register user and login
      login({ email, name: username });
      // Wait for state to update, then navigate
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 100);
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert(t('otp.errors.invalid'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    // Simulate resend OTP
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    Alert.alert(t('otp.resent'));
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-black">
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-full bg-green-800 items-center justify-center mb-6">
            <Ionicons name="mail" size={40} color={theme.colors.neonGreen} />
          </View>
          <Text className="text-3xl font-bold text-white mb-3">
            {t('otp.title')}
          </Text>
          <Text className="text-base text-gray-400 text-center px-4">
            {t('otp.subtitle', { email })}
          </Text>
        </View>

        {/* OTP Input */}
        <View className="flex-row justify-between mb-8 px-2">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="w-12 h-14 bg-gray-900 border-2 border-gray-700 rounded-xl text-white text-2xl font-bold text-center"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <NativeWindButton
          title={t('otp.verify')}
          onPress={handleVerify}
          loading={loading}
          variant="primary"
          size="lg"
          className="mb-6"
        />

        {/* Resend OTP */}
        <View className="items-center">
          {resendTimer > 0 ? (
            <Text className="text-gray-400">
              {t('otp.resendIn', { seconds: resendTimer })}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-neon-green font-semibold">
                {t('otp.resend')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Back to Register */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center mt-8"
        >
          <Text className="text-gray-400">{t('otp.changeEmail')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;

