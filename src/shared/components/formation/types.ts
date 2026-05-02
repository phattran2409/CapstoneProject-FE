/**
 * Formation Slot System - Type Definitions
 * 
 * Core principles:
 * - NO free-form drag on field
 * - Slot-based formation (like football games)
 * - Save position by Slot ID, NOT coordinates
 * - UI is just a way to render Formation data
 */

/** Position line on the field */
export type PositionLine = 'GK' | 'DF' | 'MF' | 'FW';

/** Formation slot - a fixed position on the field */
export interface FormationSlot {
  /** Unique slot identifier (e.g., "GK-0", "DF-1", "MF-0") */
  id: string;
  /** Position line */
  line: PositionLine;
  /** Index within the line (0-based) */
  index: number;
  /** Display label for the slot */
  label: string;
  /** Position on field as percentage (for UI rendering only) */
  position: { x: string; y: string };
}

/** Player data for formation */
export interface FormationPlayer {
  id: string;
  name: string;
  avatar?: {uri: string};
  /** Preferred/registered role for this match */
  role?: PositionLine;
  /** Is this player the captain? */
  isCaptain?: boolean;
}

/** Assignment of a player to a slot */
export interface SlotAssignment {
  slotId: string;
  playerId: string;
}

/** Formation configuration */
export interface FormationConfig {
  /** Formation name (e.g., "3-1", "4-2", "3-2-1") */
  name: string;
  /** Format (5vs5, 7vs7) */
  format: '5vs5' | '7vs7' | '11vs11';
  /** Slots in this formation */
  slots: FormationSlot[];
}

/** Data to send to server */
export interface FormationData {
  /** Formation name */
  formationName: string;
  /** Format */
  format: string;
  /** All slot assignments */
  assignments: SlotAssignment[];
}

/** Methods exposed via ref */
export interface FormationFieldRef {
  /** Get current formation data */
  getFormationData: () => FormationData;
  /** Reset all assignments */
  resetFormation: () => void;
  /** Set assignments programmatically */
  setAssignments: (assignments: SlotAssignment[]) => void;
}

// ================== Formation Configurations ==================
//
// Số slot cho từng đội hình (vd 3-3: DF=3, MF=0, FW=3) được định nghĩa ở ĐÂY (FE).
// - FE: bắt buộc có để render UI (ô vị trí, dropdown). Dùng getFormation() / getSlotsCountByLine().
// - BE: nên lưu bản tương đương (formationName + format → danh sách slotId hợp lệ) để validate
//   PUT /formation: assignments chỉ chứa đúng slotId của formation đó, đủ/đúng số lượng.
//

/** 5vs5 Formation Configurations */
export const FORMATIONS_5VS5: FormationConfig[] = [
  {
    name: '3-1',
    format: '5vs5',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '30%', y: '65%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '50%', y: '60%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '70%', y: '65%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '35%' } },
    ],
  },
  {
    name: '2-2',
    format: '5vs5',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '30%', y: '65%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '70%', y: '65%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '35%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '65%', y: '35%' } },
    ],
  },
  {
    name: '2-1-1',
    format: '5vs5',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '30%', y: '65%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '70%', y: '65%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '50%', y: '50%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '30%' } },
    ],
  },
  {
    name: '1-2-1',
    format: '5vs5',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '50%', y: '68%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '35%', y: '50%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '65%', y: '50%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '30%' } },
    ],
  },
  {
    name: '1-3',
    format: '5vs5',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '50%', y: '65%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '25%', y: '40%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '50%', y: '30%' } },
      { id: 'FW-2', line: 'FW', index: 2, label: 'FW', position: { x: '75%', y: '40%' } },
    ],
  },
];

/** 7vs7 Formation Configurations */
export const FORMATIONS_7VS7: FormationConfig[] = [
  {
    name: '3-3',
    format: '7vs7',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '25%', y: '65%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '50%', y: '65%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '75%', y: '65%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '25%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '50%', y: '35%' } },
      { id: 'FW-2', line: 'FW', index: 2, label: 'FW', position: { x: '75%', y: '35%' } },
    ],
  },
  {
    name: '4-2',
    format: '7vs7',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '15%', y: '65%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '38%', y: '65%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '62%', y: '65%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '85%', y: '65%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '35%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '65%', y: '35%' } },
    ],
  },
  {
    name: '3-2-1',
    format: '7vs7',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '25%', y: '68%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '50%', y: '68%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '75%', y: '68%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '35%', y: '50%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '65%', y: '50%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '28%' } },
    ],
  },
  {
    name: '3-1-2',
    format: '7vs7',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '25%', y: '68%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '50%', y: '68%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '75%', y: '68%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '50%', y: '50%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '35%', y: '30%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '65%', y: '30%' } },
    ],
  },
  {
    name: '2-3-1',
    format: '7vs7',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '35%', y: '68%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '65%', y: '68%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '25%', y: '50%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '50%', y: '50%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '75%', y: '50%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '28%' } },
    ],
  },
  {
    name: '4-1-1',
    format: '7vs7',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '85%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '15%', y: '68%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '38%', y: '68%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '62%', y: '68%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '85%', y: '68%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '50%', y: '50%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '28%' } },
    ],
  },
];

export const FORMATIONS_11VS11: FormationConfig[] = [
  {
    name: '4-4-2',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '20%', y: '75%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '40%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '60%', y: '75%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '80%', y: '75%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '20%', y: '55%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '40%', y: '55%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '60%', y: '55%' } },
      { id: 'MF-3', line: 'MF', index: 3, label: 'MF', position: { x: '80%', y: '55%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '35%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '65%', y: '35%' } },
    ],
  },
  {
    name: '4-3-3',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '20%', y: '75%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '40%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '60%', y: '75%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '80%', y: '75%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '30%', y: '55%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '50%', y: '50%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '70%', y: '55%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '25%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '50%', y: '30%' } },
      { id: 'FW-2', line: 'FW', index: 2, label: 'FW', position: { x: '75%', y: '35%' } },
    ],
  },
  {
    name: '3-5-2',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '30%', y: '78%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '50%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '70%', y: '78%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '15%', y: '58%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '35%', y: '55%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '50%', y: '52%' } },
      { id: 'MF-3', line: 'MF', index: 3, label: 'MF', position: { x: '65%', y: '55%' } },
      { id: 'MF-4', line: 'MF', index: 4, label: 'MF', position: { x: '85%', y: '58%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '40%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '60%', y: '35%' } },
    ],
  },
  {
    name: '4-2-3-1',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '20%', y: '75%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '40%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '60%', y: '75%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '80%', y: '75%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '35%', y: '60%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '65%', y: '60%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '25%', y: '45%' } },
      { id: 'MF-3', line: 'MF', index: 3, label: 'MF', position: { x: '50%', y: '42%' } },
      { id: 'MF-4', line: 'MF', index: 4, label: 'MF', position: { x: '75%', y: '45%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '30%' } },
    ],
  },
  {
    name: '5-3-2',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '10%', y: '78%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '30%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '50%', y: '78%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '70%', y: '75%' } },
      { id: 'DF-4', line: 'DF', index: 4, label: 'DF', position: { x: '90%', y: '78%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '30%', y: '58%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '50%', y: '55%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '70%', y: '58%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '40%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '60%', y: '35%' } },
    ],
  },
  {
    name: '3-4-3',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '30%', y: '78%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '50%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '70%', y: '78%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '20%', y: '58%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '40%', y: '55%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '60%', y: '55%' } },
      { id: 'MF-3', line: 'MF', index: 3, label: 'MF', position: { x: '80%', y: '58%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '25%', y: '35%' } },
      { id: 'FW-1', line: 'FW', index: 1, label: 'FW', position: { x: '50%', y: '30%' } },
      { id: 'FW-2', line: 'FW', index: 2, label: 'FW', position: { x: '75%', y: '35%' } },
    ],
  },
  {
    name: '4-5-1',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '20%', y: '75%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '40%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '60%', y: '75%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '80%', y: '75%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '15%', y: '58%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '35%', y: '55%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '50%', y: '52%' } },
      { id: 'MF-3', line: 'MF', index: 3, label: 'MF', position: { x: '65%', y: '55%' } },
      { id: 'MF-4', line: 'MF', index: 4, label: 'MF', position: { x: '85%', y: '58%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '30%' } },
    ],
  },
  {
    name: '5-4-1',
    format: '11vs11',
    slots: [
      { id: 'GK-0', line: 'GK', index: 0, label: 'GK', position: { x: '50%', y: '90%' } },
      { id: 'DF-0', line: 'DF', index: 0, label: 'DF', position: { x: '10%', y: '78%' } },
      { id: 'DF-1', line: 'DF', index: 1, label: 'DF', position: { x: '30%', y: '75%' } },
      { id: 'DF-2', line: 'DF', index: 2, label: 'DF', position: { x: '50%', y: '78%' } },
      { id: 'DF-3', line: 'DF', index: 3, label: 'DF', position: { x: '70%', y: '75%' } },
      { id: 'DF-4', line: 'DF', index: 4, label: 'DF', position: { x: '90%', y: '78%' } },
      { id: 'MF-0', line: 'MF', index: 0, label: 'MF', position: { x: '25%', y: '58%' } },
      { id: 'MF-1', line: 'MF', index: 1, label: 'MF', position: { x: '45%', y: '55%' } },
      { id: 'MF-2', line: 'MF', index: 2, label: 'MF', position: { x: '65%', y: '55%' } },
      { id: 'MF-3', line: 'MF', index: 3, label: 'MF', position: { x: '85%', y: '58%' } },
      { id: 'FW-0', line: 'FW', index: 0, label: 'FW', position: { x: '50%', y: '30%' } },
    ],
  },
];

/** Get formation configurations by format */
export const getFormationsByFormat = (format: string): FormationConfig[] => {
  if (format === '5vs5') return FORMATIONS_5VS5;
  if (format === '7vs7') return FORMATIONS_7VS7;
  if (format === '11vs11') return FORMATIONS_11VS11;
  return [];
};

/** Get formation by name and format */
export const getFormation = (format: string, name: string): FormationConfig | undefined => {
  const formations = getFormationsByFormat(format);
  return formations.find((f) => f.name === name);
};

/** Get available formation names by format */
export const getFormationNames = (format: string): string[] => {
  return getFormationsByFormat(format).map((f) => f.name);
};

/**
 * Số slot theo từng line (GK, DF, MF, FW) của một đội hình.
 * Dùng cho hiển thị hoặc validate. Nguồn truth: FE config (BE nên có bản copy để validate API).
 */
export const getSlotsCountByLine = (
  config: FormationConfig | undefined,
): Record<PositionLine, number> => {
  const initial: Record<PositionLine, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  if (!config?.slots?.length) return initial;
  for (const slot of config.slots) {
    initial[slot.line] = (initial[slot.line] ?? 0) + 1;
  }
  return initial;
};
