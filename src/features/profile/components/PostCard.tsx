import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  image?: any;
  type?: 'post' | 'match' | 'announcement';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          paddingVertical: theme.spacing.m,
        },
      ]}
    >
      {/* Post Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.s,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Image
            source={post.author.avatar}
            style={[
              styles.avatar,
              {
                width: 48,
                height: 48,
                borderRadius: 24,
              },
            ]}
            resizeMode="cover"
          />
          <View style={{ marginLeft: theme.spacing.s, flex: 1 }}>
            <Text
              style={[
                styles.authorName,
                {
                  fontSize: theme.fontSizes.m,
                  color: theme.colors.text,
                  fontWeight: '700',
                },
              ]}
            >
              {post.author.name}
              {post.community && (
                <Text
                  style={{
                    fontSize: theme.fontSizes.m,
                    color: theme.colors.textSecondary,
                    fontWeight: '400',
                  }}
                >
                  {' '}
                  posted in '{post.community}'
                </Text>
              )}
            </Text>
            <Text
              style={[
                styles.timestamp,
                {
                  fontSize: theme.fontSizes.s,
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              {post.timestamp}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Post Type Badge */}
      {getPostTypeLabel(post.type) && getPostTypeBgColor(post.type) && (
        <View
          style={[
            styles.badgeContainer,
            {
              paddingHorizontal: theme.spacing.m,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          <View
            style={[
              styles.badge,
              {
                backgroundColor: getPostTypeBgColor(post.type)!,
                borderRadius: theme.radius.round,
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.m,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  fontSize: theme.fontSizes.xs,
                  color: theme.colors.white,
                  fontWeight: '700',
                },
              ]}
            >
              {getPostTypeLabel(post.type)}
            </Text>
          </View>
        </View>
      )}

      {/* Post Content */}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.s,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: theme.fontSizes.l,
              color: theme.colors.text,
              fontWeight: '700',
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {post.title}
        </Text>
        <Text
          style={[
            styles.description,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.textSecondary,
              lineHeight: 24,
            },
          ]}
        >
          {post.content}
        </Text>
      </View>

      {/* Post Image */}
      {post.image && (
        <Image
          source={post.image}
          style={[
            styles.image,
            {
              width: '100%',
              height: 256,
              marginBottom: theme.spacing.s,
            },
          ]}
          resizeMode="cover"
        />
      )}

      {/* Post Actions */}
      <View
        style={[
          styles.actions,
          {
            paddingHorizontal: theme.spacing.m,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onLike?.(post.id)}
          style={styles.actionButton}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.isLiked ? '#ef4444' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              {
                fontSize: theme.fontSizes.m,
                color: post.isLiked ? '#ef4444' : theme.colors.textSecondary,
                fontWeight: post.isLiked ? '600' : '400',
                marginLeft: theme.spacing.xs,
              },
            ]}
          >
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              {
                fontSize: theme.fontSizes.m,
                color: theme.colors.textSecondary,
                marginLeft: theme.spacing.xs,
              },
            ]}
          >
            {post.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              {
                fontSize: theme.fontSizes.m,
                color: theme.colors.textSecondary,
                marginLeft: theme.spacing.xs,
              },
            ]}
          >
            {post.shares}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    borderRadius: 24,
  },
  authorName: {
    fontWeight: '700',
  },
  timestamp: {
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-start',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '700',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  image: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 8,
  },
});

