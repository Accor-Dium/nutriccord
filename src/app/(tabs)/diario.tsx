import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icons';
import { Card, IconButton, ProgressBar, Row, Screen } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { FOODS_BY_ID } from '@/data/foods';
import { useDaySummary } from '@/hooks/use-day-summary';
import { useTheme } from '@/hooks/use-theme';
import { nutrientsForPortion } from '@/lib/calories';
import { dayOfMonth, formatMonthYear, formatNumber, formatTime, lastNDays, todayISO, weekdayLetter } from '@/lib/dates';
import { groupLabel } from '@/lib/equivalents';
import { MEALS, formatAmount } from '@/lib/meals';
import { actions } from '@/store/app-store';
import type { FoodEntry, MealType } from '@/types/nutrition';

export default function DiaryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const today = todayISO();
  const [date, setDate] = useState(today);
  const days = lastNDays(today, 7);
  const day = useDaySummary(date);

  const addTo = (meal: MealType) => router.push({ pathname: '/agregar', params: { meal, date } });

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Text variant="small" color="textSecondary">
          {formatMonthYear(date)}
        </Text>
        <Text variant="display" accessibilityRole="header">
          Diario
        </Text>
      </View>

      <View accessibilityRole="radiogroup" accessibilityLabel="Elegir día" style={styles.days}>
        {days.map((d) => {
          const on = d === date;
          return (
            <Pressable
              key={d}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={d === today ? 'Hoy' : `Día ${dayOfMonth(d)}`}
              onPress={() => setDate(d)}
              style={[
                styles.day,
                {
                  borderColor: on ? theme.primary : theme.border,
                  backgroundColor: on ? theme.primary : theme.surface,
                },
              ]}>
              <Text variant="tab" color={on ? 'onPrimary' : 'textSecondary'}>
                {d === today ? 'Hoy' : weekdayLetter(d)}
              </Text>
              <Text variant="bodyBold" color={on ? 'onPrimary' : 'text'} style={{ fontSize: 16 }}>
                {dayOfMonth(d)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card accessibilityLabel="Resumen del día" style={{ paddingVertical: Spacing.four, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="body" color="textSecondary">
            <Text variant="number" style={{ fontSize: 22 }}>
              {formatNumber(day.eaten)}
            </Text>{' '}
            / {formatNumber(day.goalKcal)} kcal
          </Text>
          {day.burned > 0 && (
            <Text variant="label" color="activity">
              +{formatNumber(day.burned)} ejercicio
            </Text>
          )}
        </Row>
        <ProgressBar value={day.eaten / (day.goalKcal + day.burned)} color="primary" track="primarySoft" />
        <Row style={{ gap: Spacing.four }}>
          <Text variant="caption" color="textSecondary">
            <Text variant="captionSemibold" color="protein">
              P
            </Text>{' '}
            {Math.round(day.macros.protein)} g
          </Text>
          <Text variant="caption" color="textSecondary">
            <Text variant="captionSemibold" color="carbsStrong">
              C
            </Text>{' '}
            {Math.round(day.macros.carbs)} g
          </Text>
          <Text variant="caption" color="textSecondary">
            <Text variant="captionSemibold" color="fat">
              G
            </Text>{' '}
            {Math.round(day.macros.fat)} g
          </Text>
        </Row>
      </Card>

      {MEALS.map((meal) => {
        const items = day.entries.filter((e) => e.meal === meal.id);
        return (
          <MealSection
            key={meal.id}
            label={meal.label}
            items={items}
            onAdd={() => addTo(meal.id)}
          />
        );
      })}
    </Screen>
  );
}

function MealSection({ label, items, onAdd }: { label: string; items: FoodEntry[]; onAdd: () => void }) {
  const theme = useTheme();
  const total = items.reduce((t, e) => {
    const food = FOODS_BY_ID[e.foodId];
    return food ? t + nutrientsForPortion(food, e.grams).kcal : t;
  }, 0);
  const firstTime = items.length ? formatTime(items[0].createdAt) : '';

  return (
    <Card style={{ paddingTop: Spacing.four, paddingBottom: Spacing.two, gap: 0 }} accessibilityLabel={label}>
      <Row style={{ paddingBottom: Spacing.two }}>
        <View style={{ flex: 1 }}>
          <Text variant="headingLg" accessibilityRole="header">
            {label}
          </Text>
          <Text variant="caption" color="textSecondary">
            {items.length ? `${firstTime} · ${items.length} ${items.length === 1 ? 'alimento' : 'alimentos'}` : 'Sin registros'}
          </Text>
        </View>
        {items.length > 0 && <Text variant="numberSm">{formatNumber(total)} kcal</Text>}
        <IconButton accessibilityLabel={`Agregar alimento a ${label}`} background="primarySoft" onPress={onAdd}>
          <Icon name="plus" size={20} color={theme.primary} strokeWidth={2.2} />
        </IconButton>
      </Row>

      {items.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAdd}
          style={({ pressed }) => [styles.empty, { borderColor: theme.dashed }, pressed && { opacity: 0.7 }]}>
          <Text variant="bodySemibold" color="primary">
            Aún no registras {label.toLowerCase()} · Agregar alimento
          </Text>
        </Pressable>
      ) : (
        items.map((entry) => <EntryRow key={entry.id} entry={entry} />)
      )}
    </Card>
  );
}

function EntryRow({ entry }: { entry: FoodEntry }) {
  const theme = useTheme();
  const food = FOODS_BY_ID[entry.foodId];
  if (!food) return null;
  const kcal = nutrientsForPortion(food, entry.grams).kcal;
  return (
    <Row style={[styles.entry, { borderTopColor: theme.divider }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodySemibold">{food.name}</Text>
        <Text variant="caption" color="textSecondary">
          {formatAmount(food, entry.amount, entry.unit, entry.grams)} ·{' '}
          <Text variant="captionSemibold" color="primary">
            {groupLabel(food.smaeGroup)}
          </Text>
        </Text>
      </View>
      <Text variant="bodySemibold">{formatNumber(kcal)} kcal</Text>
      <IconButton accessibilityLabel={`Eliminar ${food.name}`} size={36} onPress={() => actions.removeEntry(entry.id)}>
        <Icon name="trash" size={18} color={theme.textSecondary} />
      </IconButton>
    </Row>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    minHeight: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  entry: {
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  empty: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});
