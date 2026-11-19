import type { ActivityTypeId, Intensity } from '@/types/nutrition';

export interface ActivityType {
  id: ActivityTypeId;
  label: string;
  /** Valores MET para intensidad ligera, moderada e intensa (Compendium of Physical Activities). */
  mets: [number, number, number];
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { id: 'walk', label: 'Caminar', mets: [3.0, 3.5, 5.0] },
  { id: 'run', label: 'Correr', mets: [7.0, 9.8, 11.5] },
  { id: 'bike', label: 'Bicicleta', mets: [4.0, 6.8, 10.0] },
  { id: 'strength', label: 'Fuerza', mets: [3.0, 4.0, 6.0] },
  { id: 'swim', label: 'Natación', mets: [5.8, 7.0, 9.8] },
  { id: 'yoga', label: 'Yoga', mets: [2.0, 2.5, 4.0] },
];

export const ACTIVITY_TYPES_BY_ID = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t.id, t])) as Record<
  ActivityTypeId,
  ActivityType
>;

export const INTENSITY_LABELS: Record<Intensity, string> = { 0: 'Ligera', 1: 'Moderada', 2: 'Intensa' };

/** kcal quemadas = MET × peso (kg) × minutos ÷ 60. */
export function activityKcal(met: number, weightKg: number, minutes: number): number {
  return Math.round((met * weightKg * minutes) / 60);
}
