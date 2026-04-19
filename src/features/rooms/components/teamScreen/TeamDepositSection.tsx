import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { ThemedView, ThemedText, ThemedIcon } from "@/shared/components/themed";
import type { Theme } from "@/shared/theme";
import { teamScreenStyles as styles } from "./teamScreenStyles";

type Props = {
  theme: Theme;
  t: (key: string) => string;
  depositPerPerson: number;
  isProcessingPayment: boolean;
  hasPaidDeposit: boolean;
  onProcessPayment: () => void;
  /** Direct / non-wallet payment — wire when API is ready */
  onDirectPayment?: () => void;
};

export const TeamDepositSection: React.FC<Props> = ({
  theme,
  t,
  depositPerPerson,
  isProcessingPayment,
  hasPaidDeposit,
  onProcessPayment,
  onDirectPayment,
}) => {
  const [paymentMethodVisible, setPaymentMethodVisible] = useState(false);

  const openPaymentChoices = () => {
    if (isProcessingPayment || hasPaidDeposit) return;
    setPaymentMethodVisible(true);
  };

  const closePaymentChoices = () => setPaymentMethodVisible(false);

  const handleWalletPayment = () => {
    closePaymentChoices();
    onProcessPayment();
  };

  const handleDirectPayment = () => {
    closePaymentChoices();
    onDirectPayment?.();
  };

  const accent = theme.colors.neonGreen ?? theme.colors.primary;

  return (
    <View style={styles.paymentSection}>
      <ThemedView
        style={[styles.paymentCard, { backgroundColor: theme.colors.surface }]}
      >
        <ThemedText
          variant="primary"
          size="l"
          weight="bold"
          style={styles.paymentTitle}
        >
          {t("teamScreen.checkinPayment")}
        </ThemedText>
        <View style={styles.paymentRow}>
          <ThemedText variant="secondary" size="s">
            {t("teamScreen.depositPerPersonLabel")}
          </ThemedText>
          <ThemedText variant="primary" size="l" weight="bold">
            {(depositPerPerson ?? 0).toLocaleString("vi-VN")}đ
          </ThemedText>
        </View>

        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              {
                backgroundColor: accent,
                opacity: isProcessingPayment || hasPaidDeposit ? 0.6 : 1,
              },
            ]}
            onPress={openPaymentChoices}
            disabled={isProcessingPayment || hasPaidDeposit}
          >
            <ThemedIcon name="card" size={20} color="#000" />
            <ThemedText
              size="m"
              weight="bold"
              style={[styles.paymentButtonText, { color: "#000" }]}
            >
              {isProcessingPayment
                ? t("teamScreen.paying")
                : hasPaidDeposit
                  ? t("teamScreen.paid")
                  : t("teamScreen.payNow")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <Modal
        visible={paymentMethodVisible}
        transparent
        animationType="fade"
        onRequestClose={closePaymentChoices}
      >
        <View style={styles.paymentMethodOverlay}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }]}
            onPress={closePaymentChoices}
          />
          <View
            style={[StyleSheet.absoluteFill, styles.paymentMethodSheetWrap]}
            pointerEvents="box-none"
          >
            <ThemedView
              style={[
                styles.paymentMethodSheet,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.paymentMethodHeader}>
                <ThemedText size="xl" weight="bold">
                  {t("teamScreen.paymentMethodTitle")}
                </ThemedText>
                <ThemedText
                  variant="secondary"
                  size="s"
                  style={{ marginTop: 6 }}
                >
                  {t("teamScreen.paymentMethodSubtitle")}
                </ThemedText>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.paymentMethodOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleWalletPayment}
              >
                <View
                  style={[
                    styles.paymentMethodOptionIcon,
                    { backgroundColor: `${accent}22` },
                  ]}
                >
                  <ThemedIcon name="wallet" size={22} color={accent} />
                </View>
                <View style={styles.paymentMethodOptionTextBlock}>
                  <ThemedText size="m" weight="semiBold">
                    {t("teamScreen.payWithWallet")}
                  </ThemedText>
                  <ThemedText variant="secondary" size="s" style={{ marginTop: 2 }}>
                    {t("teamScreen.payWithWalletDesc")}
                  </ThemedText>
                </View>
                <ThemedIcon name="chevron-forward" size={20} variant="secondary" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.paymentMethodOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleDirectPayment}
              >
                <View
                  style={[
                    styles.paymentMethodOptionIcon,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <ThemedIcon name="cash-outline" size={22} variant="secondary" />
                </View>
                <View style={styles.paymentMethodOptionTextBlock}>
                  <ThemedText size="m" weight="semiBold">
                    {t("teamScreen.directPayment")}
                  </ThemedText>
                  <ThemedText variant="secondary" size="s" style={{ marginTop: 2 }}>
                    {t("teamScreen.directPaymentDesc")}
                  </ThemedText>
                </View>
                <ThemedIcon name="chevron-forward" size={20} variant="secondary" />
              </TouchableOpacity>

              <View style={styles.paymentMethodFooter}>
                <TouchableOpacity onPress={closePaymentChoices} hitSlop={12}>
                  <ThemedText size="m" weight="semiBold" variant="secondary">
                    {t("common.buttons.cancel")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
