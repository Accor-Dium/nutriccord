import type { Food, HouseholdPortion } from '@/types/nutrition';

/**
 * Catálogo local de alimentos clasificados por grupo SMAE.
 * Valores aproximados por 100 g (tablas de composición de uso común); la porción de
 * 1 equivalente se eligió para aproximar el aporte promedio del grupo (Tabla 2 del SMAE).
 * TODO: reemplazar por las listas completas del SMAE (ver CLAUDE.md).
 */

const pieza = (grams: number): HouseholdPortion => ({ unit: 'pieza', unitPlural: 'piezas', grams });
const taza = (grams: number): HouseholdPortion => ({ unit: 'taza', unitPlural: 'tazas', grams });
const rebanada = (grams: number): HouseholdPortion => ({ unit: 'rebanada', unitPlural: 'rebanadas', grams });
const cdta = (grams: number): HouseholdPortion => ({ unit: 'cucharadita', unitPlural: 'cucharaditas', grams });
const cda = (grams: number): HouseholdPortion => ({ unit: 'cucharada', unitPlural: 'cucharadas', grams });
const vaso = (grams: number): HouseholdPortion => ({ unit: 'vaso', unitPlural: 'vasos', grams });

type Row = [
  id: string,
  name: string,
  group: Food['smaeGroup'],
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  portion: HouseholdPortion,
  equivalentGrams: number,
  equivalentLabel: string,
];

const ROWS: Row[] = [
  // Cereales y tubérculos — sin grasa
  ['tortilla-maiz', 'Tortilla de maíz', 'cereals_no_fat', 218, 5.7, 44.6, 2.9, pieza(30), 30, '1 pieza (30 g)'],
  ['tostada-horneada', 'Tostada horneada', 'cereals_no_fat', 380, 8, 75, 5, pieza(12), 24, '2 piezas (24 g)'],
  ['arroz-cocido', 'Arroz blanco cocido', 'cereals_no_fat', 130, 2.7, 28, 0.3, taza(200), 50, '¼ taza (50 g)'],
  ['pan-integral', 'Pan integral de caja', 'cereals_no_fat', 247, 13, 41, 3.4, rebanada(30), 30, '1 rebanada (30 g)'],
  ['avena', 'Avena en hojuelas', 'cereals_no_fat', 389, 16.9, 66, 6.9, cda(7), 20, '3 cucharadas (20 g)'],
  ['papa-cocida', 'Papa cocida', 'cereals_no_fat', 87, 1.9, 20, 0.1, pieza(150), 85, '½ pieza (85 g)'],
  ['pasta-cocida', 'Pasta cocida', 'cereals_no_fat', 158, 5.8, 31, 0.9, taza(140), 45, '⅓ taza (45 g)'],
  ['elote', 'Elote cocido', 'cereals_no_fat', 96, 3.4, 21, 1.5, pieza(140), 70, '½ pieza (70 g)'],
  // Cereales — con grasa
  ['tortilla-harina', 'Tortilla de harina', 'cereals_with_fat', 304, 8.2, 50, 7.8, pieza(40), 40, '1 pieza (40 g)'],
  ['pan-dulce', 'Pan dulce (concha)', 'cereals_with_fat', 380, 8, 55, 14, pieza(60), 30, '½ pieza (30 g)'],
  ['galletas-maria', 'Galletas María', 'cereals_with_fat', 440, 7, 74, 12, pieza(6), 25, '4 piezas (25 g)'],
  // Verduras
  ['nopales', 'Nopales cocidos', 'vegetables', 16, 1.3, 3.3, 0.1, taza(150), 150, '1 taza (150 g)'],
  ['jitomate', 'Jitomate', 'vegetables', 18, 0.9, 3.9, 0.2, pieza(120), 120, '1 pieza (120 g)'],
  ['brocoli', 'Brócoli cocido', 'vegetables', 35, 2.4, 7.2, 0.4, taza(156), 78, '½ taza (78 g)'],
  ['zanahoria', 'Zanahoria', 'vegetables', 41, 0.9, 9.6, 0.2, pieza(70), 70, '1 pieza mediana (70 g)'],
  ['lechuga', 'Lechuga', 'vegetables', 15, 1.4, 2.9, 0.2, taza(50), 150, '3 tazas (150 g)'],
  ['calabacita', 'Calabacita cocida', 'vegetables', 17, 1.2, 3.1, 0.3, pieza(120), 120, '1 pieza (120 g)'],
  ['espinaca', 'Espinaca cocida', 'vegetables', 23, 3, 3.8, 0.3, taza(180), 90, '½ taza (90 g)'],
  // Frutas
  ['manzana', 'Manzana', 'fruits', 52, 0.3, 13.8, 0.2, pieza(110), 110, '1 pieza chica (110 g)'],
  ['platano', 'Plátano', 'fruits', 89, 1.1, 23, 0.3, pieza(120), 60, '½ pieza (60 g)'],
  ['papaya', 'Papaya picada', 'fruits', 43, 0.5, 11, 0.3, taza(140), 140, '1 taza (140 g)'],
  ['naranja', 'Naranja', 'fruits', 47, 0.9, 12, 0.1, pieza(130), 130, '1 pieza (130 g)'],
  ['fresas', 'Fresas', 'fruits', 32, 0.7, 7.7, 0.3, taza(150), 180, '1¼ taza (180 g)'],
  ['mango', 'Mango', 'fruits', 60, 0.8, 15, 0.4, pieza(200), 100, '½ pieza (100 g)'],
  ['sandia', 'Sandía picada', 'fruits', 30, 0.6, 7.6, 0.2, taza(150), 200, '1⅓ taza (200 g)'],
  // Leguminosas
  ['frijoles', 'Frijoles de olla', 'legumes', 132, 8.9, 23.7, 0.5, taza(170), 90, '½ taza (90 g)'],
  ['lentejas', 'Lentejas cocidas', 'legumes', 116, 9, 20, 0.4, taza(200), 100, '½ taza (100 g)'],
  ['garbanzos', 'Garbanzos cocidos', 'legumes', 164, 8.9, 27, 2.6, taza(160), 80, '½ taza (80 g)'],
  // Alimentos de origen animal
  ['pechuga-pollo', 'Pechuga de pollo asada', 'animal_very_low_fat', 165, 31, 0, 3.6, pieza(120), 30, '30 g'],
  ['atun-agua', 'Atún en agua (drenado)', 'animal_very_low_fat', 116, 26, 0, 0.8, { unit: 'lata', unitPlural: 'latas', grams: 100 }, 30, '30 g'],
  ['clara-huevo', 'Clara de huevo', 'animal_very_low_fat', 52, 11, 0.7, 0.2, pieza(33), 66, '2 piezas (66 g)'],
  ['tilapia', 'Filete de pescado (tilapia)', 'animal_very_low_fat', 128, 26, 0, 2.7, pieza(120), 30, '30 g'],
  ['jamon-pavo', 'Jamón de pavo', 'animal_very_low_fat', 104, 17, 2, 3, rebanada(20), 40, '2 rebanadas (40 g)'],
  ['bistec-res', 'Bistec de res asado', 'animal_low_fat', 200, 28, 0, 9.5, pieza(100), 30, '30 g'],
  ['queso-panela', 'Queso panela', 'animal_moderate_fat', 230, 18, 2, 16, rebanada(30), 30, '30 g'],
  ['huevo', 'Huevo entero', 'animal_moderate_fat', 155, 13, 1.1, 11, pieza(50), 50, '1 pieza (50 g)'],
  ['queso-oaxaca', 'Queso Oaxaca', 'animal_high_fat', 300, 25, 2, 22, rebanada(30), 30, '30 g'],
  ['chorizo', 'Chorizo', 'animal_high_fat', 455, 24, 2, 38, pieza(60), 20, '20 g'],
  // Leche
  ['leche-descremada', 'Leche descremada', 'milk_skim', 34, 3.4, 5, 0.1, taza(240), 240, '1 taza (240 ml)'],
  ['leche-entera', 'Leche entera', 'milk_whole', 61, 3.2, 4.8, 3.3, taza(240), 240, '1 taza (240 ml)'],
  ['yogur-griego', 'Yogur griego natural', 'milk_whole', 97, 9, 4, 5, { unit: 'envase', unitPlural: 'envases', grams: 150 }, 150, '1 envase (150 g)'],
  // Aceites y grasas
  ['aceite', 'Aceite vegetal', 'fats_no_protein', 884, 0, 0, 100, cdta(5), 5, '1 cucharadita (5 ml)'],
  ['aguacate', 'Aguacate', 'fats_no_protein', 160, 2, 8.5, 15, pieza(150), 30, '⅓ pieza (30 g)'],
  ['mantequilla', 'Mantequilla', 'fats_no_protein', 717, 0.9, 0.1, 81, cdta(5), 5, '1 cucharadita (5 g)'],
  ['almendras', 'Almendras', 'fats_with_protein', 579, 21, 22, 50, pieza(1.2), 12, '10 piezas (12 g)'],
  ['cacahuates', 'Cacahuates', 'fats_with_protein', 567, 26, 16, 49, pieza(1), 14, '14 piezas (14 g)'],
  ['crema-cacahuate', 'Crema de cacahuate', 'fats_with_protein', 588, 25, 20, 50, cda(16), 12, '2 cucharaditas (12 g)'],
  // Azúcares
  ['azucar', 'Azúcar', 'sugars_no_fat', 387, 0, 100, 0, cdta(4), 10, '2½ cucharaditas (10 g)'],
  ['miel', 'Miel', 'sugars_no_fat', 304, 0.3, 82, 0, cdta(7), 14, '2 cucharaditas (14 g)'],
  ['agua-jamaica', 'Agua de jamaica (poca azúcar)', 'sugars_no_fat', 15, 0, 3.8, 0, vaso(240), 240, '1 vaso (240 ml)'],
  ['refresco', 'Refresco de cola', 'sugars_no_fat', 42, 0, 10.6, 0, vaso(240), 100, '100 ml'],
  ['chocolate', 'Chocolate con leche', 'sugars_with_fat', 535, 7.7, 59, 30, pieza(40), 16, '16 g'],
  // Libres y bebidas alcohólicas
  ['cafe-negro', 'Café negro', 'free_foods', 1, 0.1, 0, 0, taza(240), 240, '1 taza'],
  ['cerveza', 'Cerveza', 'alcohol', 43, 0.5, 3.6, 0, { unit: 'lata', unitPlural: 'latas', grams: 355 }, 355, '1 lata (355 ml)'],
];

export const FOODS: Food[] = ROWS.map(
  ([id, name, smaeGroup, kcal, protein, carbs, fat, portion, equivalentGrams, equivalentLabel]) => ({
    id,
    name,
    smaeGroup,
    kcalPer100g: kcal,
    macrosPer100g: { protein, carbs, fat },
    portion,
    equivalentGrams,
    equivalentLabel,
  }),
);

export const FOODS_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

/** Quita acentos y pasa a minúsculas para buscar sin importar ortografía. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function searchFoods(query: string): Food[] {
  const q = normalizeText(query);
  if (!q) return FOODS;
  return FOODS.filter((food) => normalizeText(food.name).includes(q));
}
