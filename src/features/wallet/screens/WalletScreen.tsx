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
import { useWalletBalance, useWalletDeposit, useGetBankInfo, useWithdrawal } from "../hooks";
import BankInfoCard from "../components/BankInfoCard";
import WithdrawItem from "../components/WithdrawItem";
import { RootStackParamList } from "@/app/navigation/types";
import { Transaction, TransactionQuery, TransactionType, withdrawals as WithdrawalItemType } from "../types/wallet.types";
import { useWalletTransaction } from "../hooks/useWalletTransaction";
import { useGetMyWithdrawals } from "../hooks/useWithdrawal";
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
  const { data: bankInfo, isLoading: bankInfoLoading } = useGetBankInfo();
  const withdrawMutation = useWithdrawal();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [filterScrollWidth, setFilterScrollWidth] = useState(0);
  const [filterContentWidth, setFilterContentWidth] = useState(0);
  const [filterScrollX, setFilterScrollX] = useState(0);
  const [withdrawStatus, setWithdrawStatus] = useState<string | undefined>(undefined);
  const [transactionQuery, setTransactionQuery] = useState<TransactionQuery>({
    page: 1,
    pageSize: 10,
    transactionType: undefined,
  });
  
  const handleFilterSelect = (type: TransactionType) => {
    if (type !== "Withdrawal") {
      setWithdrawStatus(undefined);
    }
    setTransactionQuery({
      page: 1,
      pageSize: 10,
      transactionType: type === "All" ? undefined : type,
    });
  };

  const activeFilter: TransactionType = transactionQuery.transactionType ?? "All";
  const {transactions, loading, refreshing, loadingMore, error, hasMore, page, refresh, loadMore} = useWalletTransaction(transactionQuery);
  const isWithdrawalMode = activeFilter === "Withdrawal";
  const {
    withdrawals,
    loading: loadingWithdrawals,
    refreshing: refreshingWithdrawals,
    loadingMore: loadingMoreWithdrawals,
    hasMore: hasMoreWithdrawals,
    refresh: refreshWithdrawals,
    loadMore: loadMoreWithdrawals,
  } = useGetMyWithdrawals(
    {
      page: 1,
      pageSize: 10,
      status: withdrawStatus,
    },
    isWithdrawalMode,
  );

  const handleOpenDepositModal = () => {
    setDepositAmount("");
    setDepositError("");
    setShowDepositModal(true);
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawAmount("");
    setWithdrawError("");
    setShowWithdrawModal(true);
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount?.replace(/\D/g, "") || 0);
    if (!amount || amount < 10000) {
      setWithdrawError(
        t("wallet.withdrawMinError", {
          defaultValue: "Vui lòng nhập số tiền tối thiểu 10.000 VND",
        }),
      );
      return;
    }
    setWithdrawError("");
    try {
      await withdrawMutation.mutateAsync({ amount });
      setShowWithdrawModal(false);
      Alert.alert(
        t("common.success"),
        t("wallet.withdrawSuccess", {
          defaultValue: "Yêu cầu rút tiền đã được gửi thành công",
        }),
      );
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t("wallet.withdrawError", {
          defaultValue: "Không thể gửi yêu cầu rút tiền. Vui lòng thử lại.",
        });
      setWithdrawError(errorMessage);
    }
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
            {formatBalance(item.amount)} VND
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
  const renderWithdrawalItem = ({ item }: { item: WithdrawalItemType }) => (
    <WithdrawItem withdrawal={item} />
  );

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
      key: "Withdrawal",
      label: t("wallet.filters.withdraw", { defaultValue: "Rút tiền" }),
      value: "Withdrawal",
    },
  ];
  const withdrawalStatusTabs: Array<{ key: string; label: string; value?: string }> = [
    { key: "all", label: t("wallet.withdrawStatus.all", { defaultValue: "Tất cả" }), value: undefined },
    { key: "pending", label: "Pending", value: "Pending" },
    { key: "processing", label: "Processing", value: "Processing" },
    { key: "completed", label: "Completed", value: "Completed" },
    { key: "rejected", label: "Rejected", value: "Rejected" },
    { key: "cancelled", label: "Cancelled", value: "Cancelled" },
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
              onPress={handleOpenWithdrawModal}
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

      {isWithdrawalMode && (
        <View style={{ paddingHorizontal: theme.spacing.l, marginTop: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: theme.spacing.l }}
          >
            {withdrawalStatusTabs.map((tab, idx) => {
              const isActive = tab.value === withdrawStatus || (!tab.value && !withdrawStatus);
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setWithdrawStatus(tab.value)}
                  activeOpacity={0.85}
                  style={[
                    styles.filterPill,
                    {
                      marginRight: idx === withdrawalStatusTabs.length - 1 ? 0 : 10,
                      backgroundColor: isActive ? theme.colors.neonGreen : theme.colors.surface,
                      borderColor: isActive ? "transparent" : theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    size="s"
                    weight="semiBold"
                    style={{ color: isActive ? "#000" : theme.colors.textSecondary }}
                  >
                    {tab.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {isWithdrawalMode ? (
        <FlatList
          data={withdrawals}
          keyExtractor={(item: WithdrawalItemType) => item.withdrawalId}
          renderItem={renderWithdrawalItem}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.l,
            paddingBottom: theme.spacing.xxl * 2,
            paddingTop: 8,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshingWithdrawals}
          onRefresh={refreshWithdrawals}
          onEndReached={hasMoreWithdrawals ? loadMoreWithdrawals : undefined}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            loadingWithdrawals ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.neonGreen}
                style={{ marginTop: 48 }}
              />
            ) : (
              <EmptyState
                icon="receipt-outline"
                title={t("wallet.emptyWithdrawals", { defaultValue: "Chưa có yêu cầu rút tiền nào" })}
                description={t("wallet.emptyWithdrawalsDesc", { defaultValue: "Các yêu cầu rút tiền của bạn sẽ hiển thị ở đây" })}
              />
            )
          }
          ListFooterComponent={
            loadingMoreWithdrawals ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.neonGreen}
                style={{ marginVertical: theme.spacing.m }}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item: Transaction) => item.transactionId}
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
      )}

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
      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowWithdrawModal(false)}
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
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <ThemedText variant="primary" size="l" weight="bold">
                  {t("wallet.withdrawTitle", {
                    defaultValue: "Rút tiền về ngân hàng",
                  })}
                </ThemedText>
                <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Bank Info Section */}
              {bankInfoLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.neonGreen}
                  style={{ marginTop: 16 }}
                />
              ) : bankInfo?.hasBankInfo ? (
                <View style={{ marginTop: 16 }}>
                  <BankInfoCard
                    bankInfo={bankInfo}
                    onEdit={() => {
                      setShowWithdrawModal(false);
                      navigation.navigate("WalletWithdraw");
                    }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.noBankInfoBox,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Ionicons
                    name="card-outline"
                    size={36}
                    color={theme.colors.textSecondary}
                    style={{ marginBottom: 8 }}
                  />
                  <ThemedText
                    variant="primary"
                    size="m"
                    weight="semiBold"
                    style={{ textAlign: "center" }}
                  >
                    {t("wallet.noBankInfo", {
                      defaultValue: "Chưa có thông tin ngân hàng",
                    })}
                  </ThemedText>
                  <ThemedText
                    variant="secondary"
                    size="s"
                    style={{ textAlign: "center", marginTop: 4 }}
                  >
                    {t("wallet.noBankInfoDesc", {
                      defaultValue:
                        "Vui lòng thêm thông tin ngân hàng trước khi rút tiền",
                    })}
                  </ThemedText>
                  <Button
                    title={t("wallet.addBankInfo", {
                      defaultValue: "Thêm thông tin ngân hàng",
                    })}
                    onPress={() => {
                      setShowWithdrawModal(false);
                      navigation.navigate("WalletWithdraw");
                    }}
                    size="medium"
                    style={{
                      marginTop: 16,
                      backgroundColor: theme.colors.neonGreen,
                    }}
                    textStyle={{ color: "#000" }}
                  />
                </View>
              )}

              {/* Amount Input — only shown when bank info exists */}
              {bankInfo?.hasBankInfo && (
                <>
                  <ThemedText
                    variant="secondary"
                    size="s"
                    style={{ marginTop: 16 }}
                  >
                    {t("wallet.withdrawAmountLabel", {
                      defaultValue: "Số tiền muốn rút (VND)",
                    })}
                  </ThemedText>

                  <TextInput
                    style={[
                      styles.depositInput,
                      {
                        borderColor: withdrawError
                          ? theme.colors.error
                          : theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                    placeholder={t("wallet.withdrawAmountPlaceholder", {
                      defaultValue: "Ví dụ: 50000",
                    })}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={withdrawAmount}
                    onChangeText={(text) => {
                      setWithdrawAmount(text.replace(/\D/g, ""));
                      if (withdrawError) setWithdrawError("");
                    }}
                    keyboardType="number-pad"
                  />
                  {withdrawError ? (
                    <ThemedText
                      size="xs"
                      style={{ color: theme.colors.error, marginTop: 4 }}
                    >
                      {withdrawError}
                    </ThemedText>
                  ) : null}

                  <Button
                    title={
                      withdrawMutation.isPending
                        ? t("wallet.withdrawSubmitting", {
                            defaultValue: "Đang gửi...",
                          })
                        : t("wallet.withdrawConfirm", {
                            defaultValue: "Xác nhận rút tiền",
                          })
                    }
                    onPress={handleWithdraw}
                    disabled={withdrawMutation.isPending}
                    size="medium"
                    style={{
                      ...styles.modalButton,
                      backgroundColor: theme.colors.neonGreen,
                      opacity: withdrawMutation.isPending ? 0.7 : 1,
                    }}
                    textStyle={{ color: "#000" }}
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowWithdrawModal(false)}
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
  noBankInfoBox: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
});

export default WalletScreen;
