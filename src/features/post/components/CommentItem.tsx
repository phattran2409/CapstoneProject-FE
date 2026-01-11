import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Image } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedView, ThemedText } from '@/shared/components/themed';
import { Comment, Reply } from '../types/post.types';
import { ReplyItem } from './ReplyItem';

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  onReplyLike: (commentId: string, replyId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onReplyLike,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyInput(false);
      Keyboard.dismiss();
    }
  };

  return (
    <ThemedView
      style={[
        styles.commentContainer,
        {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.m,
        },
      ]}
    >
      {/* Comment Header */}
      <View style={styles.commentHeader}>
        <View
          style={[
            styles.avatarContainer,
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.surface,
              marginRight: theme.spacing.m,
            },
          ]}
        >
          {comment.author.avatar ? (
            typeof comment.author.avatar === 'string' ? (
              <Image
                source={{ uri: comment.author.avatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={comment.author.avatar}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                resizeMode="cover"
              />
            )
          ) : (
            <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
          )}
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentAuthorRow}>
            <ThemedText variant="primary" size="m" weight="semiBold">
              {comment.author.name}
            </ThemedText>
            <ThemedText variant="secondary" size="s" style={styles.timestamp}>
              {comment.timestamp}
            </ThemedText>
          </View>
          <ThemedText variant="primary" size="m" style={styles.commentText}>
            {comment.content}
          </ThemedText>
          {/* Comment Actions */}
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onLike(comment.id)}
            >
              <Ionicons
                name={comment.isLiked ? 'heart' : 'heart-outline'}
                size={18}
                color={comment.isLiked ? '#ef4444' : theme.colors.textSecondary}
              />
              <ThemedText
                variant="secondary"
                size="s"
                style={[
                  styles.actionText,
                  { color: comment.isLiked ? '#ef4444' : theme.colors.textSecondary },
                ]}
              >
                {comment.likes > 0 ? comment.likes : ''}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowReplyInput(!showReplyInput)}
            >
              <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" size="s" style={styles.actionText}>
                {t('post.reply', { defaultValue: 'Phản hồi' })}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={[styles.repliesContainer, { marginLeft: theme.spacing.xl }]}>
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onLike={() => onReplyLike(comment.id, reply.id)}
            />
          ))}
        </View>
      )}

      {/* Reply Input */}
      {showReplyInput && (
        <View style={[styles.replyInputContainer, { marginLeft: theme.spacing.xl, marginTop: theme.spacing.s }]}>
          <TextInput
            style={[
              styles.replyInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.m,
                paddingHorizontal: theme.spacing.m,
                paddingVertical: theme.spacing.s,
              },
            ]}
            placeholder={t('post.writeReply', { defaultValue: 'Viết phản hồi...' })}
            placeholderTextColor={theme.colors.textSecondary}
            value={replyContent}
            onChangeText={setReplyContent}
            multiline
            maxLength={500}
          />
          <View style={styles.replyInputActions}>
            <TouchableOpacity
              onPress={() => {
                setShowReplyInput(false);
                setReplyContent('');
              }}
            >
              <ThemedText variant="secondary" size="s">
                {t('common.cancel', { defaultValue: 'Hủy' })}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmitReply}
              disabled={!replyContent.trim()}
            >
              <ThemedText
                variant="accent"
                size="s"
                weight="semiBold"
                style={{ opacity: replyContent.trim() ? 1 : 0.5 }}
              >
                {t('common.post', { defaultValue: 'Đăng' })}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    paddingHorizontal: 16,
  },
  commentHeader: {
    flexDirection: 'row',
  },
  avatarContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  timestamp: {
    marginLeft: 4,
  },
  commentText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
  },
  repliesContainer: {
    marginTop: 12,
  },
  replyInputContainer: {
    marginTop: 8,
  },
  replyInput: {
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
});

