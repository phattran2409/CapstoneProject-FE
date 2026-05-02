import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import type { owner } from '../types/venue.types';

interface VenueOwnerModalProps {
  visible: boolean;
  ownerInfo: owner | null;
  onClose: () => void;
}

const VenueOwnerModal: React.FC<VenueOwnerModalProps> = ({ visible, ownerInfo, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.softWhite }]}>
              {t('venueDetail.ownerInfo')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.softWhite} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {ownerInfo?.avatarUrl ? (
              <Image source={{ uri: ownerInfo.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: '#2a2a2a' }]}>
                <Ionicons name="person" size={24} color={theme.colors.softWhite} />
              </View>
            )}

            <Text style={[styles.ownerName, { color: theme.colors.softWhite }]}>
              {ownerInfo?.fullName || t('venueDetail.ownerUnknown')}
            </Text>

            <View style={styles.row}>
              <Ionicons name="call-outline" size={18} color={theme.colors.neonGreen} />
              <Text style={[styles.rowText, { color: theme.colors.textSecondary }]}>
                {ownerInfo?.phone || t('venueDetail.ownerNoPhone')}
              </Text>
            </View>

            {ownerInfo?.bio ? (
              <Text style={[styles.bioText, { color: theme.colors.textSecondary }]}>
                {ownerInfo.bio}
              </Text>
            ) : (
              <Text style={[styles.bioText, { color: theme.colors.textSecondary }]}>
                {t('venueDetail.ownerNoBio')}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    fontSize: 14,
  },
  bioText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default VenueOwnerModal;
