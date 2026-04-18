import React from "react";
import { View, TouchableOpacity } from "react-native";
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
};

export const TeamDepositSection: React.FC<Props> = ({
  theme,
  t,
  depositPerPerson,
  isProcessingPayment,
  hasPaidDeposit,
  onProcessPayment,
}) => (
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
      <ThemedText
        variant="secondary"
        size="xs"
        style={{ marginTop: 10, lineHeight: 18 }}
      >
        {t("teamScreen.depositHint")}
      </ThemedText>

      <View style={styles.paymentButtons}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            {
              backgroundColor: theme.colors.neonGreen,
              opacity: isProcessingPayment || hasPaidDeposit ? 0.6 : 1,
            },
          ]}
          onPress={onProcessPayment}
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
  </View>
);
