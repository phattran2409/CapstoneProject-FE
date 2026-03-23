import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import Button from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { useWalletBalance, useWalletDeposit } from "../hooks";
import { RootStackParamList } from "@/app/navigation/types";
import { Transaction, TransactionQuery, TransactionType } from "../types/wallet.types";
import { useWalletTransaction } from "../hooks/useWalletTransaction";
import { formatDate, formatDateDDMMYYYY, formatDateTime } from "@/shared/utils";
import { helperTransactionCategory, helperTransactionTypeIcons } from "../helper/helperWallet";

const formatBalance = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

type WalletScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Wallet"
>;
interface WalletScreenProps {
  navigation: WalletScreenNavigationProp;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: wallet, isLoading: balanceLoading } = useWalletBalance();
  const depositMutation = useWalletDeposit();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [filterScrollWidth, setFilterScrollWidth] = useState(0);
  const [filterContentWidth, setFilterContentWidth] = useState(0);
  const [filterScrollX, setFilterScrollX] = useState(0);
  const [transactionQuery, setTransactionQuery] = useState<TransactionQuery>({
    page: 1,
    pageSize: 10,
    transactionType: undefined,
  });

  const handleFilterSelect = (type: TransactionType) => {
    setTransactionQuery({
      page: 1,
      pageSize: 10,
      transactionType: type === "All" ? undefined : type,
    });
  };

  const activeFilter: TransactionType = transactionQuery.transactionType ?? "All";
  const {transactions, loading, refreshing, loadingMore, error, hasMore, page, refresh, loadMore} = useWalletTransaction(transactionQuery);

  const handleOpenDepositModal = () => {
    setDepositAmount("");
    setDepositError("");
    setShowDepositModal(true);
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount?.replace(/\D/g, "") || 0);
    if (!amount || amount < 1000) {
      setDepositError(
        t("wallet.depositMinError", {
          defaultValue: "Vui lòng nhập số tiền tối thiểu 1.000 VND",
        }),
      );
      return;
    }
    setDepositError("");
    try {
      const result = await depositMutation.mutateAsync(amount);
      setShowDepositModal(false);
      if (result?.paymentUrl) {
        const canOpen = await Linking.canOpenURL(result.paymentUrl);
        if (canOpen) {
          await Linking.openURL(result.paymentUrl);
        } else {
          Alert.alert(
            t("wallet.depositTitle"),
            t("wallet.paymentLinkError"),
          );
        }
      } else {
        Alert.alert(
          t("wallet.depositTitle"),
          t("wallet.noPaymentUrl"),
        );
      }
    } catch (err: any) {
      console.error("Deposit error:", err);
      const errorMessage = err?.message || t("wallet.depositError");
      setDepositError(errorMessage);
      Alert.alert(t("common.error"), errorMessage);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.transactionType === "BookingIncome" || item.transactionType === "Deposit" || item.transactionType === "Refund";
    const { icon: iconName, color: iconColor, bg: iconBg } = helperTransactionTypeIcons(item.transactionType,theme);
    const category = helperTransactionCategory(item.transactionType, t);
    return (
      <ThemedView
        style={[
          styles.transactionItem,
          {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            borderRadius: theme.radius.l,
            marginBottom: theme.spacing.s,
            padding: theme.spacing.m,
          },
        ]}
      >
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: iconBg,
            },
          ]}
        >
          <Ionicons
            name={iconName as any}
            size={22}
            color={iconColor}
          />
        </View>

        <View style={styles.transactionInfo}>
          <ThemedText
            variant="primary"
            size="m"
            weight="semiBold"
            numberOfLines={1}
          >
            {item.description}
          </ThemedText>
          <ThemedText
            variant="secondary"
            size="xs"
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {formatDateTime(item.createdAt)}
          </ThemedText>
        </View>

        <View style={styles.transactionMeta}>
          <ThemedText
            size="m"
            weight="bold"
            style={{
              color: isIncome ? theme.colors.neonGreen : theme.colors.error,
              textAlign: "right",
            }}
          >
            {item.amount}
          </ThemedText>
          <ThemedText
            size="xs"
            style={{
              marginTop: 2,
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
            }}
          >
            {category}
          </ThemedText>
        </View>
      </ThemedView>
    );
  };

  const filterOptions: Array<{ key: TransactionType; label: string , value: TransactionType }> = [
    { key: "All", label: t("wallet.filters.all", { defaultValue: "Tất cả" })  , value: "All" },
    {
      key: "BookingPayment",
      label: t("wallet.filters.booking", { defaultValue: "Đặt sân" }),
      value: "BookingPayment",
    },
    {
      key: "Deposit",
      label: t("wallet.filters.topup", { defaultValue: "Nạp tiền" }),
      value: "Deposit",
    },
    {
      key: "Refund",
      label: t("wallet.filters.refund", { defaultValue: "Hoàn tiền" }),
      value: "Refund",
    },
    {
      key: "CheckinFee",
      label: t("wallet.filters.checkin", { defaultValue: "Check-in" }),
      value: "CheckinFee",
    },
    {
      key: "Withdraw",
      label: t("wallet.filters.withdraw", { defaultValue: "Rút tiền" }),
      value: "Withdraw",
    },
  ];


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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText variant="primary" size="xxl" weight="bold">
          {t("wallet.title", { defaultValue: "Ví tiền" })}
        </ThemedText>
        <TouchableOpacity></TouchableOpacity>
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
              backgroundColor: "#0f172a",
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
            {t("wallet.balanceLabel", {
              defaultValue: "Tổng số dư hiện có",
            })}
          </ThemedText>
          {balanceLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.neonGreen}
              style={{ marginVertical: 8 }}
            />
          ) : (
            <ThemedText
              style={{ color: theme.colors.neonGreen }}
              size="xxl"
              weight="bold"
            >
              {wallet ? `${formatBalance(wallet.balance)} VND` : "0 VND"}
            </ThemedText>
          )}

          <View style={styles.balanceActions}>
            <Button
              title={t("wallet.deposit", { defaultValue: "Nạp thêm" })}
              onPress={handleOpenDepositModal}
              size="medium"
              style={{
                flex: 1,
                marginRight: theme.spacing.s,
                backgroundColor: theme.colors.neonGreen,
              }}
              textStyle={{ color: "#000" }}
            />
            <Button
              title={t("wallet.withdraw", { defaultValue: "Rút tiền" })}
              onPress={() => navigation.navigate("WalletWithdraw")}
              size="medium"
              variant="outline"
              style={{ flex: 1, marginLeft: theme.spacing.s }}
            />
          </View>
        </ThemedView>
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
          {t("wallet.recentTransactions", {
            defaultValue: "Giao dịch gần đây",
          })}
        </ThemedText>
      </ThemedView>

      <View style={{ paddingHorizontal: theme.spacing.l, marginTop: 12 }}>
        <View
          style={{
            position: "relative",
          }}
          onLayout={(e) => {
            setFilterScrollWidth(e.nativeEvent.layout.width);
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: theme.spacing.l }}
            scrollEventThrottle={16}
            onContentSizeChange={(w) => setFilterContentWidth(w)}
            onScroll={(e) => {
              setFilterScrollX(e.nativeEvent.contentOffset.x);
            }}
          >
            {filterOptions.map((opt, idx) => {
              const active = opt.key === activeFilter;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => handleFilterSelect(opt.value)}
                  activeOpacity={0.85}
                  style={[
                    styles.filterPill,
                    {
                      marginRight: idx === filterOptions.length - 1 ? 0 : 10,
                      backgroundColor: active
                        ? theme.colors.neonGreen
                        : theme.colors.surface,
                      borderColor: active ? "transparent" : theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    size="s"
                    weight="semiBold"
                    style={{
                      color: active ? "#000" : theme.colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filterContentWidth > filterScrollWidth + filterScrollX + 8 && (
            <View pointerEvents="none" style={styles.filterScrollHint}>
              <View
                style={[
                  styles.filterScrollHintInner,
                  { backgroundColor: theme.colors.mediumGray },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.background}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transactionId}
        renderItem={renderTransactionItem}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.l,
          paddingBottom: theme.spacing.xxl * 2,
          paddingTop: 8,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.neonGreen}
              style={{ marginTop: 48 }}
            />
          ) : (
            <EmptyState
              icon="receipt-outline"
              title={t("wallet.emptyTransactions", { defaultValue: "Chưa có giao dịch nào" })}
              description={t("wallet.emptyTransactionsDesc", { defaultValue: "Các giao dịch của bạn sẽ hiển thị ở đây" })}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.neonGreen}
              style={{ marginVertical: theme.spacing.m }}
            />
          ) : null
        }
      />

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDepositModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardView}
          >
            <Pressable
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <ThemedText variant="primary" size="l" weight="bold">
                  {t("wallet.depositTitle")}
                </ThemedText>
                <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ThemedText variant="secondary" size="s" style={{ marginTop: 8 }}>
                {t("wallet.depositAmountLabel")}
              </ThemedText>

              <TextInput
                style={[
                  styles.depositInput,
                  {
                    borderColor: depositError
                      ? theme.colors.error
                      : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder={t("wallet.depositPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                value={depositAmount}
                onChangeText={(text) => {
                  setDepositAmount(text.replace(/\D/g, ""));
                  if (depositError) setDepositError("");
                }}
                keyboardType="number-pad"
              />
              {depositError ? (
                <ThemedText
                  size="xs"
                  style={{ color: theme.colors.error, marginTop: 4 }}
                >
                  {depositError}
                </ThemedText>
              ) : null}

              <Button
                title={
                  depositMutation.isPending
                    ? t("wallet.processing")
                    : t("wallet.payVNPay")
                }
                onPress={handleDeposit}
                disabled={depositMutation.isPending}
                size="medium"
                style={{
                  ...styles.modalButton,
                  backgroundColor: theme.colors.neonGreen,
                  opacity: depositMutation.isPending ? 0.7 : 1,
                }}
                textStyle={{ color: "#000" }}
              />

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDepositModal(false)}
              >
                <ThemedText variant="secondary" size="s">
                  {t("wallet.cancel")}
                </ThemedText>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceCardWrapper: {
    borderBottomWidth: 0,
  },
  balanceCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceActions: {
    flexDirection: "row",
    marginTop: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterScrollHint: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    paddingRight: 4,
  },
  filterScrollHintInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  filterPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMeta: {
    alignItems: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalKeyboardView: {
    width: "100%",
    justifyContent: "center",
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  depositInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 16,
  },
  modalButton: {
    marginTop: 20,
  },
  modalCancelButton: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
});

export default WalletScreen;
