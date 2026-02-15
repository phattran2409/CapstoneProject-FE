import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ThemedText, ThemedCard } from '@/shared/components/themed';
import { useTheme } from '@/shared/theme';
import type { MatchRoomFullInfo } from '@/features/rooms';

interface HostTabContentProps {
  displayRoom: MatchRoomFullInfo;
}

export const HostTabContent: React.FC<HostTabContentProps> = ({ displayRoom }) => {
  const { theme } = useTheme();
  const host = displayRoom.host;

  if (!host) return null;

  return (
    <View>
      <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
        Host Information
      </ThemedText>

      <ThemedCard style={styles.hostCard}>
        <View style={styles.hostHeader}>
          <Image
            source={{
              uri:
                host.avatarUrl ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(host.fullName),
            }}
            style={styles.hostAvatar}
          />
          <View style={styles.hostInfo}>
            <ThemedText size="xl" weight="bold" style={styles.hostName}>
              {host.fullName}
            </ThemedText>
            <ThemedText variant="secondary" size="s">
              Host ID: {host.userId.slice(0, 8)}...
            </ThemedText>
          </View>
        </View>

        {displayRoom.description && (
          <View style={styles.hostBio}>
            <ThemedText variant="secondary" size="xs" style={{ marginBottom: 4 }}>
              Description
            </ThemedText>
            <ThemedText size="m">{displayRoom.description}</ThemedText>
          </View>
        )}

        {displayRoom.rules && (
          <View style={[styles.hostBio, { marginTop: 12 }]}>
            <ThemedText variant="secondary" size="xs" style={{ marginBottom: 4 }}>
              Rules
            </ThemedText>
            <ThemedText size="m">{displayRoom.rules}</ThemedText>
          </View>
        )}

        {displayRoom.field.venue.contactPhone && (
          <View style={styles.hostContact}>
            <View
              style={[
                styles.hostContactItem,
                { backgroundColor: theme.colors.neonGreen + '10' },
              ]}
            >
              <ThemedText variant="secondary" size="xs" style={styles.contactLabel}>
                Venue Contact
              </ThemedText>
              <ThemedText size="s" weight="medium">
                {displayRoom.field.venue.contactPhone}
              </ThemedText>
            </View>
          </View>
        )}
      </ThemedCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 16,
  },
  hostCard: {
    padding: 20,
    borderRadius: 16,
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    marginBottom: 4,
  },
  hostBio: {
    marginBottom: 16,
  },
  hostContact: {
    flexDirection: 'row',
    gap: 12,
  },
  hostContactItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  contactLabel: {
    marginBottom: 4,
  },
});
