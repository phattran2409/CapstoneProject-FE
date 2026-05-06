import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import RadarChart from "@/features/profile/components/RadarChart";
import { AIAssessmentCard } from "./AIAssessmentCard";

interface AnalysisTabProps {
  radarData: {
    form: number;
    winRate: number;
    communityScore: number;
    trust: number;
    contribution: number;
    summary?: string;
    assessments?: Array<{
      type?: string;       // "strength" | "improvement"
      title: string;
      description: string;
      icon?: string;       // BE icon key: "shield", "message-circle", etc.
      highlightAxis?: string;
    }>;
  } | null;
  isLoading?: boolean;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  radarData,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const assessments = radarData?.assessments ?? [];

  return (
    <View style={[styles.container, { paddingHorizontal: theme.spacing.m }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.l,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: theme.fontSizes.xl,
              color: theme.colors.text,
              fontWeight: "700",
            },
          ]}
        >
          {t("personalPage.analysis.title")}
        </Text>
      </View>

      {/* Radar Chart */}
      <View
        style={[
          styles.chartContainer,
          {
            alignItems: "center",
            marginBottom: theme.spacing.l,
          },
        ]}
      >
        {/* //Radar chart Biểu đồ Hồ sơ Thi đấu

Radar chart đóng vai trò minh bạch hóa các yếu tố ảnh hưởng đến xếp hạng, giúp người chơi cải thiện hành vi hoặc người khác có thể xem và đánh giá.

Form (phong Độ) = Average(Result - Expected) trong 10 trận gần nhất
WinRate: tỉ lệ thắng 10 trận gần nhất
communityScore: trung bình (Feedback/Sentiment)
TrustScore (max: 100)
ContributionRate = số lần đánh giá / số trận tham gia

ví dụ trả về 
{
  "form": 0.35,
  "winRate": 0.75,
  "communityScore": 0.81,
  "trust": 87,
  "contribution": 0.6
} */}

    <RadarChart data={radarData ?? undefined} />
      </View>
    <View style={[styles.summaryContainer,
      { backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
      }]}>
      <View style={{ flexDirection: "row"}}>
        <FontAwesome name="lightbulb-o" size={20} color={theme.colors.neonGreen} />
        <Text style={{ color: theme.colors.neonGreen, marginLeft: theme.spacing.s, fontWeight: "700" }}>
          {t("personalPage.analysis.summary")}
        </Text>
      </View>
      {radarData?.summary ? (
        <Text
          style={{
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            lineHeight: 20,
          }}
        >
          {radarData.summary}
        </Text>
        ) : null}
    </View>
      {isLoading ? (
        <Text style={{ color: theme.colors.textSecondary }}>
          {t("personalPage.analysis.loadingHint")}
        </Text>
      ) : null} 

      {/* AI Assessment Section */}
      {/* <View style={styles.assessmentSection}>
        <View
          style={[
            styles.assessmentHeader,
            {
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.m,
            },
          ]}
        >
        <Ionicons name="settings" size={20} color={theme.colors.neonGreen} />
          <Text
            style={[
              styles.assessmentTitle,
              {
                fontSize: theme.fontSizes.l,
                color: theme.colors.text,
                fontWeight: "700",
                marginLeft: theme.spacing.s,
              },
            ]}
          >
            {t("personalPage.analysis.aiAssessment")}
          </Text>
        </View>

        {assessments.map((assessment, index) => (
          <AIAssessmentCard
            key={index}
            title={assessment.title}
            description={assessment.description}
            icon={assessment.icon}
            type={assessment.type}
          />
        ))}

        {!isLoading && assessments.length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary }}>
            {t("personalPage.analysis.noAssessment")}
          </Text>
        ) : null}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "700",
  },
  seasonTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seasonText: {
    fontWeight: "600",
  },
  chartContainer: {
    marginBottom: 24,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statCard: {
    alignItems: "center",
  },
  statLabel: {
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: "700",
  },
  assessmentSection: {
    marginTop: 8,
  },
  assessmentHeader: {
    marginBottom: 16,
  },
  assessmentTitle: {
    fontWeight: "700",
  },
  summaryContainer: {
    
    marginBottom: 24,
  },
});
