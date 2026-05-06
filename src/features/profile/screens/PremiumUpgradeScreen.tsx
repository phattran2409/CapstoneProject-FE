import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useToast } from "@/shared/toast";
import { getTranslatedError } from "@/shared/utils/errorTranslations";
import {
  usePremiumDirectPurchase,
  usePremiumWalletPurchase,
} from "@/features/profile/hooks";

const PremiumUpgradeScreen: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [paymentMethodVisible, setPaymentMethodVisible] = React.useState(false);
  const { mutateAsync: directPurchase, isPending: isDirectPending } =
    usePremiumDirectPurchase();
  const { mutateAsync: walletPurchase, isPending: isWalletPending } =
    usePremiumWalletPurchase();
  const isProcessingPayment = isDirectPending || isWalletPending;

  const featureKeys = [
    "aiSuggestion",
    "radarSummary",
    "aiFeedback",
    "premiumBadge",
  ] as const;

  const closePaymentChoices = () => {
    if (isProcessingPayment) return;
    setPaymentMethodVisible(false);
  };

  const openPaymentChoices = () => {
    if (isProcessingPayment) return;
    setPaymentMethodVisible(true);
  };

  const handleWalletPayment = async () => {
    if (isProcessingPayment) return;
    try {
      await walletPurchase();
      closePaymentChoices();
      toast.success(t("profile.premium.payment.walletSuccess"));
    } catch (error: unknown) {
      toast.error(
        getTranslatedError(
          (error as { message?: string; code?: string })?.message,
          (error as { message?: string; code?: string })?.code,
        ) || t("profile.premium.payment.walletError"),
      );
    }
  };

  const handleDirectPayment = async () => {
    if (isProcessingPayment) return;
    try {
      const data = await directPurchase();
      const canOpen = await Linking.canOpenURL(data.paymentUrl);
      if (canOpen) {
        closePaymentChoices();
        toast.info(t("profile.premium.payment.directSuccess"));
        setTimeout(() => {
          Linking.openURL(data.paymentUrl);
        }, 500);
      } else {
        toast.error(t("profile.premium.payment.directError"));
      }
    } catch (error: unknown) {
      toast.error(
        getTranslatedError(
          (error as { message?: string; code?: string })?.message,
          (error as { message?: string; code?: string })?.code,
        ) || t("profile.premium.payment.directError"),
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{t("profile.premium.title")}</Text>
        <Text style={styles.screenSubtitle}>{t("profile.premium.subtitle")}</Text>

        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.cardBody}>
            <Text style={styles.badge}>{t("profile.premium.tierBadge")}</Text>
            <View style={styles.priceColumn}>
              <Text style={styles.planName}>{t("profile.premium.planName")}</Text>
              <Text style={styles.price}>{t("profile.premium.price")}</Text>
            </View>

            <View style={styles.featureList}>
              {featureKeys.map((key) => (
                <View key={key} style={styles.featureItem}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="checkmark" size={14} color="#FFD700" />
                  </View>
                  <Text style={styles.featureText}>
                    {t(`profile.premium.features.${key}`)}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={openPaymentChoices}
              disabled={isProcessingPayment}
            >
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, isProcessingPayment && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>{t("profile.premium.cta")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>

      <Modal
        visible={paymentMethodVisible}
        transparent
        animationType="fade"
        onRequestClose={closePaymentChoices}
      >
        <View style={styles.paymentMethodOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closePaymentChoices}
            disabled={isProcessingPayment}
          />
          <View style={styles.paymentMethodSheetWrap} pointerEvents="box-none">
            <View style={styles.paymentMethodSheet}>
              <View style={styles.paymentMethodHeader}>
                <Text style={styles.paymentMethodTitle}>
                  {t("profile.premium.payment.title")}
                </Text>
                <Text style={styles.paymentMethodSubtitle}>
                  {t("profile.premium.payment.subtitle")}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.paymentMethodOption}
                onPress={handleWalletPayment}
                disabled={isProcessingPayment}
              >
                <View style={styles.paymentMethodOptionIconGold}>
                  <Ionicons name="wallet" size={22} color="#FFD700" />
                </View>
                <View style={styles.paymentMethodOptionTextBlock}>
                  <Text style={styles.paymentMethodOptionTitle}>
                    {t("profile.premium.payment.wallet")}
                  </Text>
                  <Text style={styles.paymentMethodOptionDesc}>
                    {t("profile.premium.payment.walletDesc")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9EA5B5" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.paymentMethodOption}
                onPress={handleDirectPayment}
                disabled={isProcessingPayment}
              >
                <View style={styles.paymentMethodOptionIcon}>
                  <Ionicons name="card-outline" size={22} color="#FFD700" />
                </View>
                <View style={styles.paymentMethodOptionTextBlock}>
                  <Text style={styles.paymentMethodOptionTitle}>
                    {t("profile.premium.payment.direct")}
                  </Text>
                  <Text style={styles.paymentMethodOptionDesc}>
                    {t("profile.premium.payment.directDesc")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9EA5B5" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closePaymentChoices}
                hitSlop={12}
                disabled={isProcessingPayment}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{t("common.buttons.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    textTransform: "uppercase",
    lineHeight: 42,
    marginBottom: 10,
  },
  screenSubtitle: {
    color: "#B3B8C4",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  cardBorder: {
    borderRadius: 20,
    padding: 1.2,
  },
  cardBody: {
    borderRadius: 18,
    backgroundColor: "#15161C",
    padding: 18,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#2A2B2F",
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  priceColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 6,
  },
  planName: {
    color: "#FFD700",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
    textTransform: "uppercase",
  },
  price: {
    color: "#FFD700",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "left",
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#202127",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  featureText: {
    color: "#E9EDF6",
    fontSize: 15,
    flex: 1,
    lineHeight: 21,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#0D0D0D",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  paymentMethodOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  paymentMethodSheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  paymentMethodSheet: {
    backgroundColor: "#111218",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2B31",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 10,
  },
  paymentMethodHeader: {
    marginBottom: 8,
  },
  paymentMethodTitle: {
    color: "#F3F5FA",
    fontSize: 22,
    fontWeight: "800",
  },
  paymentMethodSubtitle: {
    color: "#9EA5B5",
    fontSize: 13,
    marginTop: 4,
  },
  paymentMethodOption: {
    backgroundColor: "#181A22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2B31",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodOptionIconGold: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFD70022",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  paymentMethodOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#21242D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  paymentMethodOptionTextBlock: {
    flex: 1,
  },
  paymentMethodOptionTitle: {
    color: "#F3F5FA",
    fontSize: 15,
    fontWeight: "700",
  },
  paymentMethodOptionDesc: {
    color: "#9EA5B5",
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 2,
  },
  cancelButtonText: {
    color: "#9EA5B5",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default PremiumUpgradeScreen;
