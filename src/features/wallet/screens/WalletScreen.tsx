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
import { useWalletBalance, useWalletDeposit } from "../hooks";
import { RootStackParamList } from "@/app/navigation/types";

const formatBalance = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

type WalletScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Wallet"
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
  type: "in" | "out";
  category: "topup" | "booking" | "refund" | "checkin" | "withdraw";
  status: string;
  time: string;
}

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "1",
    title: "Nạp qua VNPay",
    description: "10:30, 20/10/2023",
    icon: "wallet",
    amount: "+500.000",
    type: "in",
    category: "topup",
    status: "THÀNH CÔNG",
    time: "10:30, 20/10/2023",
  },
  {
    id: "2",
    title: "Đặt sân: Thống Nhất",
    description: "09:15, 20/10/2023",
    icon: "football",
    amount: "-200.000",
    type: "out",
    category: "booking",
    status: "THANH TOÁN",
    time: "09:15, 20/10/2023",
  },
  {
    id: "3",
    title: "Phí check-in trận #122",
    description: "18:00, 19/10/2023",
    icon: "walk",
    amount: "-20.000",
    type: "out",
    category: "checkin",
    status: "PHÍ DỊCH VỤ",
    time: "18:00, 19/10/2023",
  },
  {
    id: "4",
    title: "Hoàn tiền đặt sân",
    description: "15:30, 19/10/2023",
    icon: "refresh",
    amount: "+150.000",
    type: "in",
    category: "refund",
    status: "HOÀN TRẢ",
    time: "15:30, 19/10/2023",
  },
  {
    id: "5",
    title: "Rút tiền về MBBank",
    description: "08:00, 18/10/2023",
    icon: "arrow-up",
    amount: "-300.000",
    type: "out",
    category: "withdraw",
    status: "CHỜ XỬ LÝ",
    time: "08:00, 18/10/2023",
  },
];

type TransactionFilterKey = "all" | WalletTransaction["category"];

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: wallet, isLoading: balanceLoading } = useWalletBalance();
  const depositMutation = useWalletDeposit();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<TransactionFilterKey>("all");
  const [filterScrollWidth, setFilterScrollWidth] = useState(0);
  const [filterContentWidth, setFilterContentWidth] = useState(0);
  const [filterScrollX, setFilterScrollX] = useState(0);

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
      console.log("💰 Attempting deposit with amount:", amount);
      const result = await depositMutation.mutateAsync(amount);
      console.log("✅ Deposit result:", result);
      setShowDepositModal(false);
      if (result?.paymentUrl) {
        const canOpen = await Linking.canOpenURL(result.paymentUrl);
        if (canOpen) {
          await Linking.openURL(result.paymentUrl);
        } else {
          Alert.alert(
            t("common.error", { defaultValue: "Lỗi" }),
            t("wallet.paymentLinkError", {
              defaultValue: "Không thể mở link thanh toán. Vui lòng thử lại.",
            }),
          );
        }
      } else {
        console.warn("⚠️ No payment URL in result:", result);
        Alert.alert(
          t("common.error", { defaultValue: "Lỗi" }),
          t("wallet.noPaymentLinkError", {
            defaultValue: "Không nhận được link thanh toán. Vui lòng thử lại.",
          }),
        );
      }
    } catch (err: any) {
      console.error("❌ Deposit error:", err);
      const errorMessage =
        err?.message ||
        t("wallet.genericError", {
          defaultValue: "Có lỗi xảy ra. Vui lòng thử lại.",
        });
      setDepositError(errorMessage);
      Alert.alert(t("common.error", { defaultValue: "Lỗi" }), errorMessage);
    }
  };

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
    const isIncome = item.type === "in";

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
            {item.status}
          </ThemedText>
        </View>
      </ThemedView>
    );
  };

  const filterOptions: Array<{ key: TransactionFilterKey; label: string }> = [
    { key: "all", label: t("wallet.filters.all", { defaultValue: "Tất cả" }) },
    {
      key: "booking",
      label: t("wallet.filters.booking", { defaultValue: "Đặt sân" }),
    },
    {
      key: "topup",
      label: t("wallet.filters.topup", { defaultValue: "Nạp tiền" }),
    },
    {
      key: "refund",
      label: t("wallet.filters.refund", { defaultValue: "Hoàn tiền" }),
    },
    {
      key: "checkin",
      label: t("wallet.filters.checkin", { defaultValue: "Check-in" }),
    },
    {
      key: "withdraw",
      label: t("wallet.filters.withdraw", { defaultValue: "Rút tiền" }),
    },
  ];

  const filteredTransactions =
    selectedFilter === "all"
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((tx) => tx.category === selectedFilter);

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
              const active = opt.key === selectedFilter;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSelectedFilter(opt.key)}
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
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.l,
          paddingBottom: theme.spacing.xxl * 2,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
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
                  {t("wallet.depositTitle", {
                    defaultValue: "Nạp tiền vào ví",
                  })}
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
                {t("wallet.depositAmountLabel", {
                  defaultValue: "Nhập số tiền cần nạp (VND)",
                })}
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
                placeholder={t("wallet.depositAmountPlaceholder", {
                  defaultValue: "Ví dụ: 50000",
                })}
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
                    ? t("wallet.processing", { defaultValue: "Đang xử lý..." })
                    : t("wallet.payViaVNPay", {
                        defaultValue: "Thanh toán VNPay",
                      })
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
                  {t("common.buttons.cancel", { defaultValue: "Hủy" })}
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
