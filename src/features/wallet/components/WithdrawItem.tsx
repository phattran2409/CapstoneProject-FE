import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ThemedText, ThemedView } from "@/shared/components/themed";
import { useTheme } from "@/shared/theme";
import { formatDateTime } from "@/shared/utils";
import { withdrawals } from "../types/wallet.types";
import { formatCurrency } from "@/shared/utils/formatters";

interface WithdrawItemProps {
  withdrawal: withdrawals;
}

const WithdrawItem: React.FC<WithdrawItemProps> = ({ withdrawal }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const status = (withdrawal.status ?? "").toLowerCase();
  const statusColorMap: Record<string, string> = {
    pending: "#f59e0b",
    processing: "#0ea5e9",
    completed: theme.colors.neonGreen,
    rejected: theme.colors.error,
    cancelled: theme.colors.textSecondary,
  };
  const statusColor = statusColorMap[status] ?? theme.colors.textSecondary;

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <ThemedText variant="primary" size="m" weight="bold">
          {formatCurrency(withdrawal.amount)}
        </ThemedText>
        <View
          style={[
            styles.statusBadge,
            {
              borderColor: statusColor,
              backgroundColor: `${statusColor}1A`,
            },
          ]}
        >
          <ThemedText size="xs" weight="semiBold" style={{ color: statusColor }}>
            {t(`wallet.withdrawStatus.${status}`, { defaultValue: withdrawal.status })}
          </ThemedText>
        </View>
      </View>

      <ThemedText variant="secondary" size="xs" style={{ marginTop: 6 }}>
        {formatDateTime(withdrawal.createdAt)}
      </ThemedText>

      <ThemedText variant="secondary" size="xs" style={{ marginTop: 8 }}>
        {withdrawal.bankName} • {withdrawal.bankAccountNumber}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default WithdrawItem;