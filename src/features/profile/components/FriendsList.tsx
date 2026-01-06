import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  elo: number;
  position?: string;
  isOnline: boolean;
  mutualFriends?: number;
  lastActive?: string;
}

interface FriendsListProps {
  friends: Friend[];
  onFriendPress?: (friend: Friend) => void;
  onMessagePress?: (friend: Friend) => void;
  onInvitePress?: (friend: Friend) => void;
}

const FriendCard: React.FC<{
  friend: Friend;
  onPress?: () => void;
  onMessagePress?: () => void;
  onInvitePress?: () => void;
}> = ({ friend, onPress, onMessagePress, onInvitePress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const getRankColor = (elo: number) => {
    if (elo >= 3000) return '#FFD700'; // Gold
    if (elo >= 2500) return '#C0C0C0'; // Silver
    if (elo >= 2000) return '#CD7F32'; // Bronze
    return theme.colors.neonGreen;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={40} tint="dark" style={[styles.friendCard, { borderRadius: theme.radius.l }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Avatar with online indicator */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: getRankColor(friend.elo),
                },
              ]}
            >
              {friend.avatar ? (
                <Image source={{ uri: friend.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={28} color={theme.colors.textSecondary} />
              )}
            </View>
            {friend.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.neonGreen }]} />}
          </View>

          {/* Friend info */}
          <View style={styles.friendInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.friendName, { color: theme.colors.text }]} numberOfLines={1}>
                {friend.name}
              </Text>
              {friend.elo >= 2500 && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.neonGreen} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={[styles.username, { color: theme.colors.textSecondary }]}>@{friend.username}</Text>

            <View style={styles.statsRow}>
              <View style={[styles.eloBadge, { backgroundColor: `${getRankColor(friend.elo)}20` }]}>
                <Ionicons name="trophy" size={12} color={getRankColor(friend.elo)} />
                <Text style={[styles.eloText, { color: getRankColor(friend.elo) }]}>{friend.elo}</Text>
              </View>
              {friend.position && (
                <View style={[styles.positionBadge, { backgroundColor: `${theme.colors.neonGreen}15` }]}>
                  <Text style={[styles.positionText, { color: theme.colors.neonGreen }]}>{friend.position}</Text>
                </View>
              )}
            </View>

            {friend.mutualFriends && friend.mutualFriends > 0 && (
              <Text style={[styles.mutualFriends, { color: theme.colors.textSecondary }]}>
                <Ionicons name="people" size={12} color={theme.colors.textSecondary} />{' '}
                {t('friends.mutualFriends', { count: friend.mutualFriends, defaultValue: `${friend.mutualFriends} bạn chung` })}
              </Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={onMessagePress}
              style={[styles.actionBtn, { backgroundColor: `${theme.colors.neonGreen}20` }]}
            >
              <Ionicons name="chatbubble" size={18} color={theme.colors.neonGreen} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onInvitePress}
              style={[styles.actionBtn, { backgroundColor: `${theme.colors.info}20` }]}
            >
              <Ionicons name="football" size={18} color={theme.colors.info} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Border glow */}
        <View
          style={[
            styles.cardBorder,
            { borderColor: friend.isOnline ? `${theme.colors.neonGreen}30` : 'rgba(255,255,255,0.05)' },
          ]}
        />
      </BlurView>
    </TouchableOpacity>
  );
};

export const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  onFriendPress,
  onMessagePress,
  onInvitePress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'online'>('all');

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || friend.isOnline;
    return matchesSearch && matchesFilter;
  });

  const onlineFriendsCount = friends.filter((f) => f.isOnline).length;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.colors.neonGreen}15` }]}>
        <Ionicons name="people-outline" size={48} color={theme.colors.neonGreen} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery
          ? t('friends.noResults', { defaultValue: 'Không tìm thấy bạn bè' })
          : t('friends.empty', { defaultValue: 'Chưa có bạn bè' })}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {searchQuery
          ? t('friends.tryDifferentSearch', { defaultValue: 'Thử tìm kiếm với từ khóa khác' })
          : t('friends.inviteFriends', { defaultValue: 'Mời bạn bè tham gia cùng bạn!' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('friends.searchPlaceholder', { defaultValue: 'Tìm kiếm bạn bè...' })}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={[
            styles.filterTab,
            {
              backgroundColor: filter === 'all' ? theme.colors.neonGreen : 'transparent',
              borderColor: filter === 'all' ? theme.colors.neonGreen : theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: filter === 'all' ? theme.colors.black : theme.colors.text }]}>
            {t('friends.all', { defaultValue: 'Tất cả' })} ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('online')}
          style={[
            styles.filterTab,
            {
              backgroundColor: filter === 'online' ? theme.colors.neonGreen : 'transparent',
              borderColor: filter === 'online' ? theme.colors.neonGreen : theme.colors.border,
            },
          ]}
        >
          <View style={styles.onlineDot} />
          <Text style={[styles.filterText, { color: filter === 'online' ? theme.colors.black : theme.colors.text }]}>
            {t('friends.online', { defaultValue: 'Đang online' })} ({onlineFriendsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onPress={() => onFriendPress?.(item)}
            onMessagePress={() => onMessagePress?.(item)}
            onInvitePress={() => onInvitePress?.(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  listContent: {
    paddingBottom: 24,
  },
  friendCard: {
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    pointerEvents: 'none',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    maxWidth: '80%',
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  eloText: {
    fontSize: 12,
    fontWeight: '700',
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positionText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mutualFriends: {
    fontSize: 12,
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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

