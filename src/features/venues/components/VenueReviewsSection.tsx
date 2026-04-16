import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import type { VenueReview } from '../types/venue.types';

interface VenueReviewsSectionProps {
  reviews: VenueReview[];
}

const formatReviewDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const renderStars = (rating: number, activeColor: string, inactiveColor: string) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Ionicons
        key={value}
        name={value <= rating ? 'star' : 'star-outline'}
        size={14}
        color={value <= rating ? activeColor : inactiveColor}
      />
    ))}
  </View>
);

const VenueReviewsSection: React.FC<VenueReviewsSectionProps> = ({ reviews }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.softWhite }]}>
        {t('venueDetail.reviewsTitle')}
      </Text>

      {reviews.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {t('venueDetail.noReviews')}
        </Text>
      ) : (
        reviews.map((review) => (
          <View
            key={review.reviewId}
            style={[styles.reviewCard, { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }]}
          >
            <View style={styles.reviewHeader}>
              {review.userAvatarUrl ? (
                <Image source={{ uri: review.userAvatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: '#2a2a2a' }]}>
                  <Ionicons name="person" size={16} color={theme.colors.softWhite} />
                </View>
              )}
              <View style={styles.reviewMeta}>
                <Text style={[styles.userName, { color: theme.colors.softWhite }]}>
                  {review.userFullName || review.userName}
                </Text>
                {renderStars(review.rating, '#FFD54F', theme.colors.textSecondary)}
              </View>
              <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                {formatReviewDate(review.createdAt)}
              </Text>
            </View>

            <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>
              {review.comment}
            </Text>

            {review.ownerResponse && (
              <View style={[styles.ownerResponseBox, { backgroundColor: '#242424' }]}>
                <Text style={[styles.ownerResponseLabel, { color: theme.colors.neonGreen }]}>
                  {t('venueDetail.ownerResponse')}
                </Text>
                <Text style={[styles.ownerResponseText, { color: theme.colors.softWhite }]}>
                  {review.ownerResponse}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dateText: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownerResponseBox: {
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
  },
  ownerResponseLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  ownerResponseText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default VenueReviewsSection;
