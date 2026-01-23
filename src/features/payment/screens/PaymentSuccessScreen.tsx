import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
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

interface PaymentSuccessScreenProps {
  navigation: PaymentSuccessScreenNavigationProp;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleBackToWallet = () => {
    navigation.navigate('Wallet' as any);
  };

  const handleBackHome = () => {
    navigation.navigate('Home' as any);
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
          <View
            style={[
              styles.successCircle,
              {
                backgroundColor: `${theme.colors.neonGreen}20`,
                borderColor: theme.colors.neonGreen,
              },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={48}
              color={theme.colors.neonGreen}
            />
          </View>

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
            + 500,000 Coins
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
              value: '#TXN-992831BC',
            },
            {
              label: 'Thời gian',
              value: '24/05/2024, 14:30',
            },
            {
              label: 'Phương thức',
              value: 'Apple Pay',
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
    marginBottom: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
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



