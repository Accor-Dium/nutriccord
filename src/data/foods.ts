import type { Food, FoodEntry, UserProfile } from '@/types/nutrition';

/**
 * Catálogo semilla de alimentos (valores aproximados por 100 g).
 * TODO: reemplazar por base de datos local / API de alimentos.
 */
export const FOODS: Food[] = [
  { id: 'huevo', name: 'Huevo entero', kcalPer100g: 155, macrosPer100g: { protein: 13, carbs: 1.1, fat: 11 } },
  { id: 'pechuga-pollo', name: 'Pechuga de pollo cocida', kcalPer100g: 165, macrosPer100g: { protein: 31, carbs: 0, fat: 3.6 } },
  { id: 'arroz-blanco', name: 'Arroz blanco cocido', kcalPer100g: 130, macrosPer100g: { protein: 2.7, carbs: 28, fat: 0.3 } },
  { id: 'tortilla-maiz', name: 'Tortilla de maíz', kcalPer100g: 218, macrosPer100g: { protein: 5.7, carbs: 45, fat: 2.9 } },
  { id: 'frijol-negro', name: 'Frijol negro cocido', kcalPer100g: 132, macrosPer100g: { protein: 8.9, carbs: 24, fat: 0.5 } },
  { id: 'aguacate', name: 'Aguacate', kcalPer100g: 160, macrosPer100g: { protein: 2, carbs: 8.5, fat: 15 } },
  { id: 'avena', name: 'Avena en hojuelas', kcalPer100g: 389, macrosPer100g: { protein: 16.9, carbs: 66, fat: 6.9 } },
  { id: 'platano', name: 'Plátano', kcalPer100g: 89, macrosPer100g: { protein: 1.1, carbs: 23, fat: 0.3 } },
  { id: 'manzana', name: 'Manzana', kcalPer100g: 52, macrosPer100g: { protein: 0.3, carbs: 14, fat: 0.2 } },
  { id: 'leche-entera', name: 'Leche entera', kcalPer100g: 61, macrosPer100g: { protein: 3.2, carbs: 4.8, fat: 3.3 } },
];

export const FOODS_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

/** Perfil de ejemplo mientras no exista onboarding ni persistencia. */
export const MOCK_PROFILE: UserProfile = {
  sex: 'male',
  age: 28,
  weightKg: 75,
  heightCm: 175,
  activityLevel: 'moderate',
  goal: 'maintain',
};

/** Registros de ejemplo para la pantalla "Hoy". */
export const MOCK_ENTRIES: FoodEntry[] = [
  { id: '1', foodId: 'avena', grams: 60, meal: 'breakfast', date: '2026-11-18' },
  { id: '2', foodId: 'platano', grams: 120, meal: 'breakfast', date: '2026-11-18' },
  { id: '3', foodId: 'pechuga-pollo', grams: 150, meal: 'lunch', date: '2026-11-18' },
  { id: '4', foodId: 'arroz-blanco', grams: 180, meal: 'lunch', date: '2026-11-18' },
  { id: '5', foodId: 'aguacate', grams: 50, meal: 'lunch', date: '2026-11-18' },
];
