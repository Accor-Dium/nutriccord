/**
 * Sistema Mexicano de Alimentos Equivalentes (SMAE), 5a ed. — Pérez Lizaur et al.
 * Tabla 2: "Aporte nutrimental promedio de los Grupos en el Sistema de Equivalentes".
 * Valores por 1 equivalente. Ver CLAUDE.md > "Sistema de equivalentes (SMAE)".
 */

export type SmaeGroupId =
  | 'vegetables'
  | 'fruits'
  | 'cereals_no_fat'
  | 'cereals_with_fat'
  | 'legumes'
  | 'animal_very_low_fat'
  | 'animal_low_fat'
  | 'animal_moderate_fat'
  | 'animal_high_fat'
  | 'milk_skim'
  | 'milk_semi_skim'
  | 'milk_whole'
  | 'milk_with_sugar'
  | 'fats_no_protein'
  | 'fats_with_protein'
  | 'sugars_no_fat'
  | 'sugars_with_fat'
  | 'free_foods'
  | 'alcohol';

export interface SmaeGroup {
  id: SmaeGroupId;
  group: string; // nombre del grupo (UI, español)
  subgroup?: string;
  kcal: number;
  protein: number; // g
  fat: number; // g (lípidos)
  carbs: number; // g (hidratos de carbono)
  alcohol?: number; // g de etanol
  carbCount: number; // conteo de hidratos de carbono (raciones de 15 g)
}

export const SMAE_GROUPS: SmaeGroup[] = [
  { id: 'vegetables', group: 'Verduras', kcal: 25, protein: 2, fat: 0, carbs: 4, carbCount: 0.3 },
  { id: 'fruits', group: 'Frutas', kcal: 60, protein: 0, fat: 0, carbs: 15, carbCount: 1 },
  { id: 'cereals_no_fat', group: 'Cereales y tubérculos', subgroup: 'Sin grasa', kcal: 70, protein: 2, fat: 0, carbs: 15, carbCount: 1 },
  { id: 'cereals_with_fat', group: 'Cereales y tubérculos', subgroup: 'Con grasa', kcal: 115, protein: 2, fat: 5, carbs: 15, carbCount: 1 },
  { id: 'legumes', group: 'Leguminosas', kcal: 120, protein: 8, fat: 1, carbs: 20, carbCount: 1.3 },
  { id: 'animal_very_low_fat', group: 'Alimentos de origen animal', subgroup: 'Muy bajo aporte de grasa', kcal: 40, protein: 7, fat: 1, carbs: 0, carbCount: 0 },
  { id: 'animal_low_fat', group: 'Alimentos de origen animal', subgroup: 'Bajo aporte de grasa', kcal: 55, protein: 7, fat: 3, carbs: 0, carbCount: 0 },
  { id: 'animal_moderate_fat', group: 'Alimentos de origen animal', subgroup: 'Moderado aporte de grasa', kcal: 75, protein: 7, fat: 5, carbs: 0, carbCount: 0 },
  { id: 'animal_high_fat', group: 'Alimentos de origen animal', subgroup: 'Alto aporte de grasa', kcal: 100, protein: 7, fat: 8, carbs: 0, carbCount: 0 },
  { id: 'milk_skim', group: 'Leche', subgroup: 'Descremada', kcal: 95, protein: 9, fat: 2, carbs: 12, carbCount: 0.8 },
  { id: 'milk_semi_skim', group: 'Leche', subgroup: 'Semidescremada', kcal: 110, protein: 9, fat: 4, carbs: 12, carbCount: 0.8 },
  { id: 'milk_whole', group: 'Leche', subgroup: 'Entera', kcal: 150, protein: 9, fat: 8, carbs: 12, carbCount: 0.8 },
  { id: 'milk_with_sugar', group: 'Leche', subgroup: 'Con azúcar', kcal: 200, protein: 8, fat: 5, carbs: 30, carbCount: 2 },
  { id: 'fats_no_protein', group: 'Aceites y grasas', subgroup: 'Sin proteína', kcal: 45, protein: 0, fat: 5, carbs: 0, carbCount: 0 },
  { id: 'fats_with_protein', group: 'Aceites y grasas', subgroup: 'Con proteína', kcal: 70, protein: 3, fat: 5, carbs: 3, carbCount: 0.2 },
  { id: 'sugars_no_fat', group: 'Azúcares', subgroup: 'Sin grasa', kcal: 40, protein: 0, fat: 0, carbs: 10, carbCount: 0.7 },
  { id: 'sugars_with_fat', group: 'Azúcares', subgroup: 'Con grasa', kcal: 85, protein: 0, fat: 5, carbs: 10, carbCount: 0.7 },
  { id: 'free_foods', group: 'Alimentos libres en energía', kcal: 0, protein: 0, fat: 0, carbs: 0, carbCount: 0 },
  { id: 'alcohol', group: 'Bebidas alcohólicas', kcal: 140, protein: 0, fat: 0, carbs: 0, alcohol: 20, carbCount: 1.3 },
];

export const SMAE_GROUPS_BY_ID = Object.fromEntries(SMAE_GROUPS.map((g) => [g.id, g])) as Record<
  SmaeGroupId,
  SmaeGroup
>;
