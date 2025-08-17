/**
 * Personalization utilities for VCoin
 * 
 * Handles personalization preferences for students to provide inclusive
 * naming conventions without explicitly exposing gender identification.
 * 
 * Preferences:
 * - null: "No definido" (not defined) - uses default names
 * - 'A': Feminine variant names (when available)
 * - 'O': Masculine variant names (when available)
 */

import type { Achievement } from '@/types/database';

export type PersonalizacionPreference = 'A' | 'O' | null;

export interface PersonalizacionOption {
  value: PersonalizacionPreference;
  label: string;
  description: string;
}

/**
 * Available personalization options for the UI
 */
export const PERSONALIZACION_OPTIONS: PersonalizacionOption[] = [
  {
    value: null,
    label: 'No definido',
    description: 'Usar nombres por defecto'
  },
  {
    value: 'A',
    label: 'Personalización A',
    description: 'Usar variante A cuando esté disponible'
  },
  {
    value: 'O',
    label: 'Personalización O',
    description: 'Usar variante O cuando esté disponible'
  }
];

/**
 * Gets the personalized name for an achievement based on student preference
 * 
 * @param achievement - The achievement object
 * @param studentPersonalizacion - Student's personalization preference
 * @returns The appropriate name based on preference and availability
 */
export function getPersonalizedAchievementName(
  achievement: Achievement, 
  studentPersonalizacion: PersonalizacionPreference
): string {
  // If no personalization preference is set, use default name
  if (!studentPersonalizacion) {
    return achievement.name;
  }

  // Check if personalized variant exists and is not empty
  if (studentPersonalizacion === 'A' && achievement.name_a) {
    return achievement.name_a;
  }

  if (studentPersonalizacion === 'O' && achievement.name_o) {
    return achievement.name_o;
  }

  // Fallback to default name if personalized variant is not available
  return achievement.name;
}

/**
 * Gets the personalized name for any text content based on student preference
 * This utility can be extended for future personalization needs beyond achievements
 * 
 * @param defaultText - The default text
 * @param textA - Optional feminine variant text
 * @param textO - Optional masculine variant text
 * @param studentPersonalizacion - Student's personalization preference
 * @returns The appropriate text based on preference and availability
 */
export function getPersonalizedText(
  defaultText: string,
  textA: string | null | undefined,
  textO: string | null | undefined,
  studentPersonalizacion: PersonalizacionPreference
): string {
  // If no personalization preference is set, use default text
  if (!studentPersonalizacion) {
    return defaultText;
  }

  // Check if personalized variant exists and is not empty
  if (studentPersonalizacion === 'A' && textA) {
    return textA;
  }

  if (studentPersonalizacion === 'O' && textO) {
    return textO;
  }

  // Fallback to default text if personalized variant is not available
  return defaultText;
}

/**
 * Validates a personalization preference value
 * 
 * @param value - The value to validate
 * @returns True if valid, false otherwise
 */
export function isValidPersonalizacionPreference(value: unknown): value is PersonalizacionPreference {
  return value === null || value === 'A' || value === 'O';
}

/**
 * Gets the display label for a personalization preference
 * 
 * @param preference - The personalization preference
 * @returns The display label
 */
export function getPersonalizacionLabel(preference: PersonalizacionPreference): string {
  const option = PERSONALIZACION_OPTIONS.find(opt => opt.value === preference);
  return option?.label || 'No definido';
}

/**
 * Gets the description for a personalization preference
 * 
 * @param preference - The personalization preference
 * @returns The description
 */
export function getPersonalizacionDescription(preference: PersonalizacionPreference): string {
  const option = PERSONALIZACION_OPTIONS.find(opt => opt.value === preference);
  return option?.description || 'Usar nombres por defecto';
}

/**
 * Creates an achievement with personalized name for display purposes
 * This is useful for components that need to show achievements with personalized names
 * 
 * @param achievement - The original achievement
 * @param studentPersonalizacion - Student's personalization preference
 * @returns Achievement object with personalized name
 */
export function createPersonalizedAchievement(
  achievement: Achievement,
  studentPersonalizacion: PersonalizacionPreference
): Achievement {
  return {
    ...achievement,
    name: getPersonalizedAchievementName(achievement, studentPersonalizacion)
  };
}

/**
 * Creates a list of achievements with personalized names for display purposes
 * 
 * @param achievements - The original achievements array
 * @param studentPersonalizacion - Student's personalization preference
 * @returns Array of achievements with personalized names
 */
export function createPersonalizedAchievements(
  achievements: Achievement[],
  studentPersonalizacion: PersonalizacionPreference
): Achievement[] {
  return achievements.map(achievement => 
    createPersonalizedAchievement(achievement, studentPersonalizacion)
  );
}
