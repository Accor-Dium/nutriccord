import type {
  ActivityEntry,
  ActivityLevel,
  AmountUnit,
  Food,
  FoodEntry,
  Goal,
  Macros,
  UserProfile,
} from '@/types/nutrition';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT_KCAL: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

/** Distribución de energía por macronutriente usada para las metas (25/45/30). */
export const MACRO_SPLIT: Macros = { protein: 0.25, carbs: 0.45, fat: 0.3 };

const KCAL_PER_GRAM: Macros = { protein: 4, carbs: 4, fat: 9 };

/** Tasa metabólica basal (Mifflin-St Jeor), en kcal/día. */
export function calculateBmr({ sex, age, weightKg, heightCm }: UserProfile): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/** Gasto energético total diario (TDEE), en kcal/día. */
export function calculateTdee(profile: UserProfile): number {
  return calculateBmr(profile) * ACTIVITY_FACTORS[profile.activityLevel];
}

/** Meta calórica diaria según el objetivo del usuario (redondeada a 10 kcal). */
export function calculateDailyGoal(profile: UserProfile): number {
  return Math.round((calculateTdee(profile) + GOAL_ADJUSTMENT_KCAL[profile.goal]) / 10) * 10;
}

/** Gramos de cada macro para una meta calórica. */
export function macroGoals(goalKcal: number): Macros {
  return {
    protein: Math.round((goalKcal * MACRO_SPLIT.protein) / KCAL_PER_GRAM.protein),
    carbs: Math.round((goalKcal * MACRO_SPLIT.carbs) / KCAL_PER_GRAM.carbs),
    fat: Math.round((goalKcal * MACRO_SPLIT.fat) / KCAL_PER_GRAM.fat),
  };
}

/** Porcentaje de energía que aporta cada macro (0–1). Ceros si no hay datos. */
export function macroEnergyShare(macros: Macros): Macros {
  const protein = macros.protein * KCAL_PER_GRAM.protein;
  const carbs = macros.carbs * KCAL_PER_GRAM.carbs;
  const fat = macros.fat * KCAL_PER_GRAM.fat;
  const total = protein + carbs + fat;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: protein / total, carbs: carbs / total, fat: fat / total };
}

/** Convierte una cantidad capturada (porción casera, gramos o equivalentes) a gramos. */
export function amountToGrams(food: Food, amount: number, unit: AmountUnit): number {
  if (unit === 'grams') return amount;
  if (unit === 'portion') return amount * food.portion.grams;
  return amount * food.equivalentGrams;
}

/** Calorías y macros de una porción en gramos. */
export function nutrientsForPortion(food: Food, grams: number): { kcal: number; macros: Macros } {
  const factor = grams / 100;
  return {
    kcal: food.kcalPer100g * factor,
    macros: {
      protein: food.macrosPer100g.protein * factor,
      carbs: food.macrosPer100g.carbs * factor,
      fat: food.macrosPer100g.fat * factor,
    },
  };
}

export interface DayTotals {
  kcal: number;
  macros: Macros;
}

/** Suma calorías y macros de una lista de registros. Ignora registros con alimento desconocido. */
export function sumEntries(entries: FoodEntry[], foodsById: Record<string, Food>): DayTotals {
  return entries.reduce<DayTotals>(
    (acc, entry) => {
      const food = foodsById[entry.foodId];
      if (!food) return acc;
      const { kcal, macros } = nutrientsForPortion(food, entry.grams);
      return {
        kcal: acc.kcal + kcal,
        macros: {
          protein: acc.macros.protein + macros.protein,
          carbs: acc.macros.carbs + macros.carbs,
          fat: acc.macros.fat + macros.fat,
        },
      };
    },
    { kcal: 0, macros: { protein: 0, carbs: 0, fat: 0 } },
  );
}

export function sumActivityKcal(activities: ActivityEntry[]): number {
  return activities.reduce((total, activity) => total + activity.kcal, 0);
}

/** Calorías disponibles: meta − comido + ejercicio. */
export function remainingKcal(goalKcal: number, eatenKcal: number, burnedKcal: number): number {
  return goalKcal - eatenKcal + burnedKcal;
}
