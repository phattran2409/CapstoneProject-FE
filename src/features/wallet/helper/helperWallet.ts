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
        case "CheckInFee":
            return t("wallet.checkinFee");
        case "Withdrawal":
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
        case "CheckInFee":
            return { icon: "enter-outline", color: theme.colors.error, bg: `${theme.colors.error}20` };
        case "Withdrawal":
            return { icon: "arrow-up-circle-outline", color: theme.colors.error, bg: `${theme.colors.error}20` };
        default:
            return { icon: "cash-outline", color: theme.colors.textSecondary, bg: `${theme.colors.textSecondary}20` };
    }
}

export const helperTranslateTransactionDescription = (
    description: string,
    language: string
): string => {
    if (!description) return description;
    if (language.toLowerCase().startsWith("en")) return description;

    const rules: Array<[RegExp, (...groups: string[]) => string]> = [
        [/^Payment for room (.+)$/i, (room) => `Thanh toán tiền sân cho trận ${room}`],
        [/^VNPay check-in for room (.+)$/i, (room) => `Thanh toán check-in VNPay cho trận ${room}`],
        [/^Deposit by VNPay - (.+)$/i, (bankCode) => `Nạp tiền qua VNPay - Ngân hàng ${bankCode}`],
        [/^Withdrawal approved - (.+) - (.+)$/i, (bankName, bankAccountNumber) => `Rút tiền đã được duyệt - ${bankName} - ${bankAccountNumber}`],
        [/^Refund for auto-closed room (.+)$/i, (room) => `Hoàn tiền cho phòng tự động đóng ${room}`],
        [/^Refund \(100%\) for leaving room (.+)$/i, (room) => `Hoàn tiền (100%) khi rời trận ${room}`],
        [/^Refund \(100%\) for being kicked from room (.+)$/i, (room) => `Hoàn tiền (100%) khi bị kick ra khỏi trận${room}`],
        [/^Refund \(100%\) for cancelled room (.+)$/i, (room) => `Hoàn tiền (100%) cho trận đã hủy ${room}`],
        [/^Penalty fee \(25%\) for cancellation 4-24h prior\. Room: (.+)$/i, (room) => `Phí phạt (25%) do hủy trong vòng 4-24h trước giờ đá. Trận: ${room}`],
        [/^Host Cancel Penalty Compensation for Room: (.+)$/i, (room) => `Bồi thường do host hủy trận: ${room}`],
        [/^Booking income from room (.+) \(Match Started\)$/i, (room) => `Thu nhập tiền sân từ trận ${room} (Trận đã bắt đầu)`],
    ];

    for (const [pattern, formatter] of rules) {
        const match = description.match(pattern);
        if (match) {
            return formatter(...match.slice(1));
        }
    }

    return description;
};
