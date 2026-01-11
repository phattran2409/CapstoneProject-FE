import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedScrollView, ThemedText, ThemedView } from '@/shared/components/themed';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';
import { PostItem, Post, IconButton } from '@/shared/components';

import { TabParamList } from '@/app/navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<any>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
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
  const scrollHandler = useScrollToHideTabBar();
  
  // Mock user data - replace with real user from auth store when available
  const mockUser = {
    fullName: 'Nguyễn Văn A',
    avatar: undefined, // Can be set to require('../../assets/icon.png') if needed
  };

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
  const mockImages = [
    require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
    require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
    require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
  ];

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Nguyễn Văn A',
        username: 'nguyenvana',
        avatar: require('../../assets/icon.png'),
      },
      community: 'Football Community',
      timestamp: '2 giờ trước',
      title: 'Trận đấu hôm qua thật tuyệt vời!',
      content: 'Chúng ta đã có một trận đấu rất hay với nhiều pha bóng đẹp. Cảm ơn tất cả các bạn đã tham gia và cổ vũ nhiệt tình. Hẹn gặp lại ở trận tiếp theo!',
      images: mockImages,
      type: 'match',
      likes: 125,
      comments: 23,
      shares: 8,
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
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <ThemedText variant="primary" size="xxl" weight="bold">
            {t("newsFeed.title")}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <IconButton
            icon="trophy-outline"
            onPress={() => navigation.navigate("Leaderboard" as any)}
            size="medium"
          />
          <IconButton
            icon="notifications-outline"
            onPress={() => navigation.navigate("Notifications" as any)}
            size="medium"
            notificationCount={5}
          />
         
        </View>
      </ThemedView>

      <ThemedScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >

        {/*What's on your mind Section */}
        <ThemedView
          style={[
            styles.whatsOnMindContainer,
            {
              paddingHorizontal: theme.spacing.l,
              paddingVertical: theme.spacing.m,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.whatsOnMindContent}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('PersonalPage');
                }
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.avatarContainer,
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.neonGreen,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                {mockUser.avatar ? (
                  typeof mockUser.avatar === 'string' ? (
                    <Image
                      source={{ uri: mockUser.avatar }}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={mockUser.avatar}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                      resizeMode="cover"
                    />
                  )
                ) : (
                  <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>

            {/* Input Field */}
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.l,
                  paddingHorizontal: theme.spacing.m,
                  paddingVertical: theme.spacing.s,
                  flex: 1,
                  marginLeft: theme.spacing.m,
                },
              ]}
              activeOpacity={0.7}
            >
              <ThemedText variant="secondary" size="m">
                {t('newsFeed.whatsOnMind', { defaultValue: "Bạn đang nghĩ gì?" })}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* ELO Leaderboard Section */}
        <ThemedView style={[styles.leaderboardSection, { paddingVertical: theme.spacing.l, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' }]}>
          <View style={[styles.leaderboardHeader, { paddingHorizontal: theme.spacing.l, marginBottom: theme.spacing.m }]}>
            <View style={styles.leaderboardTitle}>
              <Ionicons
                name="trophy"
                size={24}
                color={theme.colors.neonGreen}
              />
              <ThemedText
                style={{ color: theme.colors.neonGreen, marginLeft: 8 }}
                variant="primary"
                size="xl"
                weight="bold"
              >
                {t("newsFeed.leaderboard")}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Leaderboard")}
            >
              <ThemedText variant="primary" size="s" weight="semiBold">
                {t("newsFeed.view")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {topPlayers.map((player) => {
              const rankColor = getRankColor(player.rank);
              return (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerCard,
                    {
                      backgroundColor: '#1a1a1a',
                      borderRadius: theme.radius.l,
                      padding: theme.spacing.m,
                      marginRight: theme.spacing.m,
                      borderWidth: 1,
                      borderColor: '#2a2a2a',
                      width: 180,
                    },
                  ]}
                  onPress={() => {
                    // Navigate to player profile
                  }}
                >
               
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor: rankColor + "20",
                        borderWidth: 2,
                        borderColor: rankColor,
                      },
                    ]}
                  >
                    <Text style={[styles.rankText, { color: rankColor }]}>
                      #{player.rank}
                    </Text>
                  </View>

              
                  <Image
                    source={player.avatar}
                    style={styles.playerAvatar}
                    resizeMode="cover"
                  />

             
                  <Text style={[styles.playerName, { color: theme.colors.softWhite }]}>
                    {player.name}
                  </Text>
                  <Text style={[styles.playerUsername, { color: theme.colors.textSecondary }]}>
                    @{player.username}
                  </Text>

                  <View style={[styles.eloContainer, { backgroundColor: '#0a0a0a', borderRadius: theme.radius.m, padding: 12, marginBottom: 8 }]}>
                    <Text style={[styles.eloLabel, { color: theme.colors.textSecondary }]}>
                      ELO Rating
                    </Text>
                    <Text
                      style={[styles.eloValue, { color: theme.colors.neonGreen }]}
                    >
                      {player.elo}
                    </Text>
                   
                    <View style={styles.trendContainer}>
                      <Ionicons
                        name={getTrendIcon(player.trend)}
                        size={14}
                        color={getTrendColor(player.trend)}
                      />
                      <Text
                        style={[styles.trendText, { color: getTrendColor(player.trend) }]}
                      >
                        {player.eloChange > 0 ? "+" : ""}
                        {player.eloChange}
                      </Text>
                    </View>
                  </View>
     
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Matches
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.softWhite }]}>
                        {player.matchesPlayed}
                      </Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: '#2a2a2a' }]} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Win Rate
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.softWhite }]}>
                        {player.winRate}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ThemedView>



        {/* Posts Feed */}
        <ThemedView style={{ paddingBottom: theme.spacing.xxl * 2 }}>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onLike={handleLike}
              onPress={(postId) => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('PostDetail', { postId });
                }
              }}
            />
          ))}
        </ThemedView>
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whatsOnMindContainer: {
    borderBottomWidth: 1,
  },
  whatsOnMindContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardSection: {
    // Styles applied via inline
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerCard: {
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  playerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerUsername: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  eloContainer: {
    // Styles applied via inline
  },
  eloLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  eloValue: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
  },
});

export default HomeScreen;
