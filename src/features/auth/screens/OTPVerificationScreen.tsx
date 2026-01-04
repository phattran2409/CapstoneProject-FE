import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components';
import { useVerifyOTP, useSendOTP } from '@/features/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';

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
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // ✅ Use React Query mutations
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTP();
  const { mutate: sendOTP, isPending: isResending } = useSendOTP();

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

  const handleVerify = () => {
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      Alert.alert(t('otp.errors.incomplete'));
      return;
    }

    // ✅ Call verify OTP mutation
    verifyOTP(
      { phone: email , otp: otpCode },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Account verified successfully!');
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }, 100);
        },
        onError: (error: any) => {
          Alert.alert(t('otp.errors.invalid'), error.message);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        },
      }
    );
  };

  const handleResend = () => {
    // ✅ Call send OTP mutation
    sendOTP(
      { email: email },
      {
        onSuccess: () => {
          setResendTimer(60);
          Alert.alert('Success', t('otp.resent'));
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to resend OTP');
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      <View style={[styles.content, { paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.xl * 1.5 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: '#065f46' }]}>
            <Ionicons name="mail" size={40} color={theme.colors.neonGreen} />
          </View>
          <Text style={[styles.title, { color: theme.colors.softWhite, fontSize: theme.fontSizes.xxl }]}>
            {t('otp.title')}
          </Text>
          <Text style={[styles.subtitle, { color: '#9ca3af' }]}>
            {t('otp.subtitle', { email })}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, { 
                backgroundColor: '#111827',
                borderColor: '#374151',
                color: theme.colors.softWhite,
              }]}
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
        <Button
          title={t('otp.verify')}
          onPress={handleVerify}
          loading={isVerifying}
          variant="primary"
          size="large"
          style={styles.verifyButton}
        />

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={{ color: '#9ca3af' }}>
              {t('otp.resendIn', { seconds: resendTimer })}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendText, { color: theme.colors.neonGreen }]}>
                {t('otp.resend')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Back to Register */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={{ color: '#9ca3af' }}>{t('otp.changeEmail')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 32,
  },
});

export default OTPVerificationScreen;
