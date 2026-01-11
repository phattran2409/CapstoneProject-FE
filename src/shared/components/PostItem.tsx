import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedView, ThemedText } from './themed';
import { PostImages } from './PostImages';

export interface Post {
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
  image?: any; // Deprecated: use images instead
  images?: any[]; // Support multiple images
  type?: 'post' | 'match' | 'announcement';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

export interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onMenuPress?: (postId: string) => void;
  onPress?: (postId: string) => void; // Navigate to post detail
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onMenuPress,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  // Support both image (single) and images (multiple) for backward compatibility
  const images = post.images || (post.image ? [post.image] : []);

  const getPostTypeLabel = (type?: string) => {
    switch (type) {
      case 'match':
        return t('newsFeed.matches');
      case 'announcement':
        return t('newsFeed.announcements');
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

  const postTypeBgColor = getPostTypeBgColor(post.type);

  return (
    <ThemedView
      style={[
        styles.postContainer,
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.m,
        },
      ]}
    >
      {/* Post Header */}
      <View style={[styles.postHeader, { paddingHorizontal: theme.spacing.l, marginBottom: 12 }]}>
        <View style={styles.postAuthor}>
          <Image
            source={post.author.avatar}
            style={styles.postAvatar}
            resizeMode="cover"
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <ThemedText variant="primary" size="m" weight="bold">
              {post.author.name}
              {post.community && (
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '400' }}>
                  {' '}
                  posted in '{post.community}'
                </Text>
              )}
            </ThemedText>
            <Text style={[styles.postTimestamp, { color: theme.colors.textSecondary }]}>
              {post.timestamp}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.postMenuButton}
          onPress={() => onMenuPress?.(post.id)}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Post Type Badge */}
      {getPostTypeLabel(post.type) && postTypeBgColor && (
        <View style={{ paddingHorizontal: theme.spacing.l, marginBottom: 8 }}>
          <View
            style={[
              styles.postTypeBadge,
              {
                backgroundColor: postTypeBgColor,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              },
            ]}
          >
            <Text style={[styles.postTypeText, { color: isDark ? theme.colors.darkBlack : theme.colors.white }]}>
              {getPostTypeLabel(post.type)}
            </Text>
          </View>
        </View>
      )}

      {/* Post Content */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(post.id)}
        style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}
      >
        <ThemedText variant="primary" size="l" weight="bold" style={styles.postTitle}>
          {post.title}
        </ThemedText>
        <ThemedText variant="secondary" size="m" style={styles.postContent}>
          {post.content}
        </ThemedText>
      </TouchableOpacity>

      {/* Post Images */}
      {images.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPress?.(post.id)}
          style={{ marginBottom: 12 }}
        >
          <PostImages images={images} />
        </TouchableOpacity>
      )}

      {/* Post Actions */}
      <View style={[styles.postActions, { paddingHorizontal: theme.spacing.l }]}>
        <TouchableOpacity
          style={styles.postAction}
          onPress={() => onLike?.(post.id)}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.isLiked ? '#ef4444' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.postActionText,
              {
                color: post.isLiked ? '#ef4444' : theme.colors.textSecondary,
                fontWeight: post.isLiked ? '600' : '400',
              },
            ]}
          >
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => {
            onComment?.(post.id);
            onPress?.(post.id);
          }}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.postActionText, { color: theme.colors.textSecondary }]}>
            {post.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => onShare?.(post.id)}
        >
          <Ionicons
            name="share-social-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.postActionText, { color: theme.colors.textSecondary }]}>
            {post.shares}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    // Styles applied via inline
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  postTimestamp: {
    fontSize: 14,
  },
  postMenuButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTypeBadge: {
    alignSelf: 'flex-start',
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  postTitle: {
    marginBottom: 8,
  },
  postContent: {
    lineHeight: 24,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postActionText: {
    fontSize: 14,
  },
});

export default PostItem;

