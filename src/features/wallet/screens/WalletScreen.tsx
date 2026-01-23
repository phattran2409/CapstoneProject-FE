import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
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

type WalletScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Wallet'
>;

interface WalletScreenProps {
  navigation: WalletScreenNavigationProp;
}

interface WalletTransaction {
  id: string;
  title: string;
  description: string;
  icon: string;
  amount: string;
  type: 'in' | 'out';
  status: string;
  time: string;
}

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: '1',
    title: 'Nạp qua MoMo',
    description: '10:30, 20/10/2023',
    icon: 'add-circle',
    amount: '+500 Coins',
    type: 'in',
    status: 'THÀNH CÔNG',
    time: '10:30, 20/10/2023',
  },
  {
    id: '2',
    title: 'Phòng đấu: Derby Sài Gòn',
    description: '09:15, 20/10/2023',
    icon: 'football',
    amount: '-200 Coins',
    type: 'out',
    status: 'THANH TOÁN',
    time: '09:15, 20/10/2023',
  },
  {
    id: '3',
    title: 'Thắng trận đấu #122',
    description: '18:00, 19/10/2023',
    icon: 'trophy',
    amount: '+50 Coins',
    type: 'in',
    status: 'THƯỞNG',
    time: '18:00, 19/10/2023',
  },
  {
    id: '4',
    title: 'Đặt sân tập: Thống Nhất',
    description: '15:30, 19/10/2023',
    icon: 'calendar',
    amount: '-100 Coins',
    type: 'out',
    status: 'ĐÃ HUỶ',
    time: '15:30, 19/10/2023',
  },
];

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
    const isIncome = item.type === 'in';

    return (
      <ThemedView
        style={[
          styles.transactionItem,
          {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: `${theme.colors.neonGreen}20`,
            },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={theme.colors.neonGreen}
          />
        </View>

        <View style={styles.transactionInfo}>
          <ThemedText
            variant="primary"
            size="m"
            weight="semiBold"
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          <ThemedText
            variant="secondary"
            size="xs"
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {item.time}
          </ThemedText>
        </View>

        <View style={styles.transactionMeta}>
          <ThemedText
            size="m"
            weight="bold"
            style={{
              color: isIncome ? theme.colors.neonGreen : theme.colors.error,
              textAlign: 'right',
            }}
          >
            {item.amount}
          </ThemedText>
          <ThemedText
            size="xs"
            style={{
              marginTop: 2,
              color: theme.colors.textSecondary,
              textTransform: 'uppercase',
            }}
          >
            {item.status}
          </ThemedText>
        </View>
      </ThemedView>
    );
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
        <ThemedText variant="primary" size="xxl" weight="bold">
          {t('wallet.title', { defaultValue: 'Ví tiền' })}
        </ThemedText>
        <TouchableOpacity>
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </ThemedView>

      {/* Balance Card */}
      <ThemedView
        style={[
          styles.balanceCardWrapper,
          {
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
          },
        ]}
      >
        <ThemedView
          style={[
            styles.balanceCard,
            {
              backgroundColor: '#0f172a',
              borderRadius: theme.radius.xl,
              padding: theme.spacing.l,
            },
          ]}
        >
          <ThemedText
            variant="secondary"
            size="s"
            style={{ marginBottom: theme.spacing.s }}
          >
            {t('wallet.balanceLabel', {
              defaultValue: 'Tổng số dư hiện có',
            })}
          </ThemedText>
          <ThemedText
            style={{ color: theme.colors.neonGreen }}
            size="xxl"
            weight="bold"
          >
            1,250 COINS
          </ThemedText>

          <View style={styles.balanceActions}>
            <Button
              title={t('wallet.deposit', { defaultValue: 'Nạp thêm' })}
              onPress={() => navigation.navigate('WalletTopUp' as any)}
              size="medium"
              style={{
                flex: 1,
                marginRight: theme.spacing.s,
                backgroundColor: theme.colors.neonGreen,
              }}
              textStyle={{ color: '#000' }}
            />
            <Button
              title={t('wallet.withdraw', { defaultValue: 'Rút tiền' })}
              onPress={() => {}}
              size="medium"
              variant="outline"
              style={{ flex: 1, marginLeft: theme.spacing.s }}
            />
          </View>
        </ThemedView>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView
        style={[
          styles.quickActionsContainer,
          {
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.m,
          },
        ]}
      >
        {[
          { icon: 'time-outline', label: 'Lịch sử' },
          { icon: 'stats-chart-outline', label: 'Thống kê' },
          { icon: 'gift-outline', label: 'Quà tặng' },
          { icon: 'card-outline', label: 'Thẻ ví' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.quickActionItem,
              { backgroundColor: theme.colors.surface },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={theme.colors.neonGreen}
            />
            <ThemedText
              size="xs"
              style={{
                marginTop: 8,
                color: theme.colors.textSecondary,
              }}
            >
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Recent Transactions */}
      <ThemedView
        style={[
          styles.transactionsHeader,
          {
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
          },
        ]}
      >
        <ThemedText variant="primary" size="l" weight="bold">
          {t('wallet.recentTransactions', {
            defaultValue: 'Giao dịch gần đây',
          })}
        </ThemedText>
        <TouchableOpacity>
          <ThemedText
            size="s"
            style={{ color: theme.colors.neonGreen }}
            weight="semiBold"
          >
            {t('wallet.viewAll', { defaultValue: 'Xem tất cả' })}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={MOCK_TRANSACTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.l,
          paddingBottom: theme.spacing.xxl * 2,
        }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCardWrapper: {
    borderBottomWidth: 0,
  },
  balanceCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMeta: {
    alignItems: 'flex-end',
  },
});

export default WalletScreen;



