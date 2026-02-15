import React from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ThemedText, ThemedCard, ThemedIcon } from '@/shared/components/themed';
import { useTheme } from '@/shared/theme';
import type { MatchRoomFullInfo } from '@/features/rooms';
import type { VenuePhoto } from '@/features/venues';

interface VenueTabContentProps {
  displayRoom: MatchRoomFullInfo;
  venuePhotosToShow: VenuePhoto[];
  selectedImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

const formatMatchFormat = (format: string) => {
  if (format === 'FiveVsFive') return '5v5';
  if (format === 'SevenVsSeven') return '7v7';
  return format;
};

export const VenueTabContent: React.FC<VenueTabContentProps> = ({
  displayRoom,
  venuePhotosToShow,
  selectedImageIndex,
  onImageIndexChange,
}) => {
  const { theme } = useTheme();

  if (!displayRoom.field) return null;

  const pageWidth = Dimensions.get('window').width - 40;

  return (
    <View>
      <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
        Venue & Field Details
      </ThemedText>

      {venuePhotosToShow.length > 0 && (
        <View style={styles.venueImagesContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (pageWidth || 1),
              );
              onImageIndexChange(Math.min(index, venuePhotosToShow.length - 1));
            }}
            style={styles.venuePhotosScroll}
          >
            {venuePhotosToShow.map((photo, index) => (
              <View
                key={photo.photoId ?? index}
                style={[styles.venueImageWrapper, { width: pageWidth }]}
              >
                <Image
                  source={{ uri: photo.photoUrl }}
                  style={styles.venueImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          {venuePhotosToShow.length > 1 && (
            <View style={styles.venueDotsRow}>
              {venuePhotosToShow.map((_, index) => (
                <View key={index} style={styles.venueDot}>
                  <View
                    style={[
                      styles.venueDot,
                      {
                        backgroundColor:
                          index === selectedImageIndex
                            ? theme.colors.neonGreen
                            : theme.colors.border,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.venueInfoContainer}>
        <ThemedCard style={styles.venueLocationCard}>
          <View style={styles.venueInfoHeader}>
            <ThemedIcon name="football" size={20} variant="accent" />
            <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
              Field
            </ThemedText>
          </View>
          <ThemedText size="l" weight="semiBold">
            {displayRoom.field.fieldName}
          </ThemedText>
          <ThemedText variant="secondary" size="s">
            Type:{' '}
            {formatMatchFormat(displayRoom.field.fieldType)}
          </ThemedText>
        </ThemedCard>

        <View style={styles.venueInfoRow}>
          <ThemedCard style={styles.venueInfoCard}>
            <View style={styles.venueInfoHeader}>
              <ThemedIcon name="cash" size={20} variant="accent" />
              <ThemedText
                size="xs"
                variant="secondary"
                style={styles.venueInfoLabel}
              >
                Field Rate/Hour
              </ThemedText>
            </View>
            <ThemedText size="xl" weight="bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(displayRoom.field.hourlyRate)}
            </ThemedText>
          </ThemedCard>

          <ThemedCard style={styles.venueInfoCard}>
            <View style={styles.venueInfoHeader}>
              <ThemedIcon name="time" size={20} variant="accent" />
              <ThemedText
                size="xs"
                variant="secondary"
                style={styles.venueInfoLabel}
              >
                Duration
              </ThemedText>
            </View>
            <ThemedText size="xl" weight="bold">
              {displayRoom.durationMinutes} min
            </ThemedText>
          </ThemedCard>
        </View>

        <ThemedCard style={styles.venueLocationCard}>
          <View style={styles.venueInfoHeader}>
            <ThemedIcon name="business" size={20} variant="accent" />
            <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
              Venue
            </ThemedText>
          </View>
          <ThemedText size="l" weight="semiBold">
            {displayRoom.field.venue.venueName}
          </ThemedText>
        </ThemedCard>

        <ThemedCard style={styles.venueLocationCard}>
          <View style={styles.venueInfoHeader}>
            <ThemedIcon name="location" size={20} variant="accent" />
            <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
              Address
            </ThemedText>
          </View>
          <ThemedText variant="secondary" size="m">
            {displayRoom.field.venue.address}
          </ThemedText>
        </ThemedCard>

        {displayRoom.field.venue.contactPhone && (
          <ThemedCard style={styles.venueLocationCard}>
            <View style={styles.venueInfoHeader}>
              <ThemedIcon name="call" size={20} variant="accent" />
              <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                Contact
              </ThemedText>
            </View>
            <ThemedText size="m">
              {displayRoom.field.venue.contactPhone}
            </ThemedText>
          </ThemedCard>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 16,
  },
  venueImagesContainer: {
    marginBottom: 24,
  },
  venuePhotosScroll: {
    marginHorizontal: -20,
  },
  venueImageWrapper: {
    paddingHorizontal: 20,
  },
  venueImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  venueDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  venueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  venueInfoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  venueInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  venueInfoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  venueInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueInfoLabel: {
    marginLeft: 8,
  },
  venueLocationCard: {
    padding: 16,
    borderRadius: 16,
  },
});
