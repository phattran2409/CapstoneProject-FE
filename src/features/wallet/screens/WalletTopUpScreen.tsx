import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import {
  ThemedSafeAreaView,
  ThemedScrollView,
  ThemedText,
  ThemedView,
} from '@/shared/components/themed';
import Button from '@/shared/components/Button';
import { RootStackParamList } from '@/app/navigation/types';

type WalletTopUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WalletTopUp'
>;

interface WalletTopUpScreenProps {
  navigation: WalletTopUpScreenNavigationProp;
}

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  isPopular?: boolean;
}

const COIN_PACKAGES: CoinPackage[] = [
  { id: '1', coins: 50, price: 50000 },
  { id: '2', coins: 100, price: 100000, isPopular: true },
  { id: '3', coins: 250, price: 250000 },
  { id: '4', coins: 500, price: 500000 },
];

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const WalletTopUpScreen: React.FC<WalletTopUpScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('50000');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('2');

  const selectedPackage =
    COIN_PACKAGES.find((pkg) => pkg.id === selectedPackageId) ??
    COIN_PACKAGES[1];

  const handleProceed = () => {
    navigation.navigate('PaymentSuccess' as any);
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
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
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
          {t('wallet.topUpTitle', { defaultValue: 'Nạp Coin' })}
        </ThemedText>
        <View style={{ width: 24 }} />
      </ThemedView>

      <ThemedScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.l,
          paddingTop: theme.spacing.l,
          paddingBottom: theme.spacing.xxl * 2,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current balance */}
        <ThemedView
          style={[
            styles.balanceBox,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.l,
              padding: theme.spacing.m,
            },
          ]}
        >
          <ThemedText variant="secondary" size="s">
            {t('wallet.currentBalance', {
              defaultValue: 'Số dư hiện tại',
            })}
          </ThemedText>
          <ThemedText
            size="xxl"
            weight="bold"
            style={{ color: theme.colors.neonGreen, marginTop: 4 }}
          >
            1,250
          </ThemedText>
        </ThemedView>

        {/* Input amount (VND) */}
        <ThemedView
          style={{
            marginTop: theme.spacing.l,
          }}
        >
          <ThemedText
            variant="primary"
            size="s"
            style={{ marginBottom: theme.spacing.s }}
          >
            {t('wallet.enterAmount', {
              defaultValue: 'Nhập số tiền muốn nạp (VND)',
            })}
          </ThemedText>

          <ThemedView
            style={[
              styles.amountInputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.l,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="VD: 50,000"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.amountInput,
                {
                  color: theme.colors.text,
                },
              ]}
            />
            <TouchableOpacity>
              <Ionicons
                name="card-outline"
                size={22}
                color={theme.colors.neonGreen}
              />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText
            variant="secondary"
            size="xs"
            style={{ marginTop: theme.spacing.s }}
          >
            {t('wallet.exchangeRate', {
              defaultValue: 'Tỷ lệ quy đổi: 1.000 VND = 1 Coin',
            })}
          </ThemedText>
        </ThemedView>

        {/* Popular packages */}
        <ThemedView style={{ marginTop: theme.spacing.l }}>
          <ThemedText
            variant="primary"
            size="m"
            weight="semiBold"
            style={{ marginBottom: theme.spacing.m }}
          >
            {t('wallet.popularPackages', {
              defaultValue: 'Gói Coin phổ biến',
            })}
          </ThemedText>

          <View style={styles.packagesGrid}>
            {COIN_PACKAGES.map((pkg) => {
              const isSelected = pkg.id === selectedPackageId;
              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageItem,
                    {
                      borderRadius: theme.radius.l,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected
                        ? theme.colors.neonGreen
                        : theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPackageId(pkg.id)}
                >
                  <ThemedText
                    size="l"
                    weight="bold"
                    style={{ color: theme.colors.softWhite }}
                  >
                    {pkg.coins} Coin
                  </ThemedText>
                  <ThemedText
                    size="s"
                    style={{
                      marginTop: 4,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {formatCurrency(pkg.price)}
                  </ThemedText>
                  {pkg.isPopular && (
                    <View
                      style={[
                        styles.popularTag,
                        { backgroundColor: theme.colors.neonGreen },
                      ]}
                    >
                      <ThemedText
                        size="xs"
                        weight="bold"
                        style={{ color: '#000' }}
                      >
                        {t('wallet.mostPopular', {
                          defaultValue: 'MUA NHIỀU',
                        })}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedView>

        {/* Total and button */}
        <ThemedView style={{ marginTop: theme.spacing.l }}>
          <ThemedText
            variant="secondary"
            size="s"
            style={{ marginBottom: 4 }}
          >
            {t('wallet.totalAmount', { defaultValue: 'Tổng thanh toán:' })}
          </ThemedText>
          <ThemedText
            size="xl"
            weight="bold"
            style={{ color: theme.colors.neonGreen }}
          >
            {formatCurrency(selectedPackage.price)}
          </ThemedText>

          <Button
            title={t('wallet.proceedTopUp', {
              defaultValue: 'Tiến hành nạp',
            })}
            onPress={handleProceed}
            size="large"
            style={{
              marginTop: theme.spacing.l,
              backgroundColor: theme.colors.neonGreen,
              borderRadius: theme.radius.xl,
            }}
            textStyle={{ color: '#000' }}
          />
        </ThemedView>
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceBox: {},
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  amountInput: {
    flex: 1,
    marginRight: 12,
    fontSize: 16,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packageItem: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  popularTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
});

export default WalletTopUpScreen;




