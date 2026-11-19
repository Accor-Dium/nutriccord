import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { FOODS_BY_ID, MOCK_ENTRIES, MOCK_PROFILE } from '@/data/foods';
import { useTheme } from '@/hooks/use-theme';
import { calculateDailyGoal, nutrientsForPortion, sumEntries } from '@/lib/calories';
import type { MealType } from '@/types/nutrition';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Colación',
};

export default function TodayScreen() {
  const theme = useTheme();
  const goal = calculateDailyGoal(MOCK_PROFILE);
  const totals = sumEntries(MOCK_ENTRIES, FOODS_BY_ID);
  const consumed = Math.round(totals.kcal);
  const remaining = goal - consumed;
  const progress = Math.min(consumed / goal, 1);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Hoy</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Calorías restantes
            </ThemedText>
            <ThemedText type="title">{remaining}</ThemedText>
            <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.accent }]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {consumed} consumidas · meta {goal} kcal
            </ThemedText>
          </ThemedView>

          <View style={styles.macrosRow}>
            <MacroTile label="Proteína" grams={totals.macros.protein} />
            <MacroTile label="Carbs" grams={totals.macros.carbs} />
            <MacroTile label="Grasa" grams={totals.macros.fat} />
          </View>

          <ThemedText type="smallBold">Registros</ThemedText>
          {MOCK_ENTRIES.map((entry) => {
            const food = FOODS_BY_ID[entry.foodId];
            if (!food) return null;
            const { kcal } = nutrientsForPortion(food, entry.grams);
            return (
              <ThemedView key={entry.id} type="backgroundElement" style={styles.entry}>
                <View style={styles.entryText}>
                  <ThemedText type="small">{food.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {MEAL_LABELS[entry.meal]} · {entry.grams} g
                  </ThemedText>
                </View>
                <ThemedText type="smallBold">{Math.round(kcal)} kcal</ThemedText>
              </ThemedView>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MacroTile({ label, grams }: { label: string; grams: number }) {
  return (
    <ThemedView type="backgroundElement" style={styles.macroTile}>
      <ThemedText type="smallBold">{Math.round(grams)} g</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroTile: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  entryText: {
    flex: 1,
  },
});
