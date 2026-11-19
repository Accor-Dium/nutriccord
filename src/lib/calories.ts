import type { ActivityLevel, Food, FoodEntry, Goal, Macros, UserProfile } from '@/types/nutrition';

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

/** Tasa metabólica basal (Mifflin-St Jeor), en kcal/día. */
export function calculateBmr({ sex, age, weightKg, heightCm }: UserProfile): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/** Gasto energético total diario (TDEE), en kcal/día. */
export function calculateTdee(profile: UserProfile): number {
  return calculateBmr(profile) * ACTIVITY_FACTORS[profile.activityLevel];
}

/** Meta calórica diaria según el objetivo del usuario. */
export function calculateDailyGoal(profile: UserProfile): number {
  return Math.round(calculateTdee(profile) + GOAL_ADJUSTMENT_KCAL[profile.goal]);
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

/** Suma calorías y macros de una lista de registros. Ignora registros con alimento desconocido. */
export function sumEntries(
  entries: FoodEntry[],
  foodsById: Record<string, Food>,
): { kcal: number; macros: Macros } {
  return entries.reduce(
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
