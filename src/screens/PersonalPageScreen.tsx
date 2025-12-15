import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';

type PersonalPageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalPage'>;

interface PersonalPageScreenProps {
  navigation: PersonalPageScreenNavigationProp;
}

type TabType = 'posts' | 'history' | 'achievements';

const PersonalPageScreen: React.FC<PersonalPageScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const stats = {
    matches: 88,
    goals: 120,
    winRate: 75,
  };

  const posts = [
    {
      id: '1',
      title: 'Giao hữu cuối tuần',
      description: 'Một trận đấu tuyệt vời với những người anh em. Tỷ số 5-3!',
      timestamp: '2 giờ trước',
      image: null,
    },
    {
      id: '2',
      title: 'Teamwork makes the dream work',
      description: 'Thắng lợi giòn giã! Cảm ơn cả đội đã chiến đấu hết mình.',
      timestamp: '1 ngày trước',
      image: null,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.m,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: theme.fontSizes.l,
            color: theme.colors.text,
            fontWeight: '700',
          }}
        >
          {t('personalPage.title')}
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
        {/* Profile Section */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.l }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#E8D5C4',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: theme.colors.neonGreen,
              marginBottom: theme.spacing.m,
            }}
          >
            <Ionicons name="person" size={60} color={theme.colors.textSecondary} />
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.xxl,
              color: theme.colors.text,
              fontWeight: '700',
              marginBottom: theme.spacing.xs,
            }}
          >
            {user?.name || 'Mai Anh Tuấn'}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.m,
            }}
          >
            "King of the Pitch"
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.neonGreen,
              paddingVertical: theme.spacing.s,
              paddingHorizontal: theme.spacing.xl,
              borderRadius: theme.radius.m,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.m,
                color: theme.colors.white,
                fontWeight: '600',
              }}
            >
              {t('personalPage.editProfile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.l,
            gap: theme.spacing.s,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t('personalPage.stats.matches')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSizes.xxl,
                color: theme.colors.text,
                fontWeight: '700',
              }}
            >
              {stats.matches}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t('personalPage.stats.goals')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSizes.xxl,
                color: theme.colors.text,
                fontWeight: '700',
              }}
            >
              {stats.goals}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t('personalPage.stats.winRate')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSizes.xxl,
                color: theme.colors.text,
                fontWeight: '700',
              }}
            >
              {stats.winRate}%
            </Text>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          {(['posts', 'history', 'achievements'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: theme.spacing.m,
                alignItems: 'center',
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: activeTab === tab ? theme.colors.neonGreen : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSizes.m,
                  color: activeTab === tab ? theme.colors.neonGreen : theme.colors.textSecondary,
                  fontWeight: activeTab === tab ? '700' : '400',
                }}
              >
                {t(`personalPage.tabs.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts Content */}
        {activeTab === 'posts' && (
          <View style={{ paddingHorizontal: theme.spacing.m }}>
            {posts.map((post) => (
              <View
                key={post.id}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.m,
                  marginBottom: theme.spacing.m,
                  overflow: 'hidden',
                }}
              >
                {post.image && (
                  <Image
                    source={post.image}
                    style={{
                      width: '100%',
                      height: 200,
                      backgroundColor: theme.colors.border,
                    }}
                    resizeMode="cover"
                  />
                )}
                <View style={{ padding: theme.spacing.m }}>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.l,
                      color: theme.colors.text,
                      fontWeight: '600',
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {post.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.m,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.s,
                    }}
                  >
                    {post.description}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.s,
                      color: theme.colors.textTertiary,
                    }}
                  >
                    {post.timestamp}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={{ paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.l }}>
            <Text
              style={{
                fontSize: theme.fontSizes.m,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {t('personalPage.comingSoon')}
            </Text>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={{ paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.l }}>
            <Text
              style={{
                fontSize: theme.fontSizes.m,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {t('personalPage.comingSoon')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PersonalPageScreen;


