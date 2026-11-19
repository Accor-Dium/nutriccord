import { formatHalves } from '@/lib/equivalents';
import type { AmountUnit, Food, MealType } from '@/types/nutrition';

export const MEALS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Comida' },
  { id: 'snack', label: 'Colación' },
  { id: 'dinner', label: 'Cena' },
];

export const MEAL_LABELS = Object.fromEntries(MEALS.map((m) => [m.id, m.label])) as Record<MealType, string>;

export function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && value in MEAL_LABELS;
}

/** Tiempo de comida sugerido según la hora actual. */
export function suggestedMeal(date = new Date()): MealType {
  const h = date.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 19) return 'snack';
  return 'dinner';
}

/** Texto de cantidad: "2 piezas · 60 g", "120 g", "1½ equivalentes · 60 g". */
export function formatAmount(food: Food, amount: number, unit: AmountUnit, grams: number): string {
  const g = `${Math.round(grams)} g`;
  if (unit === 'grams') return g;
  const qty = formatHalves(amount);
  if (unit === 'portion') {
    return `${qty} ${amount === 1 ? food.portion.unit : food.portion.unitPlural} · ${g}`;
  }
  return `${qty} ${amount === 1 ? 'equivalente' : 'equivalentes'} · ${g}`;
}
