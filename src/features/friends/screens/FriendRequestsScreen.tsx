import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { FriendRequest } from '../types/friends.types';
import { FriendRequestCard } from '../components';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';

type FriendRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FriendRequests'>;

interface FriendRequestsScreenProps {
  navigation: FriendRequestsScreenNavigationProp;
}

const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();

  // TODO: Replace mock data with API data or store data
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    {
      id: 'req1',
      name: 'Đỗ Văn G',
      username: 'dovang',
      elo: 2800,
      position: 'RW',
      mutualFriends: 7,
      sentAt: '2 giờ trước',
    },
    
    {
      id: 'req2',
      name: 'Bùi Thị H',
      username: 'buithih',
      elo: 2300,
      position: 'LB',
      mutualFriends: 3,
      sentAt: '5 giờ trước',
    },
    {
      id: 'req3',
      name: 'Lý Văn I',
      username: 'lyvani',
      elo: 3100,
      position: 'ST',
      mutualFriends: 12,
      sentAt: '1 ngày trước',
    },
    {
      id: 'req4',
      name: 'Ngô Văn K',
      username: 'ngovank',
      elo: 1950,
      position: 'GK',
      mutualFriends: 2,
      sentAt: '2 ngày trước',
    },
  ]);

  const handleAcceptRequest = (requestId: string) => {
    // TODO: Call API to accept friend request
    console.log('Accept request:', requestId);
    setFriendRequests(friendRequests.filter(req => req.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    // TODO: Call API to decline friend request
    console.log('Decline request:', requestId);
    setFriendRequests(friendRequests.filter(req => req.id !== requestId));
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: `${theme.colors.neonGreen}15` },
        ]}
      >
        <Ionicons
          name="person-add-outline"
          size={48}
          color={theme.colors.neonGreen}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {t('friends.noFriendRequests', { defaultValue: 'Không có lời mời kết bạn' })}
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {t('friends.noFriendRequestsDesc', { defaultValue: 'Bạn chưa có lời mời kết bạn nào' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.m,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText size="xl" weight="bold" variant="primary">
          {t('friends.friendRequests', { defaultValue: 'Lời mời kết bạn' })}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        style={{ paddingHorizontal: theme.spacing.m }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        data={friendRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRequestCard
            request={item}
            onAccept={() => handleAcceptRequest(item.id)}
            onDecline={() => handleDeclineRequest(item.id)}
            onPress={() => {
              // TODO: Navigate to user's profile
              console.log('Request pressed:', item.name);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

