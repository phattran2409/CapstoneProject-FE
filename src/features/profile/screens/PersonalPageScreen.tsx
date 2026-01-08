import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RootStackParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ProfileHeader, AnalysisTab, PostCard, Post, FriendsList, Friend, EditProfileForm } from '../components';
import { ThemedText } from '@/shared/components/themed';
import { UpdateProfileData } from '../types/profile.types';

type PersonalPageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalPage'>;

interface PersonalPageScreenProps {
  navigation: PersonalPageScreenNavigationProp;
}

type TabType = 'posts' | 'history' | 'friends' | 'analysis';

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

  // Mock friends data
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      elo: 2650,
      position: 'ST',
      isOnline: true,
      mutualFriends: 5,
    },
    {
      id: '2',
      name: 'Trần Minh B',
      username: 'tranminhb',
      elo: 2400,
      position: 'CM',
      isOnline: true,
      mutualFriends: 12,
    },
    {
      id: '3',
      name: 'Lê Hoàng C',
      username: 'lehoangc',
      elo: 2200,
      position: 'CB',
      isOnline: false,
      lastActive: '2 giờ trước',
      mutualFriends: 3,
    },
    {
      id: '4',
      name: 'Phạm Đức D',
      username: 'phamducd',
      elo: 3100,
      position: 'GK',
      isOnline: true,
      mutualFriends: 8,
    },
    {
      id: '5',
      name: 'Hoàng Quốc E',
      username: 'hoangquoce',
      elo: 1950,
      position: 'LW',
      isOnline: false,
      lastActive: '1 ngày trước',
    },
    {
      id: '6',
      name: 'Vũ Thành F',
      username: 'vuthanhf',
      elo: 2750,
      position: 'CAM',
      isOnline: true,
      mutualFriends: 15,
    },
  ]);

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

  const handleFriendPress = (friend: Friend) => {
    // TODO: Navigate to friend's profile
    console.log('Friend pressed:', friend.name);
  };

  const handleMessagePress = (friend: Friend) => {
    // TODO: Navigate to chat with friend
    console.log('Message:', friend.name);
  };

  const handleInvitePress = (friend: Friend) => {
    // TODO: Invite friend to match
    console.log('Invite to match:', friend.name);
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
        name: user?.name || 'Mai Anh Tuấn',
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

      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
        {/* Profile Section */}
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
          {(['posts', 'analysis','friends', 'history', ] as TabType[]).map((tab) => (
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

        {activeTab === 'friends' && (
          <FriendsList
            friends={friends}
            onFriendPress={handleFriendPress}
            onMessagePress={handleMessagePress}
            onInvitePress={handleInvitePress}
          />
        )}
      </ScrollView>

      {/* Edit Profile Form Modal */}
      <EditProfileForm
        visible={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveProfile}
        isLoading={isUpdating}
        initialData={{
          name: user?.name || 'Mai Anh Tuấn',
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


