import { TFunction } from "i18next";
import { TransactionType } from "../types/wallet.types";
import { Theme } from "@/shared/theme";

export const helperTransactionCategory = (
    transactionType: TransactionType,
    t : TFunction
) => {
    switch (transactionType) {
        case "BookingPayment":
            return t("wallet.bookingPayment");
        case "Deposit":
            return t("wallet.topup");
        case "Refund":
            return t("wallet.refund");
        case "CheckinFee":
            return t("wallet.checkinFee");
        case "Withdraw":
            return t("wallet.withdraw");
    }
}

export const helperTransactionTypeIcons = (
    transactionType: TransactionType,
    theme: Theme
) : { icon: string; color: string; bg: string } => {
    switch (transactionType) {
        case "BookingPayment":
            return { icon: "card-outline", color: theme.colors.error, bg: `${theme.colors.error}20` };
        case "Deposit":
            return { icon: "wallet-outline", color: theme.colors.neonGreen, bg: `${theme.colors.neonGreen}20` };
        case "Refund":
            return { icon: "refresh-circle-outline", color: theme.colors.neonGreen, bg: `${theme.colors.neonGreen}20` };
        case "CheckinFee":
            return { icon: "enter-outline", color: theme.colors.error, bg: `${theme.colors.error}20` };
        case "Withdraw":
            return { icon: "arrow-up-circle-outline", color: theme.colors.error, bg: `${theme.colors.error}20` };
        default:
            return { icon: "cash-outline", color: theme.colors.textSecondary, bg: `${theme.colors.textSecondary}20` };
    }
}
