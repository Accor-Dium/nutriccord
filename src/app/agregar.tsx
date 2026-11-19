import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icons';
import { Card, ChipGrid, IconButton, PrimaryButton, Row, Screen, Segmented, Stepper } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { FontFamily, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { FOODS_BY_ID, searchFoods } from '@/data/foods';
import { useTheme } from '@/hooks/use-theme';
import { amountToGrams, nutrientsForPortion } from '@/lib/calories';
import { formatShortDate, todayISO } from '@/lib/dates';
import { formatHalves, groupLabelLong } from '@/lib/equivalents';
import { MEALS, MEAL_LABELS, isMealType, suggestedMeal } from '@/lib/meals';
import { actions } from '@/store/app-store';
import type { AmountUnit, Food, MealType } from '@/types/nutrition';

const MAX_RESULTS = 12;

const UNIT_STEP: Record<AmountUnit, number> = { portion: 0.5, grams: 10, equivalent: 0.5 };

function defaultAmount(food: Food, unit: AmountUnit): number {
  return unit === 'grams' ? Math.round(food.portion.grams) : 1;
}

export default function AddFoodScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const date = typeof params.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayISO();

  const [query, setQuery] = useState('');
  const [foodId, setFoodId] = useState<string | null>(null);
  const [unit, setUnit] = useState<AmountUnit>('portion');
  const [amount, setAmount] = useState(1);
  const [meal, setMeal] = useState<MealType>(isMealType(params.meal) ? params.meal : suggestedMeal());

  const results = searchFoods(query);
  const food = foodId ? FOODS_BY_ID[foodId] : null;

  const pick = (f: Food) => {
    setFoodId(f.id);
    setUnit('portion');
    setAmount(defaultAmount(f, 'portion'));
  };

  const changeUnit = (u: AmountUnit) => {
    setUnit(u);
    if (food) setAmount(defaultAmount(food, u));
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/diario'));

  const save = () => {
    if (!food) return;
    actions.addEntry({ foodId: food.id, grams: amountToGrams(food, amount, unit), amount, unit, meal, date });
    close();
  };

  return (
    <Screen withTabBar={false}>
      <Row style={{ gap: Spacing.two }}>
        <IconButton accessibilityLabel="Cerrar" onPress={close} style={{ marginLeft: -10 }}>
          <Icon name="back" size={22} color={theme.text} strokeWidth={2} />
        </IconButton>
        <View style={{ flex: 1 }}>
          <Text variant="title" accessibilityRole="header">
            Agregar alimento
          </Text>
          {date !== todayISO() && (
            <Text variant="caption" color="textSecondary">
              Para el {formatShortDate(date)}
            </Text>
          )}
        </View>
      </Row>

      <View style={{ gap: 6 }}>
        <Text variant="label" color="textSecondary" nativeID="buscar-label">
          Buscar en el catálogo SMAE
        </Text>
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
          <Icon name="search" size={20} color={theme.textSecondary} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ej. tortilla, frijoles, manzana"
            placeholderTextColor={theme.textMuted}
            accessibilityLabelledBy="buscar-label"
            accessibilityLabel="Buscar en el catálogo SMAE"
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
      </View>

      <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }} accessibilityLabel="Resultados">
        {results.length === 0 ? (
          <Text variant="body" color="textSecondary" style={{ padding: Spacing.five }}>
            Sin resultados. Prueba con otro nombre.
          </Text>
        ) : (
          results.slice(0, MAX_RESULTS).map((f, i) => {
            const on = f.id === foodId;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="radio"
                accessibilityLabel={`${f.name}, ${f.kcalPer100g} kcal por 100 gramos`}
                accessibilityState={{ selected: on }}
                onPress={() => pick(f)}
                style={({ pressed }) => [
                  styles.result,
                  {
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: theme.divider,
                    backgroundColor: on ? theme.primarySoft : pressed ? theme.surfaceMuted : theme.surface,
                    borderLeftWidth: 3,
                    borderLeftColor: on ? theme.primary : 'transparent',
                  },
                ]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="large">{f.name}</Text>
                  <Text variant="caption" color="textSecondary">
                    {groupLabelLong(f.smaeGroup)} · 1 {f.portion.unit} {Math.round(f.portion.grams)} g
                  </Text>
                </View>
                <Text variant="label" color="textSecondary">
                  {f.kcalPer100g} kcal/100 g
                </Text>
              </Pressable>
            );
          })
        )}
        {results.length > MAX_RESULTS && (
          <Text variant="caption" color="textSecondary" style={styles.more}>
            {results.length - MAX_RESULTS} alimentos más · escribe para filtrar
          </Text>
        )}
      </Card>

      {food ? (
        <AmountCard
          food={food}
          unit={unit}
          amount={amount}
          onUnit={changeUnit}
          onAmount={setAmount}
        />
      ) : (
        <Card tone="surfaceMuted">
          <Text variant="body" color="textSecondary">
            Elige un alimento de la lista para indicar la cantidad.
          </Text>
        </Card>
      )}

      <View style={{ gap: Spacing.two }}>
        <Text variant="label" color="textSecondary">
          Tiempo de comida
        </Text>
        <ChipGrid
          accessibilityLabel="Tiempo de comida"
          options={MEALS.map((m) => ({ value: m.id, label: m.label }))}
          value={meal}
          onChange={setMeal}
          columns={4}
        />
      </View>

      <PrimaryButton
        disabled={!food}
        onPress={save}
        label={
          food
            ? `Agregar a ${MEAL_LABELS[meal]} · ${Math.round(nutrientsForPortion(food, amountToGrams(food, amount, unit)).kcal)} kcal`
            : 'Elige un alimento'
        }
      />
    </Screen>
  );
}

function AmountCard({
  food,
  unit,
  amount,
  onUnit,
  onAmount,
}: {
  food: Food;
  unit: AmountUnit;
  amount: number;
  onUnit: (u: AmountUnit) => void;
  onAmount: (n: number) => void;
}) {
  const grams = amountToGrams(food, amount, unit);
  const { kcal, macros } = nutrientsForPortion(food, grams);
  const step = UNIT_STEP[unit];
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const portionLabel = food.portion.unitPlural.charAt(0).toUpperCase() + food.portion.unitPlural.slice(1);

  const caption =
    unit === 'grams'
      ? 'gramos'
      : unit === 'portion'
        ? `${amount === 1 ? food.portion.unit : food.portion.unitPlural} · ${Math.round(grams)} g`
        : `equivalentes SMAE · ${Math.round(grams)} g`;

  return (
    <Card accessibilityLabel="Cantidad" style={{ gap: Spacing.four }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text variant="heading" style={{ flex: 1 }}>
          {food.name}
        </Text>
        <Text variant="captionSemibold" color="primary">
          {groupLabelLong(food.smaeGroup)}
        </Text>
      </Row>

      <Segmented
        accessibilityLabel="Unidad"
        options={[
          { value: 'portion' as AmountUnit, label: portionLabel },
          { value: 'grams' as AmountUnit, label: 'Gramos' },
          { value: 'equivalent' as AmountUnit, label: 'Equivalentes' },
        ]}
        value={unit}
        onChange={onUnit}
      />

      <Stepper
        value={unit === 'grams' ? String(Math.round(amount)) : formatHalves(amount)}
        caption={caption}
        decrementLabel="Disminuir cantidad"
        incrementLabel="Aumentar cantidad"
        onDecrement={() => onAmount(Math.max(step, r1(amount - step)))}
        onIncrement={() => onAmount(r1(amount + step))}
      />

      <View style={styles.nutrients}>
        <Nutrient value={String(Math.round(kcal))} label="kcal" bg="primarySoft" fg="primaryStrong" />
        <Nutrient value={`${r1(macros.protein)} g`} label="Proteína" bg="proteinSoft" fg="proteinStrong" />
        <Nutrient value={`${r1(macros.carbs)} g`} label="Carbs" bg="carbsSoft" fg="carbsStrong" />
        <Nutrient value={`${r1(macros.fat)} g`} label="Grasa" bg="fatSoft" fg="fatStrong" />
      </View>
      <Text variant="caption" color="textSecondary">
        1 equivalente = {food.equivalentLabel} · valores calculados desde 100 g
      </Text>
    </Card>
  );
}

function Nutrient({ value, label, bg, fg }: { value: string; label: string; bg: ThemeColor; fg: ThemeColor }) {
  const theme = useTheme();
  return (
    <View style={[styles.nutrient, { backgroundColor: theme[bg] }]}>
      <Text variant="bodyBold" color={fg} style={{ fontSize: 16 }}>
        {value}
      </Text>
      <Text variant="tab" color={fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    minWidth: 0,
    height: '100%',
  },
  result: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 10,
    paddingHorizontal: Spacing.five,
  },
  more: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  nutrients: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  nutrient: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    gap: 2,
  },
});
