import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RootStackParamList } from '@/app/navigation/types';
import { useVenueDetail, VenueDetail, VenueFieldDetail, OperatingHour, Field, TimeSlot } from '@/features/venues';
import { FieldsModal, VenueOwnerModal, VenueReviewsSection } from '../components';
import { ErrorState } from '@/shared/components';
import { formatCurrency } from '@/shared/utils/formatters';
import { formatTimeToHHMM, getDayName } from '@/shared/utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type VenueDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VenueDetail'>;
type VenueDetailScreenRouteProp = RouteProp<RootStackParamList, 'VenueDetail'>;

interface VenueDetailScreenProps {
  navigation?: VenueDetailScreenNavigationProp;
  route: VenueDetailScreenRouteProp;
}

// Helper function to format field type
const formatFieldType = (fieldType: string): string => {
  switch (fieldType) {
    case 'FiveVsFive':
      return '5 vs 5';
    case 'SevenVsSeven':
      return '7 vs 7';
    case 'ElevenVsEleven':
      return '11 vs 11';
    default:
      return fieldType;
  }
};



// Convert VenueFieldDetail to Field for FieldsModal compatibility
const convertToField = (venueField: VenueFieldDetail): Field => ({
  fieldId: venueField.fieldId,
  fieldName: venueField.fieldName,
  fieldType: venueField.fieldType,
  hourlyRate: venueField.hourlyRate,
});

const VenueDetailScreen: React.FC<VenueDetailScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { venueId } = route.params;

  // State
  const [activeTab, setActiveTab] = useState<'info' | 'fields' | 'hours'>('info');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fieldsModalVisible, setFieldsModalVisible] = useState(false);
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);

  // Fetch venue detail
  const { data: venue, isLoading, error, refetch } = useVenueDetail(venueId);

  // Convert venue to Venue type for FieldsModal compatibility
  const venueForModal = useMemo(() => {
    if (!venue) return null;
    return {
      venueId: venue.venueId,
      name: venue.venueName,
      address: venue.address,
      latitude: venue.latitude,
      longitude: venue.longitude,
      description: venue.description || '',
      amenities: venue.amenities || '',
      contactPhone: venue.contactPhone || '',
      contactEmail: venue.contactEmail || '',
      amentities: null,
      fields: venue.fields.map(convertToField),
      primaryPhotoUrl: venue.photos?.[0]?.photoUrl,
      createdAt: venue.createdAt,
    };
  }, [venue]);

  // Get today's operating hours
  const todayHours = useMemo(() => {
    if (!venue?.operatingHours) return null;
    const today = new Date().getDay(); // 0 = Sunday
    return venue.operatingHours.find(h => h.dayOfWeek === today);
  }, [venue?.operatingHours]);

  // Handle open maps
  const handleOpenMaps = useCallback(() => {
    if (!venue) return;
    const { latitude, longitude, address } = venue;
    const label = encodeURIComponent(venue.venueName);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });
    if (url) {
      Linking.openURL(url);
    }
  }, [venue]);

  // Handle call phone
  const handleCallPhone = useCallback(() => {
    if (venue?.contactPhone) {
      Linking.openURL(`tel:${venue.contactPhone}`);
    }
  }, [venue?.contactPhone]);

  // Handle select field - selectedDate (YYYY-MM-DD) from FieldsModal for matchDate
  const handleSelectField = (venueData: any, field: Field, selectedSlot: TimeSlot, selectedDate: string) => {
    setFieldsModalVisible(false);
    navigation?.navigate('CreateRoom', {
      selectedVenue: venueData,
      selectedField: field,
      selectedTimeSlot: selectedSlot,
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.neonGreen} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('venueDetail.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !venue) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
        <ErrorState
          error={t('venueDetail.loadError')}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#2a2a2a' }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.softWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.softWhite }]} numberOfLines={1}>
         {t("venueDetail.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          {venue.photos && venue.photos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
            >
              {venue.photos.map((photo, index) => (
                <Image
                  key={photo.photoId || index}
                  source={{ uri: photo.photoUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={require('@assets/images/icon.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}

          {/* Image Indicators */}
          {venue.photos && venue.photos.length > 1 && (
            <View style={styles.imageIndicators}>
              {venue.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    {
                      backgroundColor: index === currentImageIndex
                        ? theme.colors.neonGreen
                        : 'rgba(255,255,255,0.5)',
                      width: index === currentImageIndex ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Venue Info Card */}
        <View style={[styles.infoCard, { backgroundColor: '#1a1a1a', marginHorizontal: 16, marginTop: -40 }]}>
          <Text style={[styles.venueName, { color: theme.colors.softWhite }]}>
            {venue.venueName}
          </Text>

          {/* Address */}
          <TouchableOpacity style={styles.addressRow} onPress={handleOpenMaps}>
            <Ionicons name="location-outline" size={18} color={theme.colors.neonGreen} />
            <Text style={[styles.addressText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {venue.address}
            </Text>
            <Ionicons name="navigate-outline" size={18} color={theme.colors.neonGreen} />
          </TouchableOpacity>

          {/* Today's Hours */}
          {todayHours && (
            <View style={styles.hoursRow}>
              <Ionicons name="time-outline" size={18} color={theme.colors.neonGreen} />
              <Text style={[styles.hoursText, { color: theme.colors.softWhite }]}>
                {t('venueDetail.todayHours')}: {formatTimeToHHMM(todayHours.openTime)} - {formatTimeToHHMM(todayHours.closeTime)}
              </Text>
            </View>
          )}

          {/* Contact */}
          {venue.contactPhone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCallPhone}>
              <Ionicons name="call-outline" size={18} color={theme.colors.neonGreen} />
              <Text style={[styles.contactText, { color: theme.colors.softWhite }]}>
                {venue.contactPhone}
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.neonGreen }]}
              onPress={() => setOwnerModalVisible(true)}
            >
              <Ionicons name="person-circle-outline" size={20} color={theme.colors.darkBlack} />
              <Text style={[styles.actionButtonText, { color: theme.colors.darkBlack }]}>
                {t('venueDetail.ownerButton')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2a2a2a' }]}
              onPress={handleOpenMaps}
            >
              <Ionicons name="map-outline" size={20} color={theme.colors.softWhite} />
              <Text style={[styles.actionButtonText, { color: theme.colors.softWhite }]}>
                {t('venueDetail.directions')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { marginHorizontal: 16, marginTop: 16 }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'info' ? theme.colors.neonGreen : 'transparent',
                borderColor: activeTab === 'info' ? theme.colors.neonGreen : '#2a2a2a',
              },
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'info' ? theme.colors.darkBlack : theme.colors.textSecondary },
              ]}
            >
              {t('venueDetail.tabs.info')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'fields' ? theme.colors.neonGreen : 'transparent',
                borderColor: activeTab === 'fields' ? theme.colors.neonGreen : '#2a2a2a',
              },
            ]}
            onPress={() => setActiveTab('fields')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'fields' ? theme.colors.darkBlack : theme.colors.textSecondary },
              ]}
            >
              {t('venueDetail.tabs.fields', { count: venue.fields?.length || 0 })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'hours' ? theme.colors.neonGreen : 'transparent',
                borderColor: activeTab === 'hours' ? theme.colors.neonGreen : '#2a2a2a',
              },
            ]}
            onPress={() => setActiveTab('hours')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'hours' ? theme.colors.darkBlack : theme.colors.textSecondary },
              ]}
            >
              {t('venueDetail.tabs.hours')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={[styles.tabContent, { marginHorizontal: 16 }]}>
          {/* Info Tab */}
          {activeTab === 'info' && (
            <View>
              {/* Description */}
              {venue.description && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.softWhite }]}>
                    {t('venueDetail.description')}
                  </Text>
                  <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                    {venue.description}
                  </Text>
                </View>
              )}

              {/* Amenities */}
              {venue.amenities !== null && venue.amenities !== undefined && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.softWhite }]}>
                    {t('venueDetail.amenities')}
                  </Text>
                  <View style={styles.amenitiesContainer}>
                    {venue.amenities.split(',').map((amenity, index) => (
                      <View
                        key={index}
                        style={[styles.amenityTag, { backgroundColor: '#2a2a2a' }]}
                      >
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.neonGreen} />
                        <Text style={[styles.amenityText, { color: theme.colors.softWhite }]}>
                          {amenity.trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Location Map Preview */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.softWhite }]}>
                  {t('venueDetail.location')}
                </Text>
                <TouchableOpacity
                  style={[styles.mapPreview, { backgroundColor: '#2a2a2a' }]}
                  onPress={handleOpenMaps}
                >
                  <Ionicons name="map" size={48} color={theme.colors.neonGreen} />
                  <Text style={[styles.mapPreviewText, { color: theme.colors.softWhite }]}>
                    {t('venueDetail.openMap')}
                  </Text>
                  <Text style={[styles.coordinatesText, { color: theme.colors.textSecondary }]}>
                    {venue.latitude.toFixed(6)}, {venue.longitude.toFixed(6)}
                  </Text>
                </TouchableOpacity>
              </View>

              <VenueReviewsSection reviews={venue.reviews || []} />
            </View>
          )}

          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <View>
              {venue.fields && venue.fields.length > 0 ? (
                venue.fields.map((field, index) => (
                  <View
                    key={field.fieldId}
                    style={[styles.fieldCard, { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }]}
                  >
                    <View style={styles.fieldHeader}>
                      <View style={styles.fieldInfo}>
                        <Text style={[styles.fieldName, { color: theme.colors.softWhite }]}>
                          {field.fieldName}
                        </Text>
                        <View style={[styles.fieldTypeBadge, { backgroundColor: theme.colors.neonGreen + '20' }]}>
                          <Text style={[styles.fieldTypeText, { color: theme.colors.neonGreen }]}>
                            {formatFieldType(field.fieldType)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.fieldPricing}>
                        <Text style={[styles.fieldPrice, { color: theme.colors.neonGreen }]}>
                          {formatCurrency(field.hourlyRate)}
                        </Text>
                        <Text style={[styles.perHourText, { color: theme.colors.textSecondary }]}>
                          {t('venueDetail.perHour')}
                        </Text>
                      </View>
                    </View>

                    {field.surfaceType && (
                      <View style={styles.fieldDetails}>
                        <Ionicons name="layers-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.fieldDetailText, { color: theme.colors.textSecondary }]}>
                          {t('venueDetail.surfaceType')}: {field.surfaceType}
                        </Text>
                      </View>
                    )}

                    {field.peakHourSurcharge > 0 && (
                      <View style={styles.fieldDetails}>
                        <Ionicons name="trending-up-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.fieldDetailText, { color: theme.colors.textSecondary }]}>
                          {t('venueDetail.peakSurcharge')}: {formatCurrency(field.peakHourSurcharge)}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.bookFieldButton, { backgroundColor: theme.colors.neonGreen }]}
                      onPress={() => setFieldsModalVisible(true)}
                    >
                      <Text style={[styles.bookFieldButtonText, { color: theme.colors.darkBlack }]}>
                        {t('venueDetail.bookThisField')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="football-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {t('venueDetail.noFields')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && (
            <View>
              {venue.operatingHours && venue.operatingHours.length > 0 ? (
                <View style={[styles.hoursCard, { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }]}>
                  {venue.operatingHours
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((hour, index) => {
                      const isToday = new Date().getDay() === hour.dayOfWeek;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.hourRow,
                            isToday && { backgroundColor: theme.colors.neonGreen + '15' },
                            index < venue.operatingHours.length - 1 && styles.hourRowBorder,
                          ]}
                        >
                          <View style={styles.dayContainer}>
                            <Text
                              style={[
                                styles.dayText,
                                { color: isToday ? theme.colors.neonGreen : theme.colors.softWhite },
                              ]}
                            >
                              {getDayName(hour.dayOfWeek)}
                            </Text>
                            {isToday && (
                              <View style={[styles.todayBadge, { backgroundColor: theme.colors.neonGreen }]}>
                                <Text style={[styles.todayText, { color: theme.colors.darkBlack }]}>
                                  {t('venueDetail.today')}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.timeText,
                              { color: isToday ? theme.colors.neonGreen : theme.colors.textSecondary },
                            ]}
                          >
                            {formatTimeToHHMM(hour.openTime)} - {formatTimeToHHMM(hour.closeTime)}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {t('venueDetail.noHours')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fields Modal for Booking */}
      {venueForModal && (
        <FieldsModal
          visible={fieldsModalVisible}
          venue={venueForModal}
          onClose={() => setFieldsModalVisible(false)}
          onSelectField={handleSelectField}
          theme={theme}
        />
      )}

      {/* Floating Book Button */}
      <View style={[styles.floatingButtonContainer, { backgroundColor: theme.colors.darkBlack }]}>
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: theme.colors.neonGreen }]}
          onPress={() => setFieldsModalVisible(true)}
        >
          <Ionicons name="football" size={24} color={theme.colors.darkBlack} />
          <Text style={[styles.floatingButtonText, { color: theme.colors.darkBlack }]}>
            {t('venueDetail.bookNow')}
          </Text>
        </TouchableOpacity>
      </View>

      <VenueOwnerModal
        visible={ownerModalVisible}
        ownerInfo={venue.owner || null}
        onClose={() => setOwnerModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  heroSection: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  imageIndicator: {
    height: 8,
    borderRadius: 4,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 14,
  },
  mapPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
  },
  mapPreviewText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 12,
    marginTop: 4,
  },
  fieldCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fieldTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldPricing: {
    alignItems: 'flex-end',
  },
  fieldPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  perHourText: {
    fontSize: 12,
  },
  fieldDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fieldDetailText: {
    fontSize: 13,
  },
  bookFieldButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  bookFieldButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hoursCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hourRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default VenueDetailScreen;
