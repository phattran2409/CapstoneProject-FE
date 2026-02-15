import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useVenues, Venue, Field, TimeSlot } from '@/features/venues';
import { RootStackParamList } from '@/app/navigation/types';
import { FieldsModal } from '../components';
import { EmptyState, LoadingMoreIndicator } from '@/shared/components';

/** Filter theo fieldType của API: FiveVsFive, SevenVsSeven, ElevenVsEleven */
type FieldTypeFilter = '' | 'FiveVsFive' | 'SevenVsSeven' | 'ElevenVsEleven';

type VenueSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VenueSelection'>;
type VenueSelectionScreenRouteProp = RouteProp<RootStackParamList, 'VenueSelection'>;

interface VenueSelectionScreenProps {
  navigation?: VenueSelectionScreenNavigationProp;
  route?: VenueSelectionScreenRouteProp;
}

const VenueSelectionScreen: React.FC<VenueSelectionScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FieldTypeFilter>(
    (route?.params?.matchFormat as FieldTypeFilter) ?? 'all'
  );
  const [fieldsModalVisible, setFieldsModalVisible] = useState(false);
  const [selectedVenueForFields, setSelectedVenueForFields] = useState<Venue | null>(null);

  useEffect(() => {
    const format = route?.params?.matchFormat as FieldTypeFilter | undefined;
    if (format && ['FiveVsFive', 'SevenVsSeven', 'ElevenVsEleven'].includes(format)) {
      setSelectedFilter(format);
    }
  }, [route?.params?.matchFormat]);

  // ✅ Fetch venues from API (sportType gửi fieldType: FiveVsFive, SevenVsSeven, ElevenVsEleven)
  const { 
    venues,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    setVenues,
  } = useVenues({
    pageSize: 5,
    fieldType: selectedFilter === '' ? undefined : selectedFilter,
  });

  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat('vi-VN', {
  //     style: 'currency',
  //     currency: 'VND',
  //   }).format(price);
  // };

  const handleSelectVenue = (venue: Venue) => {
    navigation?.navigate('VenueDetail', { venueId: venue.venueId });
  };

  const handleOpenFieldsModal = (venue: Venue) => {
    setSelectedVenueForFields(venue);
    setFieldsModalVisible(true);
  };

  const handleCloseFieldsModal = () => {
    setFieldsModalVisible(false);
    setSelectedVenueForFields(null);
  };

  const handleSelectField = (venue: Venue, field: Field, selectedSlot: TimeSlot, selectedDate: string) => {
    handleCloseFieldsModal();
    navigation?.replace('CreateRoom', { 
      selectedVenue: venue,
      selectedField: field,
      selectedTimeSlot: selectedSlot,
      selectedDate,
    });
  };

  // Render Venue Item
  const renderVenueItem = useCallback(({ item: venue }: { item: Venue }) => {
    // Get available formats from fields
    const availableFormats = [...new Set(venue.fields?.map(f => f.fieldType) || [])];
    // Get minimum price from fields
    // const minPrice = venue.fields?.length ? Math.min(...venue.fields.map(f => f.pricePerHour)) : 0;
    // Get image source
    const imageSource = venue.primaryPhotoUrl 
      ? { uri: venue.primaryPhotoUrl } 
      : require('@assets/images/icon.png');

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleSelectVenue(venue)}
        style={[
          styles.venueCard,
          {
            backgroundColor: '#1a1a1a',
            borderRadius: theme.radius.l,
            marginBottom: theme.spacing.m,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#2a2a2a',
          },
        ]}
  
      >
        {/* Venue Image */}
        <Image
          source={imageSource}
          style={styles.venueImage}
          resizeMode="cover"
        />

        <View style={{ padding: theme.spacing.m }}>
          {/* Venue Name and Rating */}
          <View style={[styles.venueHeader, { marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.venueName, { color: theme.colors.softWhite }]}>
                {venue.name}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.locationText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {venue.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {venue.description && (
            <Text style={[styles.address, { color: theme.colors.textSecondary, marginBottom: 12 }]} numberOfLines={2}>
              {venue.description}
            </Text>
          )}

          {/* Facilities/Amenities */}
          {/* {venue.amenities && venue.amenities.length > 0 && (
            <View style={[styles.facilitiesContainer, { marginBottom: 12 }]}>
              {venue.amenities.map((amenity, index) => (
                <View key={index} style={[styles.facilityTag, { backgroundColor: '#2a2a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }]}>
                  <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          )} */}

          {/* Fields Count Indicator */}
          {venue.fields && venue.fields.length > 0 && (
            <TouchableOpacity
              style={[styles.fieldsIndicator, { 
                backgroundColor: theme.colors.neonGreen + '15',
                borderColor: theme.colors.neonGreen + '30',
              }]}
              onPress={() => handleOpenFieldsModal(venue)}
            >
              <View style={styles.fieldsIndicatorLeft}>
                <Ionicons name="football-outline" size={20} color={theme.colors.neonGreen} />
                <View>
                  <Text style={[styles.fieldsCount, { color: theme.colors.neonGreen }]}>
                    {venue.fields.length} sân có sẵn
                  </Text>
                  <Text style={[styles.fieldsHint, { color: theme.colors.textSecondary }]}>
                    Nhấn để xem chi tiết & đặt sân
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neonGreen} />
            </TouchableOpacity>
          )}  

          {/* View Detail Button */}
          <TouchableOpacity
            style={[styles.viewDetailButton, { borderColor: '#2a2a2a' }]}
            onPress={() => handleSelectVenue(venue)}
          >
            <Text style={[styles.viewDetailText, { color: theme.colors.textSecondary }]}>
              Xem chi tiết
            </Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

         
        </View>
      </TouchableOpacity>
    );
  }, [theme, t]);

  // Render Footer - Loading More Indicator
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <LoadingMoreIndicator />
    );
  }, [loadingMore, theme]);

  // Render Empty List
  const renderEmptyList = useCallback(() => {
    if (loading) return null;
    return (
      // <View style={styles.emptyState}>
      //   <Ionicons name="location-outline" size={64} color={theme.colors.textSecondary} />
      //   <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
      //     {t('venueSelection.noResults')}
      //   </Text>
      // </View>
      <EmptyState
        title={t('venueSelection.noResults')}
        description={t('venueSelection.noResultsDescription')}
        icon="location-outline"
      />
    );
  }, [loading, theme, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' }]}>
        <View style={[styles.headerTop, { marginBottom: theme.spacing.m }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.softWhite} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Ionicons name="location" size={28} color={theme.colors.neonGreen} />
              <Text style={[styles.title, { color: theme.colors.softWhite, fontSize: theme.fontSizes.xxl }]}>
                {t('venueSelection.title')}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: '#1a1a1a', borderRadius: theme.radius.m, paddingHorizontal: theme.spacing.m, paddingVertical: 12, marginBottom: theme.spacing.m }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.softWhite, marginLeft: 8, flex: 1 }]}
            placeholder={t('venueSelection.searchPlaceholder')}
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

        {/* Format Filter (fieldType: FiveVsFive, SevenVsSeven, ElevenVsEleven) */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === '' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === '' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              {t('venueSelection.allFormats')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'FiveVsFive' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('FiveVsFive')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === 'FiveVsFive' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              5 vs 5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'SevenVsSeven' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('SevenVsSeven')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === 'SevenVsSeven' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              7 vs 7
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'ElevenVsEleven' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('ElevenVsEleven')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === 'ElevenVsEleven' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              11 vs 11
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Venues List */}
      <FlatList
        data={venues}
        keyExtractor={(venue) => venue.venueId}
        renderItem={renderVenueItem}
        contentContainerStyle={{ 
          paddingHorizontal: theme.spacing.l, 
          paddingVertical: theme.spacing.m,
          paddingBottom: theme.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        // Pull to Refresh
        refreshing={refreshing}
        onRefresh={refresh}
        // Load More
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        // Footer: Loading indicator khi load more
        ListFooterComponent={renderFooter}
        // Empty State
        ListEmptyComponent={renderEmptyList}
      />

      {/* Fields Modal */}
      <FieldsModal
        visible={fieldsModalVisible}
        venue={selectedVenueForFields}
        onClose={handleCloseFieldsModal}
        onSelectField={handleSelectField}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    // Styles applied via inline
  },
  headerTop: {
    // Styles applied via inline
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    // Styles applied via inline
  },
  filterText: {
    fontSize: 14,
  },
  venueCard: {
    // Styles applied via inline
  },
  venueImage: {
    width: '100%',
    height: 192,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  reviewsText: {
    fontSize: 12,
  },
  address: {
    fontSize: 14,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityTag: {
    // Styles applied via inline
  },
  facilityText: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  formatsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  formatBadge: {
    // Styles applied via inline
  },
  formatText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  // Fields Indicator styles
  fieldsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  fieldsIndicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldsCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldsHint: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  viewDetailText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VenueSelectionScreen;
