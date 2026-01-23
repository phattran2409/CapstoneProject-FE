import React, { 
  useState, 
  useCallback, 
  useImperativeHandle, 
  forwardRef, 
  useMemo,
  useEffect,
} from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import FormationSlotComponent from './FormationSlot';
import PlayerBench from './PlayerBench';
import { ThemedText } from '../themed';
import type { 
  FormationPlayer, 
  FormationSlot, 
  SlotAssignment, 
  FormationData,
  FormationFieldRef,
  FormationConfig,
} from './types';
import { getFormation, getFormationNames } from './types';

export interface FormationFieldProps {
  /** All players in the team */
  players: FormationPlayer[];
  /** Match format (5vs5 or 7vs7) */
  format: '5vs5' | '7vs7';
  /** Selected formation name */
  formationName: string;
  /** Initial slot assignments (from server) */
  initialAssignments?: SlotAssignment[];
  /** Whether the current user can edit (is captain) */
  editable?: boolean;
  /** Called when formation changes */
  onFormationChange?: (data: FormationData) => void;
  /** Called when a player is pressed */
  onPlayerPress?: (player: FormationPlayer, slotId: string) => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Show bench section */
  showBench?: boolean;
}

const FormationField = forwardRef<FormationFieldRef, FormationFieldProps>(
  (
    {
      players,
      format,
      formationName,
      initialAssignments = [],
      editable = false,
      onFormationChange,
      onPlayerPress,
      style,
      showBench = true,
    },
    ref
  ) => {
    // Current slot assignments: slotId -> playerId
    const [assignments, setAssignments] = useState<Record<string, string>>(() => {
      const initial: Record<string, string> = {};
      initialAssignments.forEach((a) => {
        initial[a.slotId] = a.playerId;
      });
      return initial;
    });

    // Currently selected player from bench
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    
    // Currently selected slot (for swapping)
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    // Get current formation config
    const formation = useMemo(() => {
      return getFormation(format, formationName);
    }, [format, formationName]);

    // Get list of assigned player IDs
    const assignedPlayerIds = useMemo(() => {
      return Object.values(assignments);
    }, [assignments]);

    // Player map for quick lookup
    const playerMap = useMemo(() => {
      const map: Record<string, FormationPlayer> = {};
      players.forEach((p) => {
        map[p.id] = p;
      });
      return map;
    }, [players]);

    // Notify parent when assignments change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (onFormationChange) {
        const data: FormationData = {
          formationName,
          format,
          assignments: Object.entries(assignments).map(([slotId, playerId]) => ({
            slotId,
            playerId,
          })),
        };
        onFormationChange(data);
      }
      // Only trigger when actual data changes, not when callback reference changes
    }, [assignments, formationName, format]);

    // Reset assignments when formation changes
    useEffect(() => {
      // When formation changes, we might need to remap slots
      // For now, keep existing assignments if slot IDs match
      if (formation) {
        const validSlotIds = new Set(formation.slots.map((s) => s.id));
        setAssignments((prev) => {
          const filtered: Record<string, string> = {};
          Object.entries(prev).forEach(([slotId, playerId]) => {
            if (validSlotIds.has(slotId)) {
              filtered[slotId] = playerId;
            }
          });
          return filtered;
        });
      }
    }, [formation]);

    // Get formation data
    const getFormationData = useCallback((): FormationData => {
      return {
        formationName,
        format,
        assignments: Object.entries(assignments).map(([slotId, playerId]) => ({
          slotId,
          playerId,
        })),
      };
    }, [assignments, formationName, format]);

    // Reset formation
    const resetFormation = useCallback(() => {
      setAssignments({});
      setSelectedPlayerId(null);
      setSelectedSlotId(null);
    }, []);

    // Set assignments programmatically
    const setAssignmentsFromData = useCallback((newAssignments: SlotAssignment[]) => {
      const mapped: Record<string, string> = {};
      newAssignments.forEach((a) => {
        mapped[a.slotId] = a.playerId;
      });
      setAssignments(mapped);
    }, []);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getFormationData,
        resetFormation,
        setAssignments: setAssignmentsFromData,
      }),
      [getFormationData, resetFormation, setAssignmentsFromData]
    );

    // Handle player selection from bench
    const handlePlayerSelect = useCallback((player: FormationPlayer) => {
      console.log('[FormationField] Player selected from bench:', player.id, player.name);
      if (selectedPlayerId === player.id) {
        // Deselect if already selected
        console.log('[FormationField] Deselecting player');
        setSelectedPlayerId(null);
      } else {
        // Select this player
        console.log('[FormationField] Selecting player', player.id);
        setSelectedPlayerId(player.id);
        setSelectedSlotId(null); // Clear slot selection
      }
    }, [selectedPlayerId]);

    // Handle slot press
    const handleSlotPress = useCallback((slot: FormationSlot) => {
      console.log('[FormationField] Slot pressed:', slot.id, 'selectedPlayerId:', selectedPlayerId);
      const currentPlayerId = assignments[slot.id];
      
      if (selectedPlayerId) {
        // A bench player is selected - assign to this slot (NO role restriction)
        console.log('[FormationField] Assigning player', selectedPlayerId, 'to slot', slot.id);
        setAssignments((prev) => {
          const newAssignments = { ...prev };
          
          // Remove the player from any existing slot
          Object.entries(newAssignments).forEach(([slotId, playerId]) => {
            if (playerId === selectedPlayerId) {
              delete newAssignments[slotId];
            }
          });
          
          // If slot already has a player, move them to bench (just remove from assignments)
          // The bench will automatically show them
          
          // Assign selected player to this slot
          newAssignments[slot.id] = selectedPlayerId;
          
          console.log('[FormationField] New assignments:', newAssignments);
          return newAssignments;
        });
        
        setSelectedPlayerId(null);
        setSelectedSlotId(null);
      } else if (currentPlayerId) {
        // Slot has a player - either show info or select for swapping
        if (selectedSlotId === slot.id) {
          // Deselect
          setSelectedSlotId(null);
        } else if (selectedSlotId) {
          // Swap players between slots
          setAssignments((prev) => {
            const newAssignments = { ...prev };
            const player1 = prev[selectedSlotId];
            const player2 = prev[slot.id];
            
            if (player1 && player2) {
              newAssignments[selectedSlotId] = player2;
              newAssignments[slot.id] = player1;
            } else if (player1) {
              delete newAssignments[selectedSlotId];
              newAssignments[slot.id] = player1;
            } else if (player2) {
              delete newAssignments[slot.id];
              newAssignments[selectedSlotId] = player2;
            }
            
            return newAssignments;
          });
          setSelectedSlotId(null);
        } else {
          // Select this slot for potential swap
          setSelectedSlotId(slot.id);
          
          // Also trigger onPlayerPress if provided
          if (onPlayerPress && currentPlayerId) {
            const player = playerMap[currentPlayerId];
            if (player) {
              onPlayerPress(player, slot.id);
            }
          }
        }
      } else {
        // Empty slot, no player selected - just clear selections
        setSelectedSlotId(null);
      }
    }, [assignments, selectedPlayerId, selectedSlotId, onPlayerPress, playerMap]);

    // Remove player from slot (move back to bench)
    const handleRemoveFromSlot = useCallback((slotId: string) => {
      setAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[slotId];
        return newAssignments;
      });
      setSelectedSlotId(null);
    }, []);

    // Debug log
    console.log('[FormationField] Render - editable:', editable, 'selectedPlayerId:', selectedPlayerId, 'formation:', formation?.name);

    if (!formation) {
      return (
        <View style={[styles.container, style]}>
          <ThemedText variant="secondary">
            Đội hình không hợp lệ
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={style}>
        {/* Field with slots */}
        <View style={styles.fieldContainer}>
          {/* Background: Field Image wrapped to disable touch */}
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <Image
              source={require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png')}
              style={styles.fieldImage}
              resizeMode="cover"
            />
          </View>

          {/* Formation slots - pointerEvents="box-none" passes touches to children */}
          <View 
            style={[styles.slotsContainer, { zIndex: 10 }]} 
            pointerEvents="box-none"
            onTouchStart={() => console.log('[FormationField] Touch on slotsContainer')}
          >
            {formation.slots.map((slot) => {
              const playerId = assignments[slot.id];
              const player = playerId ? playerMap[playerId] : null;
              const isSlotSelected = selectedSlotId === slot.id;
              const isDropTarget = selectedPlayerId !== null;
              
              // Check if the selected player's role matches this slot's line
              const isValidDrop = selectedPlayerId 
                ? (() => {
                    const selectedPlayer = playerMap[selectedPlayerId];
                    if (!selectedPlayer?.role) return true; // No role restriction
                    return selectedPlayer.role === slot.line;
                  })()
                : true;

              return (
                <FormationSlotComponent
                  key={slot.id}
                  slot={slot}
                  player={player}
                  isSelected={isSlotSelected}
                  isDropTarget={isDropTarget}
                  isValidDrop={isValidDrop}
                  onPress={handleSlotPress}
                  editable={editable}
                  size={44}
                />
              );
            })}
          </View>

          {/* Formation name overlay */}
          <View style={styles.formationLabel}>
            <ThemedText size="xs" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {formationName}
            </ThemedText>
          </View>
        </View>

        {/* Player bench */}
        {showBench && (
          <PlayerBench
            players={players}
            assignedPlayerIds={assignedPlayerIds}
            selectedPlayerId={selectedPlayerId}
            onPlayerSelect={handlePlayerSelect}
            editable={editable}
            title="Ghế dự bị"
          />
        )}

        {/* Edit mode hints */}
        {editable && selectedSlotId && (
          <View style={styles.editHint}>
            <ThemedText size="xs" variant="secondary" style={{ textAlign: 'center' }}>
              Chọn vị trí khác để hoán đổi, hoặc chạm lại để bỏ chọn
            </ThemedText>
          </View>
        )}
      </View>
    );
  }
);

FormationField.displayName = 'FormationField';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fieldContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  fieldImage: {
    width: '100%',
    height: '100%',
  },
  slotsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  formationLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editHint: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

// Re-export utility functions
export { getFormationNames };

export default FormationField;

