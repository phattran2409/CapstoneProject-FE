import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import Button from "@/shared/components/Button";
import { RootStackParamList } from "@/app/navigation/types";
import { bankInfoSchema, BankInfoFormData } from "../validation/walletSchemas";
import { useWalletBankInfo } from "../hooks";

type WalletWithdrawScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WalletWithdraw"
>;

interface WalletWithdrawScreenProps {
  navigation: WalletWithdrawScreenNavigationProp;
}

const WalletWithdrawScreen: React.FC<WalletWithdrawScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankAccountNumber: "",
      bankName: "",
      accountHolderName: "",
    },
  });

  const { mutate: updateBankInfo, isPending } = useWalletBankInfo();

  const getErrorMessage = (message?: string) => {
    if (!message) return "";
    return message.startsWith("validation.") ? t(message) : message;
  };

  const onSubmit = (data: BankInfoFormData) => {
    updateBankInfo(data, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <ThemedText variant="primary" size="xl" weight="bold">
            {t("wallet.withdrawTitle", { defaultValue: "Rút tiền về ngân hàng" })}
          </ThemedText>
          <View style={{ width: 24 }} />
        </ThemedView>

        {/* Content */}
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
            paddingBottom: theme.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText
            variant="secondary"
            size="s"
            style={{ marginBottom: theme.spacing.m }}
          >
            {t("wallet.withdrawDescription", {
              defaultValue:
                "Vui lòng nhập chính xác thông tin tài khoản ngân hàng để gửi yêu cầu rút tiền.",
            })}
          </ThemedText>

          {/* Bank Account Number */}
          <View style={styles.formField}>
            <ThemedText
              size="s"
              weight="semiBold"
              style={{ marginBottom: 4, color: theme.colors.text }}
            >
              {t("wallet.bankAccountNumberLabel", {
                defaultValue: "Số tài khoản ngân hàng",
              })}
            </ThemedText>
            <Controller
              control={control}
              name="bankAccountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.bankAccountNumber
                        ? theme.colors.error
                        : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder={t("wallet.bankAccountNumberPlaceholder", {
                    defaultValue: "Ví dụ: 0123456789",
                  })}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.bankAccountNumber && (
              <ThemedText
                size="xs"
                style={{ color: theme.colors.error, marginTop: 4 }}
              >
                {getErrorMessage(errors.bankAccountNumber.message)}
              </ThemedText>
            )}
          </View>

          {/* Bank Name */}
          <View style={styles.formField}>
            <ThemedText
              size="s"
              weight="semiBold"
              style={{ marginBottom: 4, color: theme.colors.text }}
            >
              {t("wallet.bankNameLabel", { defaultValue: "Tên ngân hàng" })}
            </ThemedText>
            <Controller
              control={control}
              name="bankName"
              render={({ field: { onChange, onBlur, value} }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.bankName
                        ? theme.colors.error
                        : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder={t("wallet.bankNamePlaceholder", {
                    defaultValue: "Ví dụ: MB Bank",
                  })}
                  placeholderTextColor={theme.colors.textSecondary}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.bankName && (
              <ThemedText
                size="xs"
                style={{ color: theme.colors.error, marginTop: 4 }}
              >
                {getErrorMessage(errors.bankName.message)}
              </ThemedText>
            )}
          </View>

          {/* Account Holder Name */}
          <View style={styles.formField}>
            <ThemedText
              size="s"
              weight="semiBold"
              style={{ marginBottom: 4, color: theme.colors.text }}
            >
              {t("wallet.accountHolderNameLabel", {
                defaultValue: "Họ và tên chủ tài khoản",
              })}
            </ThemedText>
            <Controller
              control={control}
              name="accountHolderName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.accountHolderName
                        ? theme.colors.error
                        : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder={t("wallet.accountHolderNamePlaceholder", {
                    defaultValue: "Ví dụ: NGUYỄN VĂN A",
                  })}
                  placeholderTextColor={theme.colors.textSecondary}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="characters"
                />
              )}
            />
            {errors.accountHolderName && (
              <ThemedText
                size="xs"
                style={{ color: theme.colors.error, marginTop: 4 }}
              >
                {getErrorMessage(errors.accountHolderName.message)}
              </ThemedText>
            )}
          </View>

          <Button
            title={
              isPending
                ? t("wallet.withdrawSubmitting", {
                    defaultValue: "Đang gửi yêu cầu...",
                  })
                : t("wallet.withdrawSubmit", {
                    defaultValue: "Gửi yêu cầu rút tiền",
                  })
            }
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            size="large"
            style={{
              marginTop: theme.spacing.l,
              backgroundColor: theme.colors.neonGreen,
              borderRadius: theme.radius.xl,
              opacity: isPending ? 0.7 : 1,
            }}
            textStyle={{ color: "#000" }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formField: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default WalletWithdrawScreen;

