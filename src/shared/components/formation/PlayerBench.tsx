import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { ThemedText } from '../themed';
import type { FormationPlayer, PositionLine } from './types';

/** Colors for different position lines */
const ROLE_COLORS: Record<PositionLine, string> = {
  GK: '#FFD700',
  DF: '#4169E1',
  MF: '#32CD32',
  FW: '#DC143C',
};

interface PlayerBenchCardProps {
  player: FormationPlayer;
  isSelected: boolean;
  onPress: (player: FormationPlayer) => void;
  editable: boolean;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
};

const PlayerBenchCard: React.FC<PlayerBenchCardProps> = ({
  player,
  isSelected,
  onPress,
  editable,
}) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1, SPRING_CONFIG);
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (editable) {
      scale.value = withSequence(
        withSpring(0.95, SPRING_CONFIG),
        withSpring(1, SPRING_CONFIG)
      );
      onPress(player);
    }
  };

  const roleColor = player.role ? ROLE_COLORS[player.role] : '#888';

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          { borderColor: isSelected ? '#00FF66' : 'transparent' },
        ]}
        onPress={handlePress}
        activeOpacity={editable ? 0.7 : 1}
        disabled={!editable}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {player.avatar ? (
            <Image source={player.avatar} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <ThemedText size="l" weight="bold" style={{ color: '#fff' }}>
                {player.name?.charAt(0) || '?'}
              </ThemedText>
            </View>
          )}
          
          {/* Role badge */}
          {player.role && (
            <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
              <ThemedText size="xs" weight="bold" style={{ color: '#fff', fontSize: 8 }}>
                {player.role}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Player name */}
        <ThemedText 
          size="xs" 
          weight="medium" 
          numberOfLines={1}
          style={styles.playerName}
        >
          {player.name?.split(' ')[0]}
        </ThemedText>

        {/* Captain badge */}
        {player.isCaptain && (
          <View style={styles.captainBadge}>
            <ThemedText size="xs" weight="bold" style={{ color: '#FFD700', fontSize: 8 }}>
              C
            </ThemedText>
          </View>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <ThemedText size="xs" style={{ color: '#00FF66' }}>
              ✓
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface PlayerBenchProps {
  /** All players in the team */
  players: FormationPlayer[];
  /** Players already assigned to slots */
  assignedPlayerIds: string[];
  /** Currently selected player */
  selectedPlayerId?: string | null;
  /** Called when a player is selected */
  onPlayerSelect: (player: FormationPlayer) => void;
  /** Whether editing is enabled (captain only) */
  editable?: boolean;
  /** Title for the bench section */
  title?: string;
}

const PlayerBench: React.FC<PlayerBenchProps> = ({
  players,
  assignedPlayerIds,
  selectedPlayerId,
  onPlayerSelect,
  editable = false,
  title = 'Ghế dự bị',
}) => {
  // Filter out players already assigned to slots
  const benchPlayers = players.filter((p) => !assignedPlayerIds.includes(p.id));

  if (benchPlayers.length === 0 && !editable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText size="s" weight="semiBold" variant="secondary">
          {title}
        </ThemedText>
        <ThemedText size="xs" variant="secondary">
          {benchPlayers.length} người chưa xếp
        </ThemedText>
      </View>

      {benchPlayers.length === 0 ? (
        <View style={styles.emptyBench}>
          <ThemedText size="s" variant="secondary" style={{ textAlign: 'center' }}>
            Tất cả người chơi đã được xếp vị trí
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {benchPlayers.map((player) => (
            <PlayerBenchCard
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              onPress={onPlayerSelect}
              editable={editable}
            />
          ))}
        </ScrollView>
      )}

      {editable && benchPlayers.length > 0 && (
        <ThemedText size="xs" variant="secondary" style={styles.hint}>
          Chọn người chơi, sau đó chọn vị trí trên sân
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  emptyBench: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cardContainer: {
    marginRight: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    minWidth: 64,
    borderWidth: 2,
  },
  cardSelected: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 18,
    alignItems: 'center',
  },
  playerName: {
    color: '#fff',
    textAlign: 'center',
    maxWidth: 60,
  },
  captainBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 102, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default PlayerBench;

