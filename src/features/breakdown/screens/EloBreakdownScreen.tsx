import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootStackParamList } from "@/app/navigation/types";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import EloBreakdownItem from "../components/EloBreakdownItem";

type EloBreakdownScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EloBreakdown"
>;

type EloBreakdownScreenRouteProp = RouteProp<RootStackParamList, "EloBreakdown">;

interface EloBreakdownScreenProps {
  navigation: EloBreakdownScreenNavigationProp;
  route: EloBreakdownScreenRouteProp;
}

const EloBreakdownScreen: React.FC<EloBreakdownScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    eloDelta = 25,
    matchLabel = "FC Dragons 3 - 1 Wolves",
    isWin = true,
  } = route.params || {};

  const badgeScale = useSharedValue(0);
  const pointsScale = useSharedValue(0);

  React.useEffect(() => {
    badgeScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    pointsScale.value = withTiming(1, { duration: 350 });
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
    opacity: interpolate(pointsScale.value, [0, 1], [0, 1]),
  }));

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    navigation.goBack();
  };

  const isPositive = eloDelta >= 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t("eloBreakdown.title", "CHI TIẾT THAY ĐỔI ELO")}
        </Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top summary */}
        <View style={styles.summaryContainer}>
          <Animated.View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.primary,
              },
              badgeStyle,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: theme.colors.background },
              ]}
            >
              {isPositive
                ? t("eloBreakdown.rankUp", "THĂNG HẠNG MỚI")
                : t("eloBreakdown.rankDown", "GIẢM HẠNG")}
            </Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.pointsText,
              {
                color: isPositive ? theme.colors.primary : theme.colors.error,
              },
              pointsStyle,
            ]}
          >
            {`${isPositive ? "+" : ""}${eloDelta}`}
          </Animated.Text>

          <Text
            style={[
              styles.summaryDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {isPositive
              ? t(
                  "eloBreakdown.summaryWin",
                  "Tuyệt vời! Bạn vừa giành chiến thắng trước đối thủ có xếp hạng cao hơn.",
                )
              : t(
                  "eloBreakdown.summaryLose",
                  "Bạn đã để thua trước đối thủ. Đừng nản, hãy tiếp tục cố gắng ở trận tiếp theo.",
                )}
          </Text>

          {/* Last match card */}
          <View
            style={[
              styles.lastMatchCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.lastMatchLeft}>
              <Ionicons
                name="football-outline"
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.lastMatchTexts}>
                <Text
                  style={[
                    styles.lastMatchLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t("eloBreakdown.lastMatch", "TRẬN GẦN NHẤT")}
                </Text>
                <Text
                  style={[
                    styles.lastMatchName,
                    { color: theme.colors.text },
                  ]}
                >
                  {matchLabel}
                </Text>
              </View>
            </View>

            <View style={styles.lastMatchRight}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>

        {/* Detailed breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("eloBreakdown.detailTitle", "PHÂN TÍCH CHI TIẾT")}
          </Text>

          <EloBreakdownItem
            type="matchResult"
            title={t("eloBreakdown.matchResult.title", "Kết quả trận đấu")}
            description={t(
              "eloBreakdown.matchResult.desc",
              "Chiến thắng 3-1 thuyết phục",
            )}
            value="+15"
            valueDelta={15}
          />

          <EloBreakdownItem
            type="teammateRating"
            title={t("eloBreakdown.teammateRating.title", "Đánh giá đồng đội")}
            description={t(
              "eloBreakdown.teammateRating.desc",
              "Được bình chọn là MVP của trận",
            )}
            value="+5"
            valueDelta={5}
          />

          <EloBreakdownItem
            type="winRate"
            title={t("eloBreakdown.winRate.title", "Tỷ lệ thắng")}
            description={t(
              "eloBreakdown.winRate.desc",
              "Thắng đối thủ có bậc Rank cao hơn",
            )}
            value="+3"
            valueDelta={3}
          />

          <EloBreakdownItem
            type="feedbackContribution"
            title={t(
              "eloBreakdown.feedbackContribution.title",
              "Đóng góp đánh giá",
            )}
            description={t(
              "eloBreakdown.feedbackContribution.desc",
              "Hoàn thành đầy đủ đánh giá sau trận đấu",
            )}
            value="+2"
            valueDelta={2}
          />

          <EloBreakdownItem
            type="reputation"
            title={t("eloBreakdown.reputation.title", "Uy tín")}
            description={t(
              "eloBreakdown.reputation.desc",
              "Không có vi phạm, tinh thần Fair-play",
            )}
            value="+0"
            valueDelta={0}
          />
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: theme.colors.primary },
          ]}
          activeOpacity={0.9}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueText,
              { color: theme.colors.background },
            ]}
          >
            {t("eloBreakdown.continue", "TIẾP TỤC")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.background}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  summaryContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  badge: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pointsText: {
    fontSize: 56,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  summaryDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginHorizontal: 12,
  },
  lastMatchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 24,
  },
  lastMatchLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMatchTexts: {
    marginLeft: 12,
  },
  lastMatchLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  lastMatchName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  lastMatchRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 24,
    gap: 6,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default EloBreakdownScreen;


