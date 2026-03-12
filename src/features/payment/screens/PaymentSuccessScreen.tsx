import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedView,
} from '@/shared/components/themed';
import Button from '@/shared/components/Button';
import { RootStackParamList } from '@/app/navigation/types';

type PaymentSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PaymentSuccess'
>;

type PaymentSuccessScreenRouteProp = RouteProp<
  RootStackParamList,
  'PaymentSuccess'
>;

interface PaymentSuccessScreenProps {
  navigation: PaymentSuccessScreenNavigationProp;
  route: PaymentSuccessScreenRouteProp;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const scaleAnim = useSharedValue(1);
  
  const txnRef = route.params.txnRef;
  const amount = route.params.amount;

  React.useEffect(() => {
    scaleAnim.value = withRepeat(
      withSpring(1.03, { damping: 15, stiffness: 50 }),
      -1,
      true
    );
  }, []);

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handleBackToWallet = () => {
    navigation.navigate('Wallet' as any);
  };

  const handleBackHome = () => {
    navigation.navigate('MainTabs' as any);
  };

  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.xl,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <ThemedText variant="primary" size="xl" weight="bold">
          {t('payment.title', { defaultValue: 'Thanh toán' })}
        </ThemedText>
        <View style={{ width: 24 }} />
      </ThemedView>

      {/* Content */}
      <ThemedView
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.l,
          paddingTop: theme.spacing.l,
        }}
      >
        {/* Success Icon */}
        <View style={styles.centerArea}>
          <Animated.View style={[styles.successIconContainer, successIconStyle]}>
            <View
              style={[
                styles.outerCircle,
                { backgroundColor: theme.colors.neonGreen },
              ]}
            >
              <View
                style={[
                  styles.innerCircle,
                  { borderColor: theme.colors.neonGreen },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={56}
                  color={theme.colors.neonGreen}
                />
              </View>
            </View>
          </Animated.View>

          <ThemedText
            size="l"
            weight="bold"
            style={{
              marginTop: theme.spacing.l,
              color: theme.colors.neonGreen,
            }}
          >
            {t('payment.successTitle', {
              defaultValue: 'GIAO DỊCH THÀNH CÔNG!',
            })}
          </ThemedText>

          <ThemedText
            size="xl"
            weight="bold"
            style={{
              marginTop: theme.spacing.s,
              color: theme.colors.neonGreen,
            }}
          >
            + {amount} VND
          </ThemedText>

          <ThemedText
            variant="secondary"
            size="s"
            style={{
              marginTop: theme.spacing.s,
              textAlign: 'center',
            }}
          >
            {t('payment.successDescription', {
              defaultValue: 'Số dư đã được cập nhật vào ví của bạn',
            })}
          </ThemedText>
        </View>

        {/* Detail Card */}
        <ThemedView
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.l,
              padding: theme.spacing.m,
            },
          ]}
        >
          {[
            {
              label: 'Mã giao dịch',
              value: txnRef,
            },
            {
              label: 'Phương thức',
              value: 'VN Pay',
            },
            {
              label: 'Trạng thái',
              value: t('payment.completed', { defaultValue: 'Hoàn tất' }),
              valueColor: theme.colors.neonGreen,
            },
          ].map((row) => (
            <View key={row.label} style={styles.detailRow}>
              <ThemedText
                variant="secondary"
                size="s"
                style={{ flex: 1 }}
              >
                {row.label}
              </ThemedText>
              <ThemedText
                size="s"
                weight="semiBold"
                style={{
                  flex: 1,
                  textAlign: 'right',
                  color: row.valueColor ?? theme.colors.softWhite,
                }}
              >
                {row.value}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <Button
            title={t('payment.backToWallet', {
              defaultValue: 'Quay lại Ví',
            })}
            onPress={handleBackToWallet}
            size="large"
            style={{
              backgroundColor: theme.colors.neonGreen,
              borderRadius: theme.radius.xl,
              marginBottom: theme.spacing.s,
            }}
            textStyle={{ color: '#000' }}
          />

          <Button
            title={t('payment.backHome', {
              defaultValue: 'Về Trang chủ',
            })}
            onPress={handleBackHome}
            size="large"
            variant="outline"
            style={{
              borderRadius: theme.radius.xl,
            }}
          />
        </View>
      </ThemedView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  detailsCard: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomButtons: {
    marginTop: 24,
  },
});

export default PaymentSuccessScreen;




