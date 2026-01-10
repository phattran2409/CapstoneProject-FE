import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RootStackParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ProfileHeader, AnalysisTab, EditProfileForm } from '../components';
import { ThemedText } from '@/shared/components/themed';
import { UpdateProfileData } from '../types/profile.types';
import { MatchList, MatchItemData, MatchDetailModal, PostItem, Post } from '@/shared/components';

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
  const [selectedMatch, setSelectedMatch] = useState<MatchItemData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
        name: user?.fullName || 'Mai Anh Tuấn',
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

  // Recent matches data - tái sử dụng từ MatchesScreen
  const recentMatches: MatchItemData[] = [
    {
      id: '1',
      title: 'Giao hữu cuối tuần',
      date: '18/07/2024',
      status: 'win',
      image: require('@assets/images/icon.png'),
      format: '5vs5',
      players: '10/10',
    },
    {
      id: '4',
      title: 'Team Anh Em',
      date: '15/07/2024',
      status: 'lose',
      image: require('@assets/images/icon.png'),
      format: '7vs7',
      players: '14/14',
    },
    {
      id: '5',
      title: 'Đá cho vui',
      date: '12/07/2024',
      status: 'draw',
      image: require('@assets/images/icon.png'),
      format: '6vs6',
      players: '12/12',
    },
    {
      id: '6',
      title: 'Trận đấu cuối tuần',
      date: '10/07/2024',
      status: 'win',
      image: require('@assets/images/icon.png'),
      format: '5vs5',
      players: '10/10',
    },
    {
      id: '7',
      title: 'Giao hữu thân thiện',
      date: '08/07/2024',
      status: 'draw',
      image: require('@assets/images/icon.png'),
      format: '7vs7',
      players: '14/14',
    },
    {
      id: '8',
      title: 'Championship',
      date: '05/07/2024',
      status: 'win',
      image: require('@assets/images/icon.png'),
      format: '11vs11',
      players: '22/22',
    },
  ];

  const handleMatchPress = (matchId: string) => {
    const match = recentMatches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setModalVisible(true);
    }
  };

  const handleViewDetail = (matchId: string) => {
    setModalVisible(false);
    setSelectedMatch(null);
    navigation.navigate('RoomInformation', { roomId: matchId });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: theme.spacing.m,
              paddingVertical: theme.spacing.m,
            }
          ]}
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
      

        {/* Profile Section */}
        <View style={{ backgroundColor: theme.colors.background }}>
          <ProfileHeader
            name={user?.fullName || 'Mai Anh Tuấn'}
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
        <View style={{ paddingBottom: theme.spacing.xl }}>
          {/* Posts Content */}
          {activeTab === 'posts' && (
            <View>
              {posts.map((post) => (
                <PostItem key={post.id} post={post} onLike={handleLike} />
              ))}
            </View>
          )}

          {activeTab === 'history' && (
            <MatchList
              matches={recentMatches}
              title={t('personalPage.tabs.history')}
              variant="vertical"
              itemVariant="list"
              onMatchPress={handleMatchPress}
              showStatus={true}
              containerStyle={{ marginTop: theme.spacing.m }}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisTab stats={stats} radarData={radarData} />
          )}
        </View>
      </ScrollView>

      {/* Match Detail Modal */}
      <MatchDetailModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={() => {
          setModalVisible(false);
          setSelectedMatch(null);
        }}
        onViewDetail={handleViewDetail}
      />

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default PersonalPageScreen;


