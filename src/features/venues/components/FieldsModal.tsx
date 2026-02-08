import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions, ActivityIndicator, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Venue, Field, TimeSlot, FieldAvailability } from '../types/venue.types';
import { getFieldAvailability } from '../api/venuesApi';
import { getMinSelectableDate, getMaxSelectableDate, formatDateYYYYMMDDLocal, formatDateDDMMYYYY } from '@/shared/utils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FieldsModalProps {
  visible: boolean;
  venue: Venue | null;
  onClose: () => void;
  onSelectField: (venue: Venue, field: Field, selectedSlot: TimeSlot, selectedDate: string) => void;
  theme: any;
}

// Cache for field availability to avoid redundant API calls
type AvailabilityCache = Record<string, FieldAvailability>;

const FieldsModal: React.FC<FieldsModalProps> = ({ 
  visible, 
  venue, 
  onClose, 
  onSelectField, 
  theme 
}) => {
  const { t } = useTranslation();
  const [selectedTimeKey, setSelectedTimeKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [availabilityCache, setAvailabilityCache] = useState<AvailabilityCache>({});
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});


  // Today in YYYY-MM-DD (local) to avoid timezone shifts
  const getTodayDate = () => formatDateYYYYMMDDLocal(new Date());


  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // handle change date picker
  const handleDateChange = useCallback(
    (_event: any, date?: Date) => {
      if (Platform.OS !== "ios") {
        setShowDatePicker(false);
      }

      if (!date) return;

      const next = formatDateYYYYMMDDLocal(date);
      setSelectedDate(next);

      // Reset slot selection when changing date
      setSelectedTimeKey(null);
      setSelectedSlot(null);
    },
    [],
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedTimeKey(null);
      setSelectedSlot(null);
      setExpandedFieldId(null);
      setAvailabilityCache({});
      setLoadingFields({});
    }
  }, [visible]);

  // Fetch availability when a field is expanded
  const fetchFieldAvailability = useCallback(async (fieldId: string) => {
    const cacheKey = `${fieldId}-${selectedDate}`;
    
    // Skip if already cached or loading
    if (availabilityCache[cacheKey] || loadingFields[fieldId]) {
      return;
    }

    setLoadingFields(prev => ({ ...prev, [fieldId]: true }));
    
    try {
      const availability = await getFieldAvailability(fieldId, selectedDate);
      console.log('availability', availability);
      setAvailabilityCache(prev => ({ ...prev, [cacheKey]: availability }));
    } catch (error) {
      console.error('Failed to fetch availability for field:', fieldId, error);
    } finally {
      setLoadingFields(prev => ({ ...prev, [fieldId]: false }));
    }
  }, [selectedDate, availabilityCache, loadingFields]);

  // Handle field expansion toggle
  const handleToggleField = useCallback((fieldId: string) => {
    if (expandedFieldId === fieldId) {
      setExpandedFieldId(null);
    } else {
      setExpandedFieldId(fieldId);
      fetchFieldAvailability(fieldId);
    }
  }, [expandedFieldId, fetchFieldAvailability]);

  // Handle time slot selection
  const handleSelectTimeSlot = useCallback((fieldId: string, slot: TimeSlot, index: number) => {
    const key = `${fieldId}-${index}`;
    setSelectedTimeKey(key);
    setSelectedSlot(slot);
  }, []);

  // Handle book button press - pass selectedDate (YYYY-MM-DD) so CreateRoom can use it
  const handleBookField = useCallback((field: Field) => {
    if (venue && selectedSlot) {
      onSelectField(venue, field, selectedSlot, selectedDate);
    }
  }, [venue, selectedSlot, selectedDate, onSelectField]);

  if (!venue) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getFieldTypeColor = (fieldType: string) : {color: string, shortNameType: string} => {
    switch (fieldType) {
      case 'FiveVsFive':
        return { color: '#10B981', shortNameType: '5 vs 5' };
      case 'SevenVsSeven':
        return { color: '#3B82F6', shortNameType: '7 vs 7' };
      case 'ElevenVsEleven':
        return { color: '#8B5CF6', shortNameType: '11 vs 11' };
      default:
        return { color: theme.colors.neonGreen, shortNameType: fieldType };
    }
  };

  // chưa được sử dụng
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'booked':
        return '#EF4444';
      case 'maintenance':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available':
        return t('fieldsModal.status.available', 'Còn trống');
      case 'booked':
        return t('fieldsModal.status.booked', 'Đã đặt');
      case 'maintenance':
        return t('fieldsModal.status.maintenance', 'Bảo trì');
      default:
        return t('fieldsModal.status.available', 'Còn trống');
    }
  };

  // Get availability for a field
  const getFieldTimeSlots = (fieldId: string): TimeSlot[] => {
    const cacheKey = `${fieldId}-${selectedDate}`;
    console.log('availabilityCache', availabilityCache[cacheKey]);
    return availabilityCache[cacheKey]?.timeSlots || [];
  };

  // Check if field is loading
  const isFieldLoading = (fieldId: string): boolean => {
    return loadingFields[fieldId] || false;
  };

  // Render time slots grid
  const renderTimeSlots = (field: Field) => {
    const timeSlots = getFieldTimeSlots(field.fieldId);
    const isLoading = isFieldLoading(field.fieldId);
    console.log('timeSlots', timeSlots);
    if (isLoading) {
      return (
        <View style={styles.timeSlotsLoading}>
          <ActivityIndicator size="small" color={theme.colors.neonGreen} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('fieldsModal.loadingSlots', 'Đang tải khung giờ...')}
          </Text>
        </View>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <View style={styles.noSlotsContainer}>
          <Text style={[styles.noSlotsText, { color: theme.colors.textSecondary }]}>
            {t('fieldsModal.noSlots', 'Không có khung giờ khả dụng')}
          </Text>
        </View>
      );
    }

    // Group slots into rows for better display
    const availableSlots = timeSlots.filter(slot => slot.isAvailable);
    const bookedSlots = timeSlots.filter(slot => !slot.isAvailable);

    return (
      <View style={styles.timeSlotsSection}>
        {/* Available slots */}
        {availableSlots.length > 0 && (
          <View style={styles.slotGroup}>
            <Text style={[styles.slotGroupTitle, { color: theme.colors.neonGreen }]}>
              {t('fieldsModal.availableLabel', 'Còn trống')} ({availableSlots.length})
            </Text>
            <View style={styles.timeSlotsGrid}>
              {availableSlots.map((slot, index) => {
                const globalIndex = timeSlots.indexOf(slot);
                const key = `${field.fieldId}-${globalIndex}`;
                const isSelected = selectedTimeKey === key;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlotChip,
                      {
                        backgroundColor: isSelected ? theme.colors.neonGreen : '#2a2a2a',
                        borderColor: isSelected ? theme.colors.neonGreen : '#3a3a3a',
                      },
                    ]}
                    onPress={() => handleSelectTimeSlot(field.fieldId, slot, globalIndex)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        { color: isSelected ? theme.colors.darkBlack : theme.colors.softWhite },
                      ]}
                    >
                      {slot.startTime}
                    </Text>
                    <Text
                      style={[
                        styles.timeSlotPrice,
                        { color: isSelected ? theme.colors.darkBlack : theme.colors.textSecondary },
                      ]}
                    >
                      {formatPrice(slot.hourlyRate)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Booked slots */}
        {bookedSlots.length > 0 && (
          <View style={styles.slotGroup}>
            <Text style={[styles.slotGroupTitle, { color: '#EF4444' }]}>
              {t('fieldsModal.bookedLabel', 'Đã đặt')} ({bookedSlots.length})
            </Text>
            <View style={styles.timeSlotsGrid}>
              {bookedSlots.map((slot, index) => (
                <View
                  key={index}
                  style={[
                    styles.timeSlotChip,
                    styles.timeSlotBooked,
                    { backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' },
                  ]}
                >
                  <Text style={[styles.timeSlotText, { color: '#666' }]}>
                    {slot.startTime}
                  </Text>
                  <Text style={[styles.timeSlotPrice, { color: '#555' }]}>
                    {t('fieldsModal.bookedShort', 'Đã đặt')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#121212' }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: '#2a2a2a' }]}>
            <View style={styles.modalHeaderLeft}>
              <View style={[styles.fieldIconContainer, { backgroundColor: theme.colors.neonGreen + '20' }]}>
                <Ionicons name="football" size={24} color={theme.colors.neonGreen} />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalTitle, { color: theme.colors.softWhite }]}>
                  {venue.name}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  {t('fieldsModal.subtitle', '{{count}} sân có sẵn', { count: venue.fields.length })}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: '#2a2a2a' }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.softWhite} />
            </TouchableOpacity>
          </View>

          {/* Date Display (tap to change) */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.75}
            style={[styles.dateContainer, { backgroundColor: '#1a1a1a' }]}
          >
            <Ionicons name="calendar" size={18} color={theme.colors.neonGreen} />
            <Text style={[styles.dateText, { color: theme.colors.softWhite }]}>
              {formatDateDDMMYYYY(selectedDate)}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(selectedDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={getMinSelectableDate()}
              maximumDate={getMaxSelectableDate()}
            />
          )}

          {/* Fields List */}
          <ScrollView 
            style={styles.fieldsScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {venue.fields.map((field, index) => {
              const isExpanded = expandedFieldId === field.fieldId;
              const isAvailable = field.status !== 'booked' && field.status !== 'maintenance';
              const hasSelectedSlot = selectedTimeKey?.startsWith(field.fieldId + '-');
              
              return (
                <View
                  key={field.fieldId}
                  style={[
                    styles.fieldCard,
                    { 
                      backgroundColor: '#1a1a1a',
                      borderColor: isExpanded ? theme.colors.neonGreen + '50' : '#2a2a2a',
                    }
                  ]}
                >
                  {/* Field Header - Clickable to expand */}
                  <TouchableOpacity
                    style={styles.fieldCardHeader}
                    onPress={() => handleToggleField(field.fieldId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.fieldNameSection}>
                      <View style={[
                        styles.fieldNumberBadge,
                        { backgroundColor: getFieldTypeColor(field.fieldType) + '20' }
                      ]}>
                        <Text style={[styles.fieldNumber, { color: getFieldTypeColor(field.fieldType).color }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.fieldNameContainer}>
                        <Text style={[styles.fieldName, { color: theme.colors.softWhite }]}>
                          {field.fieldName}
                        </Text>
                        {field.description && (
                          <Text style={[styles.fieldDescription, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {field.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.fieldHeaderRight}>
                      {/* Field Type Badge */}
                      <View style={[
                        styles.fieldTypeBadge,
                        { backgroundColor: getFieldTypeColor(field.fieldType).color }
                      ]}>
                        <Text style={styles.fieldTypeText}>{getFieldTypeColor(field.fieldType).shortNameType}</Text>
                      </View>
                      
                      {/* Expand Icon */}
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={theme.colors.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Content - Time Slots */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      
                      {/* Time Slots */}
                      <View style={styles.timeSlotsWrapper}>
                        <Text style={[styles.timeTitle, { color: theme.colors.softWhite }]}>
                          {t('fieldsModal.selectTimeTitle', 'Chọn khung giờ')}
                        </Text>
                        {renderTimeSlots(field)}
                      </View>

                      {/* Book Button */}
                      {isAvailable && (
                        <TouchableOpacity
                          style={[
                            styles.bookButton,
                            { 
                              backgroundColor: hasSelectedSlot ? theme.colors.neonGreen : '#3a3a3a',
                            },
                          ]}
                          disabled={!hasSelectedSlot}
                          onPress={() => handleBookField(field)}
                        >
                          <Ionicons 
                            name="calendar-outline" 
                            size={18} 
                            color={hasSelectedSlot ? theme.colors.darkBlack : '#666'} 
                          />
                          <Text style={[
                            styles.bookButtonText, 
                            { color: hasSelectedSlot ? theme.colors.darkBlack : '#666' }
                          ]}>
                            {hasSelectedSlot 
                              ? t('fieldsModal.bookNow', 'Đặt sân ngay') 
                              : t('fieldsModal.selectTimeFirst', 'Chọn khung giờ trước')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date Container
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldsScrollView: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Field Card styles
  fieldCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  fieldNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldNameContainer: {
    flex: 1,
  },
  fieldNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  fieldHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fieldTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  // Expanded Content
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  fieldInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
    marginBottom: 16,
  },
  fieldInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldInfoText: {
    fontSize: 13,
  },
  // Time Slots
  timeSlotsWrapper: {
    marginBottom: 16,
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeSlotsSection: {
    gap: 16,
  },
  slotGroup: {
    gap: 8,
  },
  slotGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  timeSlotBooked: {
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeSlotPrice: {
    fontSize: 11,
    marginTop: 2,
  },
  timeSlotsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 13,
  },
  noSlotsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 13,
  },
  // Book Button
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FieldsModal;
