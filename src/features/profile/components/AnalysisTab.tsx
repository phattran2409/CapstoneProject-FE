import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RadarChart } from './RadarChart';
import { AIAssessmentCard } from './AIAssessmentCard';

interface AnalysisTabProps {
  stats: {
    matches: number;
    winRate: number;
  };
  radarData: {
    WinLoss: number;
    Perf: number;
    Feedback: number;
    Sentiment: number;
    Trust: number;
    RoleFactor: number;
  };
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ stats, radarData }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const assessments = [
    {
      title: 'Tiềm năng thủ lĩnh',
      description: `Dựa trên ${stats.matches} trận đấu, bạn duy trì sự ổn định đáng kinh ngạc. Tỷ lệ thắng ${stats.winRate}% là minh chứng rõ ràng cho khả năng dẫn dắt đội bóng của bạn.`,
      icon: 'star' as const,
      iconColor: theme.colors.neonGreen,
    },
    {
      title: 'Cần cải thiện RoleFactor',
      description:
        'Biểu đồ năng lực cho thấy RoleFactor của bạn hơi thấp so với Rank Diamond I. Hãy tích cực tham gia vào các pha phối hợp nhóm hơn để tối ưu hóa hiệu suất.',
      icon: 'bar-chart' as const,
      iconColor: theme.colors.textSecondary,
    },
  ];

  return (
    <View style={[styles.container, { paddingHorizontal: theme.spacing.m }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
              fontWeight: '700',
            },
          ]}
        >
          {t('personalPage.analysis.title', { defaultValue: 'Biểu đồ năng lực' })}
        </Text>
 
      </View>

      {/* Radar Chart */}
      <View
        style={[
          styles.chartContainer,
          {
            alignItems: 'center',
            marginBottom: theme.spacing.l,
          },
        ]}
      >
        <RadarChart data={radarData} />
      </View>

      {/* Stats Cards */}
      <View
        style={[
          styles.statsContainer,
          {
            flexDirection: 'row',
            gap: theme.spacing.s,
            marginBottom: theme.spacing.xl,
          },
        ]}
      >
        <View
          style={[
            styles.statCard,
            {
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              alignItems: 'center',
            },
          ]}
        >
          <Ionicons name="football" size={24} color={theme.colors.neonGreen} />
          <Text
            style={[
              styles.statLabel,
              {
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.xs,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            {t('personalPage.stats.matches', { defaultValue: 'SỐ TRẬN' })}
          </Text>
          <Text
            style={[
              styles.statValue,
              {
                fontSize: theme.fontSizes.xxl,
                color: theme.colors.text,
                fontWeight: '700',
              },
            ]}
          >
            {stats.matches}
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              alignItems: 'center',
            },
          ]}
        >
          <Ionicons name="trending-up" size={24} color={theme.colors.neonGreen} />
          <Text
            style={[
              styles.statLabel,
              {
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.xs,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            {t('personalPage.stats.winRate', { defaultValue: 'TỶ LỆ THẮNG' })}
          </Text>
          <Text
            style={[
              styles.statValue,
              {
                fontSize: theme.fontSizes.xxl,
                color: theme.colors.text,
                fontWeight: '700',
              },
            ]}
          >
            {stats.winRate}%
          </Text>
        </View>
      </View>

      {/* AI Assessment Section */}
      <View style={styles.assessmentSection}>
        <View
          style={[
            styles.assessmentHeader,
            {
              flexDirection: 'row',
              alignItems: 'center',
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
                fontWeight: '700',
                marginLeft: theme.spacing.s,
              },
            ]}
          >
            {t('personalPage.analysis.aiAssessment', {
              defaultValue: 'Đánh giá & Phân tích AI',
            })}
          </Text>
        </View>

        {assessments.map((assessment, index) => (
          <AIAssessmentCard
            key={index}
            title={assessment.title}
            description={assessment.description}
            icon={assessment.icon}
            iconColor={assessment.iconColor}
          />
        ))}
      </View>
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
    fontWeight: '700',
  },
  seasonTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seasonText: {
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 24,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statCard: {
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
  },
  assessmentSection: {
    marginTop: 8,
  },
  assessmentHeader: {
    marginBottom: 16,
  },
  assessmentTitle: {
    fontWeight: '700',
  },
});

