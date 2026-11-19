/** Tipos de dominio de Nutriccord. */
import type { SmaeGroupId } from '@/data/smae';

export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

/** Tiempos de comida, en el orden en que se muestran. */
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface UserProfile {
  name: string;
  sex: Sex;
  age: number; // años
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

/** Macronutrientes en gramos. */
export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

/** Medida casera de un alimento (pieza, taza, rebanada, cucharada…). */
export interface HouseholdPortion {
  /** Nombre en singular, p. ej. "pieza", "taza". */
  unit: string;
  /** Plural, p. ej. "piezas", "tazas". */
  unitPlural: string;
  grams: number;
}

/** Alimento del catálogo con valores nutrimentales por cada 100 g. */
export interface Food {
  id: string;
  name: string;
  smaeGroup: SmaeGroupId;
  kcalPer100g: number;
  macrosPer100g: Macros;
  portion: HouseholdPortion;
  /** Gramos que equivalen a 1 equivalente SMAE de su grupo. */
  equivalentGrams: number;
  /** Descripción casera de 1 equivalente, p. ej. "1 pieza (30 g)". */
  equivalentLabel: string;
}

/** Unidad en la que el usuario captura la cantidad. */
export type AmountUnit = 'portion' | 'grams' | 'equivalent';

/** Registro de un alimento consumido. */
export interface FoodEntry {
  id: string;
  foodId: string;
  grams: number;
  /** Cantidad y unidad tal como se capturaron (para mostrarlas igual). */
  amount: number;
  unit: AmountUnit;
  meal: MealType;
  date: string; // ISO yyyy-mm-dd (hora local)
  createdAt: string; // ISO completo
}

export type ActivityTypeId = 'walk' | 'run' | 'bike' | 'strength' | 'swim' | 'yoga';

export type Intensity = 0 | 1 | 2; // ligera, moderada, intensa

/** Registro de actividad física. */
export interface ActivityEntry {
  id: string;
  type: ActivityTypeId;
  intensity: Intensity;
  minutes: number;
  kcal: number;
  date: string; // ISO yyyy-mm-dd
  createdAt: string;
}

/** Registro de peso corporal (uno por día). */
export interface WeightEntry {
  date: string; // ISO yyyy-mm-dd
  kg: number;
}
