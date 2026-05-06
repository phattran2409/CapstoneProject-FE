import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";

type Nav = NativeStackNavigationProp<RootStackParamList, "AppAboutTerms">;

interface Props {
  navigation: Nav;
}

const AppAboutTermsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const playerFeatures = useMemo(() => {
    const raw = t("appIntro.playerFeatures", { returnObjects: true });
    return Array.isArray(raw)
      ? (raw as unknown[]).filter((s): s is string => typeof s === "string")
      : [];
  }, [t]);

  const hostFeatures = useMemo(() => {
    const raw = t("appIntro.hostFeatures", { returnObjects: true });
    return Array.isArray(raw)
      ? (raw as unknown[]).filter((s): s is string => typeof s === "string")
      : [];
  }, [t]);

  const platformFeatures = useMemo(() => {
    const raw = t("appIntro.platformFeatures", { returnObjects: true });
    return Array.isArray(raw)
      ? (raw as unknown[]).filter((s): s is string => typeof s === "string")
      : [];
  }, [t]);

  const openRoomPolicyLines = useMemo(
    () => [
      `${t("roomDetail.openRoomPolicyStepDeadlineLabel")}: hệ thống tự đóng phòng khi chạm mốc hạn chốt.`,
      `${t("roomDetail.openRoomPolicyStepRuleLabel")} - ${t("roomDetail.openRoomPolicyRule.15m_grace")}: nếu trận được tạo khi còn dưới 2 giờ trước giờ đá, phòng sẽ được giữ tối đa 15 phút rồi đóng.`,
      `${t("roomDetail.openRoomPolicyStepRuleLabel")} - ${t("roomDetail.openRoomPolicyRule.24h_after_creation")} / ${t("roomDetail.openRoomPolicyRule.2h_before_kickoff")}: hệ thống chọn mốc đến sớm hơn để đóng phòng tự động.`,
    ],
    [t],
  );

  const renderBullet = (line: string, i: number) => (
    <View key={`${i}-${line.slice(0, 24)}`} style={styles.bulletRow}>
      <View
        style={[
          styles.bulletDot,
          { backgroundColor: theme.colors.neonGreen },
        ]}
      />
      <Text style={[styles.bulletText, { color: theme.colors.text }]}>{line}</Text>
    </View>
  );

  const sectionCard = (
    icon: keyof typeof Ionicons.glyphMap,
    titleKey: string,
    lines: string[],
  ) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.cardTitleRow}>
        <Ionicons name={icon} size={22} color={theme.colors.neonGreen} />
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {t(titleKey)}
        </Text>
      </View>
      {lines.map(renderBullet)}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerSide}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {t("appIntro.screenTitle")}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollInner,
          { paddingBottom: theme.spacing.xl * 2 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            {
              borderColor: theme.colors.neonGreen,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <View
            style={[
              styles.heroIconWrap,
              { borderColor: `${theme.colors.neonGreen}55` },
            ]}
          >
            <Ionicons name="football" size={36} color={theme.colors.neonGreen} />
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            {t("common.appName")}
          </Text>
          <Text style={[styles.projectCode, { color: theme.colors.neonGreen }]}>
            {t("appIntro.projectCode")}
          </Text>
          <Text
            style={[styles.projectNameVi, { color: theme.colors.textSecondary }]}
          >
            {t("appIntro.projectNameVi")}
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.text }]}>
            {t("appIntro.tagline")}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="information-circle-outline" size={22} color={theme.colors.neonGreen} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t("appIntro.sectionContextTitle")}
            </Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {t("appIntro.sectionContextBody", {
              appName: t("common.appName"),
            })}
          </Text>
        </View>

        {sectionCard("person-outline", "appIntro.sectionPlayerTitle", playerFeatures)}
        {sectionCard("flag-outline", "appIntro.sectionHostTitle", hostFeatures)}
        {sectionCard("analytics-outline", "appIntro.sectionPlatformTitle", platformFeatures)}
        {sectionCard(
          "time-outline",
          "roomDetail.openRoomPolicyTitle",
          openRoomPolicyLines,
        )}

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="document-text-outline" size={22} color={theme.colors.neonGreen} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t("appIntro.sectionTermsTitle")}
            </Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {t("appIntro.sectionTermsBody", { appName: t("common.appName") })}
          </Text>
        </View>

        <Text style={[styles.footerMeta, { color: theme.colors.textSecondary }]}>
          {t("appIntro.footerMeta")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerSide: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700" },
  scrollInner: { paddingHorizontal: 16, paddingTop: 16 },
  hero: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  projectCode: { fontSize: 14, fontWeight: "700", marginTop: 6, letterSpacing: 0.5, textAlign: "center" },
  projectName: { fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 },
  projectNameVi: { fontSize: 13, marginTop: 4, textAlign: "center", lineHeight: 20 },
  tagline: { fontSize: 14, marginTop: 14, textAlign: "center", lineHeight: 22, fontWeight: "600" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", flex: 1, marginLeft: 10 },
  body: { fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 22 },
  footerMeta: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 8, paddingHorizontal: 8 },
});

export default AppAboutTermsScreen;
