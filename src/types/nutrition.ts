/** Tipos de dominio de Nutriccord. */

export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
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

/** Alimento con valores nutrimentales por cada 100 g. */
export interface Food {
  id: string;
  name: string;
  kcalPer100g: number;
  macrosPer100g: Macros;
}

/** Registro de un alimento consumido. */
export interface FoodEntry {
  id: string;
  foodId: string;
  grams: number;
  meal: MealType;
  date: string; // ISO yyyy-mm-dd
}
