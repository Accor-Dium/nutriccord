import { SMAE_GROUPS_BY_ID, type SmaeGroupId } from '@/data/smae';
import type { Food, FoodEntry } from '@/types/nutrition';

/** Grupos que se muestran en el plan diario (los subgrupos SMAE se agrupan). */
export type PlanGroupId =
  | 'cereals'
  | 'vegetables'
  | 'fruits'
  | 'animal'
  | 'legumes'
  | 'milk'
  | 'fats'
  | 'sugars';

export const PLAN_GROUPS: { id: PlanGroupId; label: string }[] = [
  { id: 'cereals', label: 'Cereales' },
  { id: 'vegetables', label: 'Verduras' },
  { id: 'fruits', label: 'Frutas' },
  { id: 'animal', label: 'Origen animal' },
  { id: 'legumes', label: 'Leguminosas' },
  { id: 'milk', label: 'Leche' },
  { id: 'fats', label: 'Grasas' },
  { id: 'sugars', label: 'Azúcares' },
];

const PLAN_GROUP_OF: Record<SmaeGroupId, PlanGroupId | null> = {
  cereals_no_fat: 'cereals',
  cereals_with_fat: 'cereals',
  vegetables: 'vegetables',
  fruits: 'fruits',
  legumes: 'legumes',
  animal_very_low_fat: 'animal',
  animal_low_fat: 'animal',
  animal_moderate_fat: 'animal',
  animal_high_fat: 'animal',
  milk_skim: 'milk',
  milk_semi_skim: 'milk',
  milk_whole: 'milk',
  milk_with_sugar: 'milk',
  fats_no_protein: 'fats',
  fats_with_protein: 'fats',
  sugars_no_fat: 'sugars',
  sugars_with_fat: 'sugars',
  free_foods: null,
  alcohol: null,
};

/** Etiqueta corta del grupo SMAE de un alimento (p. ej. "Cereales", "Libre"). */
export function groupLabel(groupId: SmaeGroupId): string {
  const plan = PLAN_GROUP_OF[groupId];
  if (plan) return PLAN_GROUPS.find((g) => g.id === plan)!.label;
  return groupId === 'alcohol' ? 'Alcohol' : 'Libre';
}

/** Etiqueta con subgrupo, p. ej. "Cereales · sin grasa". */
export function groupLabelLong(groupId: SmaeGroupId): string {
  const group = SMAE_GROUPS_BY_ID[groupId];
  return group.subgroup ? `${group.group} · ${group.subgroup.toLowerCase()}` : group.group;
}

/**
 * Plan base de equivalentes para ~1,880 kcal (distribución típica 25/45/30).
 * Se escala proporcionalmente a la meta calórica del usuario.
 */
const BASE_PLAN: Record<PlanGroupId, number> = {
  cereals: 7,
  vegetables: 4,
  fruits: 3,
  animal: 7,
  legumes: 2,
  milk: 2,
  fats: 5,
  sugars: 1,
};
const BASE_PLAN_KCAL = 1880;

const roundHalf = (n: number) => Math.round(n * 2) / 2;

/** Equivalentes objetivo por grupo para una meta calórica (redondeados a ½). */
export function equivalentGoals(goalKcal: number): Record<PlanGroupId, number> {
  const scale = goalKcal / BASE_PLAN_KCAL;
  const goals = {} as Record<PlanGroupId, number>;
  for (const { id } of PLAN_GROUPS) {
    goals[id] = Math.max(id === 'vegetables' ? 3 : 0.5, roundHalf(BASE_PLAN[id] * scale));
  }
  return goals;
}

/** Equivalentes consumidos por grupo (gramos ÷ gramos por equivalente). */
export function equivalentsConsumed(
  entries: FoodEntry[],
  foodsById: Record<string, Food>,
): Record<PlanGroupId, number> {
  const totals = Object.fromEntries(PLAN_GROUPS.map((g) => [g.id, 0])) as Record<PlanGroupId, number>;
  for (const entry of entries) {
    const food = foodsById[entry.foodId];
    if (!food) continue;
    const plan = PLAN_GROUP_OF[food.smaeGroup];
    if (plan) totals[plan] += entry.grams / food.equivalentGrams;
  }
  return totals;
}

/** Equivalentes de un registro, para mostrar junto al alimento. */
export function entryEquivalents(entry: FoodEntry, food: Food): number {
  return entry.grams / food.equivalentGrams;
}

/** Formatea cantidades con medios: 1.5 → "1½", 0.5 → "½", 2 → "2". */
export function formatHalves(value: number): string {
  const rounded = roundHalf(value);
  const whole = Math.floor(rounded);
  const half = rounded - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? '½' : `${whole}½`;
}
