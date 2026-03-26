import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { ThemedText } from "@/shared/components/themed";
import { BankInfo } from "../types/wallet.types";

interface BankInfoCardProps {
  bankInfo: BankInfo;
  onEdit?: () => void;
  style?: StyleProp<ViewStyle>;
}

const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  return `•••• •••• ${accountNumber.slice(-4)}`;
};

const BankInfoCard: React.FC<BankInfoCardProps> = ({ bankInfo, onEdit, style }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: "#0f172a",
          borderRadius: theme.radius.xl,
          padding: theme.spacing.l,
        },
        style,
      ]}
    >
      {/* Top Row: bank name + edit button */}
      <View style={styles.topRow}>
        <View style={styles.bankNameRow}>
          <View
            style={[
              styles.bankIconWrapper,
              { backgroundColor: theme.colors.neonGreen + "22" },
            ]}
          >
            <Ionicons
              name="business-outline"
              size={14}
              color={theme.colors.neonGreen}
            />
          </View>
          <ThemedText
            style={{
              color: "#94a3b8",
              fontSize: 12,
              letterSpacing: 1.5,
              marginLeft: 6,
            }}
            weight="semiBold"
          >
            {bankInfo.bankName.toUpperCase()}
          </ThemedText>
        </View>

        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons
              name="pencil-outline"
              size={16}
              color={theme.colors.neonGreen}
            />
            <ThemedText
              style={{ color: theme.colors.neonGreen, fontSize: 12, marginLeft: 4 }}
              weight="semiBold"
            >
              {t("wallet.changeBankInfo", { defaultValue: "Thay đổi" })}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Decorative chip */}
      <View
        style={[
          styles.chip,
          { borderColor: theme.colors.neonGreen + "66" },
        ]}
      >
        <View
          style={[
            styles.chipInner,
            { backgroundColor: theme.colors.neonGreen + "33" },
          ]}
        />
      </View>

      {/* Account Number */}
      <ThemedText
        style={{
          color: "#e2e8f0",
          fontSize: 18,
          letterSpacing: 4,
          marginTop: theme.spacing.m,
          fontVariant: ["tabular-nums"],
        }}
        weight="bold"
      >
        {maskAccountNumber(bankInfo.bankAccountNumber)}
      </ThemedText>

      {/* Account Holder Name */}
      <ThemedText
        style={{
          color: "#94a3b8",
          fontSize: 13,
          letterSpacing: 1,
          marginTop: theme.spacing.s,
          textTransform: "uppercase",
        }}
        weight="semiBold"
      >
        {bankInfo.accountHolderName}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  chipInner: {
    width: 20,
    height: 14,
    borderRadius: 3,
  },
});

export default BankInfoCard;
