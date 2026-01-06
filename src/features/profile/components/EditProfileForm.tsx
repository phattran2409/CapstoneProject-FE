import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { UpdateProfileData } from '../types/profile.types';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditProfileFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: UpdateProfileData) => void;
  initialData?: Partial<UpdateProfileData>;
  isLoading?: boolean;
}

interface FormFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  error?: string;
}

const POSITIONS = [
  { id: 'GK' },
  { id: 'CB' },
  { id: 'LB' },
  { id: 'RB' },
  { id: 'CDM' },
  { id: 'CM' },
  { id: 'CAM' },
  { id: 'LW' },
  { id: 'RW' },
  { id: 'ST' },
];

const GENDERS = [
  { id: 'male', label: 'Nam', icon: 'male' },
  { id: 'female', label: 'Nữ', icon: 'female' },
  { id: 'other', label: 'Khác', icon: 'ellipse' },
];

const PREFERRED_FOOT = [
  { id: 'left', label: 'Chân trái', icon: 'arrow-back' },
  { id: 'right', label: 'Chân phải', icon: 'arrow-forward' },
  { id: 'both', label: 'Cả hai', icon: 'swap-horizontal' },
];

const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  maxLength,
  keyboardType = 'default',
  error,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={16} color={theme.colors.neonGreen} />
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.neonGreen
              : theme.colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              height: multiline ? 100 : 48,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {maxLength && (
          <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const SelectionField: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[];
  value: string;
  onSelect: (id: string) => void;
}> = ({ label, icon, options, value, onSelect }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={16} color={theme.colors.neonGreen} />
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  value === option.id
                    ? theme.colors.neonGreen
                    : theme.colors.surface,
                borderColor:
                  value === option.id
                    ? theme.colors.neonGreen
                    : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name={option.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={value === option.id ? theme.colors.black : theme.colors.text}
            />
            <Text
              style={[
                styles.optionText,
                {
                  color: value === option.id ? theme.colors.black : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  visible,
  onClose,
  onSave,
  initialData = {},
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<UpdateProfileData>({
    name: initialData.name || '',
    bio: initialData.bio || '',
    phone: initialData.phone || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || undefined,
    position: initialData.position || '',
    preferredFoot: initialData.preferredFoot || undefined,
    shirtNumber: initialData.shirtNumber || undefined,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, dateOfBirth: dateString });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = t('editProfile.errors.nameRequired', {
        defaultValue: 'Tên không được để trống',
      });
    }

 

    if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = t('editProfile.errors.invalidPhone', {
        defaultValue: 'Số điện thoại không hợp lệ',
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Header */}
            <LinearGradient
              colors={['rgba(151, 251, 87, 0.2)', 'transparent']}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                  {t('personalPage.editForm.title')}
                </Text>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isLoading}
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.colors.neonGreen },
                  ]}
                >
                  {isLoading ? (
                    <Ionicons name="hourglass" size={20} color={theme.colors.black} />
                  ) : (
                    <Text style={[styles.saveButtonText, { color: theme.colors.black }]}>
                      {t('personalPage.editForm.save')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Form Content */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <View
                  style={[
                    styles.avatarContainer,
                    {
                      borderColor: theme.colors.neonGreen,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                >
                  <Ionicons name="person" size={48} color={theme.colors.textSecondary} />
                </View>
                <TouchableOpacity
                  style={[
                    styles.changeAvatarButton,
                    { backgroundColor: theme.colors.neonGreen },
                  ]}
                >
                  <Ionicons name="camera" size={16} color={theme.colors.black} />
                </TouchableOpacity>
              </View>

              {/* Personal Info Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}>
                  {t('personalPage.editForm.sections.personal')}
                </Text>

                <FormField
                  label={t('personalPage.editForm.fields.name')}
                  icon="person"
                  value={formData.name || ''}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={t('personalPage.editForm.fields.namePlaceholder')}
                  maxLength={50}
                  error={errors.name}
                />

                <FormField
                  label={t('personalPage.editForm.fields.bio')}
                  icon="document-text"
                  value={formData.bio || ''}
                  onChangeText={(text) => setFormData({ ...formData, bio: text })}
                  placeholder={t('personalPage.editForm.fields.bioPlaceholder')}
                  multiline
                  maxLength={200}
                />

                <FormField
                  label={t('personalPage.editForm.fields.phone')}
                  icon="call"
                  value={formData.phone || ''}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="0123456789"
                  keyboardType="phone-pad"
                  maxLength={11}
                  error={errors.phone}
                />

                {/* Date of Birth */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="calendar" size={16} color={theme.colors.neonGreen} />
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {t('personalPage.editForm.fields.dateOfBirth')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={[
                      styles.inputContainer,
                      styles.dateButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        {
                          color: formData.dateOfBirth
                            ? theme.colors.text
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {formData.dateOfBirth
                        ? formatDateDisplay(formData.dateOfBirth)
                        : t('personalPage.editForm.fields.dateOfBirthPlaceholder')}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.dateOfBirth
                        ? new Date(formData.dateOfBirth)
                        : new Date(2000, 0, 1)
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1950, 0, 1)}
                  />
                )}

                <SelectionField
                  label={t('personalPage.editForm.fields.gender')}
                  icon="male-female"
                  options={GENDERS as { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[]}
                  value={formData.gender || ''}
                  onSelect={(id) =>
                    setFormData({ ...formData, gender: id as 'male' | 'female' | 'other' })
                  }
                />
              </View>

              {/* Football Info Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}>
                  {t('personalPage.editForm.sections.football')}
                </Text>

                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="football" size={16} color={theme.colors.neonGreen} />
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {t('personalPage.editForm.fields.position')}
                    </Text>
                  </View>
                  <View style={styles.positionsGrid}>
                    {POSITIONS.map((pos) => (
                      <TouchableOpacity
                        key={pos.id}
                        onPress={() => setFormData({ ...formData, position: pos.id })}
                        style={[
                          styles.positionChip,
                          {
                            backgroundColor:
                              formData.position === pos.id
                                ? theme.colors.neonGreen
                                : theme.colors.surface,
                            borderColor:
                              formData.position === pos.id
                                ? theme.colors.neonGreen
                                : theme.colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.positionChipText,
                            {
                              color:
                                formData.position === pos.id
                                  ? theme.colors.black
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {pos.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <SelectionField
                  label={t('personalPage.editForm.fields.preferredFoot')}
                  icon="footsteps"
                  options={PREFERRED_FOOT as { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[]}
                  value={formData.preferredFoot || ''}
                  onSelect={(id) =>
                    setFormData({
                      ...formData,
                      preferredFoot: id as 'left' | 'right' | 'both',
                    })
                  }
                />
                   <FormField
                  label={t('personalPage.editForm.fields.shirtNumber')}
                  icon="shirt"
                  value={formData.shirtNumber?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, shirtNumber: parseInt(text) })}
                  keyboardType="default"
                  placeholder={t('personalPage.editForm.fields.shirtNumberPlaceholder')}
                  error={errors.shirtNumber}
                />
              </View>

              {/* Extra padding for keyboard */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: SCREEN_WIDTH / 2 - 70,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 11,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  dateText: {
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  positionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  positionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  positionChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

