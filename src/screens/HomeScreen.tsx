import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedScrollView, ThemedText, ThemedView } from '@/shared/components/themed';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Matches: undefined;
  Leaderboard: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: any;
    username: string;
  };
  community?: string;
  timestamp: string;
  title: string;
  content: string;
  image?: any;
  type?: 'post' | 'match' | 'announcement';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

interface ELOPlayer {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: any;
  elo: number;
  matchesPlayed: number;
  winRate: number;
  trend: 'up' | 'down' | 'stable';
  eloChange: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Mock ELO Leaderboard data - replace with real data from API
  const topPlayers: ELOPlayer[] = [
    {
      id: '1',
      rank: 1,
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: require('../../assets/icon.png'),
      elo: 2450,
      matchesPlayed: 128,
      winRate: 78.5,
      trend: 'up',
      eloChange: 45,
    },
    {
      id: '2',
      rank: 2,
      name: 'Trần Minh B',
      username: 'tranminhb',
      avatar: require('../../assets/icon.png'),
      elo: 2380,
      matchesPlayed: 115,
      winRate: 74.2,
      trend: 'up',
      eloChange: 28,
    },
    {
      id: '3',
      rank: 3,
      name: 'Lê Hoàng C',
      username: 'lehoangc',
      avatar: require('../../assets/icon.png'),
      elo: 2310,
      matchesPlayed: 102,
      winRate: 71.8,
      trend: 'down',
      eloChange: -15,
    },
    {
      id: '4',
      rank: 4,
      name: 'Phạm Đức D',
      username: 'phamducd',
      avatar: require('../../assets/icon.png'),
      elo: 2285,
      matchesPlayed: 95,
      winRate: 69.5,
      trend: 'stable',
      eloChange: 0,
    },
    {
      id: '5',
      rank: 5,
      name: 'Võ Thành E',
      username: 'vothanhe',
      avatar: require('../../assets/icon.png'),
      elo: 2240,
      matchesPlayed: 88,
      winRate: 67.3,
      trend: 'up',
      eloChange: 12,
    },
  ];

  // Mock data - replace with real data from API
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: require('../../assets/icon.png'),
      },
      community: 'Saigon Football Community',
      timestamp: '2 hours ago',
      title: 'Team Alpha wins the weekly tournament!',
      content: 'A stunning victory after a penalty shootout. The final goal was a masterpiece of teamwork and precision.',
      image: require('../../assets/icon.png'),
      type: 'post',
      likes: 152,
      comments: 23,
      shares: 12,
      isLiked: false,
    },
    {
      id: '2',
      author: {
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: require('../../assets/icon.png'),
      },
      timestamp: '8 hours ago',
      title: 'Upcoming Match: Warriors vs. Legends',
      content: 'The highly anticipated 5v5 match is scheduled for this Saturday. Who are you cheering for? Drop your predictions below!',
      type: 'match',
      likes: 210,
      comments: 45,
      shares: 18,
      isLiked: false,
    },
    {
      id: '3',
      author: {
        name: 'Admin',
        username: 'admin',
        avatar: require('../../assets/icon.png'),
      },
      timestamp: '1 day ago',
      title: 'New Feature Update: Instant Replays!',
      content: 'We\'re excited to announce that you can now view instant replays of key moments from your recorded matches. Update your app to the latest version to try it out!',
      image: require('../../assets/icon.png'),
      type: 'announcement',
      likes: 543,
      comments: 88,
      shares: 34,
      isLiked: false,
    },
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const getPostTypeLabel = (type?: string) => {
    switch (type) {
      case 'match':
        return 'MATCH ANNOUNCEMENT';
      case 'announcement':
        return 'ANNOUNCEMENT';
      default:
        return null;
    }
  };

  const getPostTypeBgColor = (type?: string) => {
    switch (type) {
      case 'match':
        return theme.colors.neonGreen;
      case 'announcement':
        return '#3b82f6';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return theme.colors.neonGreen;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'stable':
        return 'remove';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#22c55e';
      case 'down':
        return '#ef4444';
      case 'stable':
        return '#6b7280';
    }
  };

  return (
    <ThemedSafeAreaView>
      {/* Header */}
        <ThemedView 
        className="flex-row justify-between items-center px-5 py-4 mt-6"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="football" size={28} color={theme.colors.neonGreen} />
          <ThemedText variant="primary" size="xxl" weight="bold">
            Feeds
          </ThemedText>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="search" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        {/* ELO Leaderboard Section */}
        <ThemedView className="py-5 border-b border-[#2a2a2a]">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="trophy" size={24} color={theme.colors.neonGreen} />
              <ThemedText variant="primary" size="xl" weight="bold">
                ELO Leaderboard
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <ThemedText variant="primary" size="s" weight="semiBold">
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {topPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                className="bg-[#1a1a1a] rounded-2xl p-4 mr-4 border border-[#2a2a2a]"
                style={{ width: 180 }}
                onPress={() => {
                  // Navigate to player profile
                }}
              >
                {/* Rank Badge */}
                <View 
                  className="absolute top-3 right-3 w-8 h-8 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: getRankColor(player.rank) + '20',
                    borderWidth: 2,
                    borderColor: getRankColor(player.rank),
                  }}
                >
                  <Text 
                    className="text-xs font-bold"
                    style={{ color: getRankColor(player.rank) }}
                  >
                    #{player.rank}
                  </Text>
                </View>

                {/* Avatar */}
                <Image
                  source={player.avatar}
                  className="w-16 h-16 rounded-full self-center mb-3 mt-2"
                  resizeMode="cover"
                />

                {/* Player Name */}
                <Text className="text-soft-white text-base font-bold text-center mb-1">
                  {player.name}
                </Text>
                <Text className="text-medium-gray text-xs text-center mb-3">
                  @{player.username}
                </Text>

                {/* ELO Score */}
                <View className="bg-[#0a0a0a] rounded-xl p-3 mb-2">
                  <Text className="text-medium-gray text-xs text-center mb-1">
                    ELO Rating
                  </Text>
                  <Text 
                    className="text-2xl font-bold text-center"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    {player.elo}
                  </Text>
                  
                  {/* Trend Indicator */}
                  <View className="flex-row items-center justify-center mt-1">
                    <Ionicons 
                      name={getTrendIcon(player.trend)} 
                      size={14} 
                      color={getTrendColor(player.trend)} 
                    />
                    <Text 
                      className="text-xs font-semibold ml-1"
                      style={{ color: getTrendColor(player.trend) }}
                    >
                      {player.eloChange > 0 ? '+' : ''}{player.eloChange}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-medium-gray text-xs text-center">
                      Matches
                    </Text>
                    <Text className="text-soft-white text-sm font-semibold text-center">
                      {player.matchesPlayed}
                    </Text>
                  </View>
                  <View className="w-px bg-[#2a2a2a]" />
                  <View className="flex-1">
                    <Text className="text-medium-gray text-xs text-center">
                      Win Rate
                    </Text>
                    <Text className="text-soft-white text-sm font-semibold text-center">
                      {player.winRate}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Posts Feed */}
        <ThemedView className="pb-24">
          {posts.map((post) => (
            <ThemedView key={post.id} className="bg-dark-black border-b border-[#2a2a2a] py-4">
              {/* Post Header */}
              <View className="flex-row items-center justify-between px-5 mb-3">
                <View className="flex-row items-center flex-1">
                  <Image
                    source={post.author.avatar}
                    className="w-12 h-12 rounded-full"
                    resizeMode="cover"
                  />
                  <View className="ml-3 flex-1">
                    <ThemedText variant="primary" size="m" weight="bold">
                      {post.author.name}
                      {post.community && (
                        <Text className="text-medium-gray font-normal">
                          {' '}posted in '{post.community}'
                        </Text>
                      )}
                    </ThemedText>
                    <Text className="text-medium-gray text-sm">
                      {post.timestamp}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity className="w-8 h-8 items-center justify-center">
                  <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Post Type Badge */}
              {getPostTypeLabel(post.type) && getPostTypeBgColor(post.type) && (
                <View className="px-5 mb-2">
                  <View 
                    className="self-start px-3 py-1 rounded-full"
                    style={{ backgroundColor: getPostTypeBgColor(post.type)! }}
                  >
                    <Text className="text-xs font-bold text-dark-black">
                      {getPostTypeLabel(post.type)}
                    </Text>
                  </View>
                </View> 
              )}

              {/* Post Content */}
              <View className="px-5 mb-3">
                <Text className="text-soft-white text-lg font-bold mb-2">
                  {post.title}
                </Text>
                <Text className="text-medium-gray text-base leading-6">
                  {post.content}
                </Text>
              </View>

              {/* Post Image */}
              {post.image && (
                <Image
                  source={post.image}
                  className="w-full h-64 mb-3"
                  resizeMode="cover"
                />
              )}

              {/* Post Actions */}
              <View className="flex-row items-center justify-between px-5">
                <TouchableOpacity 
                  className="flex-row items-center gap-2"
                  onPress={() => handleLike(post.id)}
                >
                  <Ionicons 
                    name={post.isLiked ? "heart" : "heart-outline"} 
                    size={22} 
                    color={post.isLiked ? "#ef4444" : theme.colors.textSecondary} 
                  />
                  <Text className={post.isLiked ? "text-[#ef4444] font-semibold" : "text-medium-gray"}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center gap-2">
                  <Ionicons name="chatbubble-outline" size={22} color={theme.colors.textSecondary} />
                  <Text className="text-medium-gray">
                    {post.comments}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center gap-2">
                  <Ionicons name="share-social-outline" size={22} color={theme.colors.textSecondary} />
                  <Text className="text-medium-gray">
                    {post.shares}
                  </Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedScrollView>


    </ThemedSafeAreaView>
  );
};

export default HomeScreen;
