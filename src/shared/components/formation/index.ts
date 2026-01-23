/**
 * Formation System - Slot-based Formation UI
 * 
 * Usage:
 * - FormationField: Main component for displaying and editing formations
 * - FormationSlot: Individual slot component
 * - PlayerBench: Bench/unassigned players component
 * 
 * Core principles:
 * - Slot-based positioning (no free-form drag)
 * - Positions stored by Slot ID, not coordinates
 * - Tap-to-select interaction model for mobile
 */

export { default as FormationField } from './FormationField';
export { getFormationNames } from './FormationField';

export { default as FormationSlot } from './FormationSlot';
export { default as PlayerBench } from './PlayerBench';

export * from './types';




