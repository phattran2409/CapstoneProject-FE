import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RootStackParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ProfileHeader, AnalysisTab, PostCard, Post, EditProfileForm } from '../components';
import { ThemedText } from '@/shared/components/themed';
import { UpdateProfileData } from '../types/profile.types';

type PersonalPageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalPage'>;

interface PersonalPageScreenProps {
  navigation: PersonalPageScreenNavigationProp;
}

type TabType = 'posts' | 'history'  | 'analysis';

const PersonalPageScreen: React.FC<PersonalPageScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const stats = {
    matches: 88,
    winRate: 75,
  };

  const radarData = {
    WinLoss: 75,
    Perf: 85,
    Feedback: 70,
    Sentiment: 80,
    Trust: 75,
    RoleFactor: 65,
  };

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleSaveProfile = async (data: UpdateProfileData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to update profile
      console.log('Saving profile:', data);
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000)); // Simulate API call
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: user?.name || 'Mai Anh Tuấn',
        username: 'maianhtuan',
        avatar: require('@assets/images/icon.png'),
      },
      timestamp: '2 giờ trước',
      title: 'Giao hữu cuối tuần',
      content: 'Một trận đấu tuyệt vời với những người anh em. Tỷ số 5-3!',
      image: null,
      type: 'match',
      likes: 45,
      comments: 12,
      shares: 5,
      isLiked: false,
    },
    {
      id: '2',
      author: {
        name: user?.fullName || 'Mai Anh Tuấn',
        username: 'maianhtuan',
        avatar: require('@assets/images/icon.png'),
      },
      timestamp: '1 ngày trước',
      title: 'Teamwork makes the dream work',
      content: 'Thắng lợi giòn giã! Cảm ơn cả đội đã chiến đấu hết mình.',
      image: null,
      type: 'post',
      likes: 78,
      comments: 23,
      shares: 8,
      isLiked: true,
    },
  ]);

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

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
        <ThemedText size="xl" weight="bold" variant="primary">
          {t("personalPage.title")}
        </ThemedText>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail')}>  
            <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Section - Always visible */}
      <View style={{ backgroundColor: theme.colors.background }}>
        <ProfileHeader
          name={user?.name || 'Mai Anh Tuấn'}
          elo={2450}       
          description="King of the Pitch"
          age={22}
          position="CAM"
          shirtNumber={10}
          matchesCount={88}
          onEditPress={handleEditProfile}
        />

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
          {(['posts', 'analysis', 'history', ] as TabType[]).map((tab) => (
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
      </View>

      {/* Tab Content */}
     (
        <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
          {/* Posts Content */}
          {activeTab === 'posts' && (
            <View>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
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

          {activeTab === 'analysis' && (
            <AnalysisTab stats={stats} radarData={radarData} />
          )}
        </ScrollView>
      ) 
      {/* Edit Profile Form Modal */}
      <EditProfileForm
        visible={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveProfile}
        isLoading={isUpdating}
        initialData={{
          name: user?.fullName || 'Mai Anh Tuấn',
          bio: 'King of the Pitch',
          position: 'CAM',
          shirtNumber: 10,
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PersonalPageScreen;


