import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Card, PrimaryButton, Row, Screen } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { FontFamily, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWeek, type WeekDay } from '@/hooks/use-week';
import { MACRO_SPLIT, macroEnergyShare } from '@/lib/calories';
import {
  addDays,
  formatNumber,
  formatRange,
  formatShortDate,
  formatSigned,
  formatWeekdayDay,
  todayISO,
  weekdayLetter,
} from '@/lib/dates';
import { PLAN_GROUPS } from '@/lib/equivalents';
import { actions, useAppState } from '@/store/app-store';

export default function ProgressScreen() {
  const theme = useTheme();
  const week = useWeek(7);
  const { days, avgBalance, totalBurned, activeDays } = week;
  const first = days[0].date;
  const last = days[days.length - 1].date;

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Text variant="small" color="textSecondary">
          {formatRange(first, last)}
        </Text>
        <Text variant="display" accessibilityRole="header">
          Progreso
        </Text>
      </View>

      <Row style={{ alignItems: 'stretch' }}>
        <Card style={[styles.kpi]}>
          <Text variant="captionSemibold" color="textSecondary">
            Balance promedio
          </Text>
          <Text variant="number" style={{ fontSize: 26 }}>
            {avgBalance === null ? '—' : formatSigned(avgBalance)}
          </Text>
          <Text variant="caption" color="textSecondary">
            kcal/día vs. meta
          </Text>
        </Card>
        <Card style={[styles.kpi, { backgroundColor: theme.activitySoft }]}>
          <Text variant="captionSemibold" color="activityStrong">
            Ejercicio semanal
          </Text>
          <Text variant="number" color="activityStrong" style={{ fontSize: 26 }}>
            {formatNumber(totalBurned)}
          </Text>
          <Text variant="caption" color="activityStrong">
            kcal · {activeDays} de 7 días activos
          </Text>
        </Card>
      </Row>

      <CaloriesChart days={days} />
      <WeightCard />
      <MacroCard days={days} />
      <SmaeCard days={days} />
    </Screen>
  );
}

function CaloriesChart({ days }: { days: WeekDay[] }) {
  const theme = useTheme();
  const [selected, setSelected] = useState(days.length - 1);
  const goal = days[days.length - 1].goalKcal;
  const max = Math.max(goal * 1.22, ...days.map((d) => d.eaten));
  const H = 150;
  const sel = days[selected];
  const diff = sel.net - sel.goalKcal;

  return (
    <Card accessibilityLabel="Calorías por día" style={{ gap: 14 }}>
      <View>
        <Text variant="heading">Calorías por día</Text>
        <Text variant="caption" color="textSecondary">
          Toca un día para ver el detalle
        </Text>
      </View>
      <Row style={{ gap: Spacing.four, flexWrap: 'wrap' }}>
        <Legend color="primary" label="Neto" />
        <Legend color="activityBar" label="Quemado" />
        <Legend color="textMuted" label={`Meta ${formatNumber(goal)}`} dashed />
      </Row>

      <View style={{ height: H + 22, flexDirection: 'row', gap: 4 }}>
        <View
          style={[styles.goalLine, { bottom: 22 + (goal / max) * H, borderColor: theme.textMuted }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        {days.map((d, i) => {
          const on = i === selected;
          const netH = Math.max(0, (d.net / max) * H);
          const burnH = (d.burned / max) * H;
          return (
            <Pressable
              key={d.date}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${d.isToday ? 'Hoy' : formatWeekdayDay(d.date)}: neto ${formatNumber(d.net)} kcal`}
              onPress={() => setSelected(i)}
              style={[styles.col, on && { backgroundColor: theme.divider }]}>
              <View
                style={{
                  width: 24,
                  height: burnH,
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  backgroundColor: theme.activityBar,
                  opacity: d.isToday ? 0.6 : 1,
                }}
              />
              <View
                style={{
                  width: 24,
                  height: netH,
                  borderTopLeftRadius: burnH ? 0 : 5,
                  borderTopRightRadius: burnH ? 0 : 5,
                  backgroundColor: d.isToday ? theme.primaryMuted : d.net > d.goalKcal ? theme.over : theme.primary,
                }}
              />
              <Text
                variant="captionSemibold"
                color={on ? 'text' : 'textSecondary'}
                style={{ height: 22, lineHeight: 22, fontFamily: on ? FontFamily.bold : FontFamily.semibold }}>
                {d.isToday ? 'Hoy' : weekdayLetter(d.date)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.detail, { backgroundColor: theme.background }]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="bodyBold">{sel.isToday ? 'Hoy (en curso)' : formatWeekdayDay(sel.date)}</Text>
          <Text
            variant="label"
            color={sel.isToday || !sel.hasData ? 'textSecondary' : diff > 0 ? 'overText' : 'primary'}>
            {!sel.hasData
              ? 'Sin registros'
              : sel.isToday
                ? `quedan ${formatNumber(sel.remaining)} kcal`
                : `${formatSigned(diff)} vs. meta`}
          </Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <DetailItem label="Comido" value={`${formatNumber(sel.eaten)} kcal`} />
          <DetailItem label="Quemado" value={`${formatNumber(sel.burned)} kcal`} />
          <DetailItem label="Neto" value={`${formatNumber(sel.net)} kcal`} />
        </Row>
      </View>
    </Card>
  );
}

function Legend({ color, label, dashed }: { color: ThemeColor; label: string; dashed?: boolean }) {
  const theme = useTheme();
  return (
    <Row style={{ gap: 6 }}>
      {dashed ? (
        <View style={{ width: 14, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: theme[color] }} />
      ) : (
        <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: theme[color] }} />
      )}
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    </Row>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Text variant="bodyBold">{value}</Text>
    </View>
  );
}

function WeightCard() {
  const theme = useTheme();
  const { weights, profile } = useAppState();
  const today = todayISO();
  const from = addDays(today, -27);
  const recent = weights.filter((w) => w.date >= from);
  const latest = weights[weights.length - 1];
  const delta = recent.length >= 2 ? recent[recent.length - 1].kg - recent[0].kg : null;
  const [input, setInput] = useState('');
  const parsed = Number(input.replace(',', '.'));
  const valid = input.trim() !== '' && parsed >= 30 && parsed <= 300;

  const W = 310;
  const Hc = 90;
  const kgs = recent.map((w) => w.kg);
  const minKg = Math.min(...kgs) - 0.5;
  const maxKg = Math.max(...kgs) + 0.5;
  const points = recent.map((w, i) => ({
    x: recent.length === 1 ? W / 2 : 12 + (i * (W - 24)) / (recent.length - 1),
    y: 10 + (1 - (w.kg - minKg) / (maxKg - minKg)) * (Hc - 30),
  }));

  return (
    <Card accessibilityLabel="Peso" style={{ gap: 14 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text variant="heading">Peso</Text>
          <Text variant="caption" color="textSecondary">
            Últimas 4 semanas
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="numberSm">{formatNumber1(latest?.kg ?? profile.weightKg)} kg</Text>
          {delta !== null && (
            <Text variant="label" color={delta <= 0 ? 'primary' : 'overText'}>
              {delta > 0 ? '+' : delta < 0 ? '−' : ''}
              {formatNumber1(Math.abs(delta))} kg
            </Text>
          )}
        </View>
      </Row>

      {recent.length === 0 ? (
        <Text variant="small" color="textSecondary">
          Registra tu peso para ver tu tendencia.
        </Text>
      ) : (
        <>
          <Svg
            width="100%"
            height={Hc}
            viewBox={`0 0 ${W} ${Hc}`}
            accessibilityLabel={`Peso: ${recent.map((w) => `${formatShortDate(w.date)} ${formatNumber1(w.kg)} kg`).join(', ')}`}>
            <Line x1={0} y1={Hc - 10} x2={W} y2={Hc - 10} stroke={theme.divider} strokeWidth={1} />
            {points.length > 1 && (
              <Polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={theme.primary}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map((p, i) =>
              i === points.length - 1 ? (
                <Circle key={i} cx={p.x} cy={p.y} r={5} fill={theme.primary} />
              ) : (
                <Circle key={i} cx={p.x} cy={p.y} r={4} fill={theme.surface} stroke={theme.primary} strokeWidth={2} />
              ),
            )}
          </Svg>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="caption" color="textSecondary">
              {formatShortDate(recent[0].date)} · {formatNumber1(recent[0].kg)}
            </Text>
            {recent.length > 1 && (
              <Text variant="caption" color="textSecondary">
                {recent[recent.length - 1].date === today ? 'Hoy' : formatShortDate(recent[recent.length - 1].date)} ·{' '}
                {formatNumber1(recent[recent.length - 1].kg)}
              </Text>
            )}
          </Row>
        </>
      )}

      <Row>
        <TextInput
          value={input}
          onChangeText={setInput}
          inputMode="decimal"
          keyboardType="decimal-pad"
          placeholder={`Peso de hoy (kg), ej. ${formatNumber1(latest?.kg ?? profile.weightKg)}`}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Peso de hoy en kilogramos"
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
          ]}
        />
      </Row>
      <PrimaryButton
        label="Registrar peso de hoy"
        disabled={!valid}
        onPress={() => {
          actions.logWeight(today, Math.round(parsed * 10) / 10);
          setInput('');
        }}
      />
    </Card>
  );
}

function MacroCard({ days }: { days: WeekDay[] }) {
  const theme = useTheme();
  const withFood = days.filter((d) => d.entries.length > 0);
  const total = withFood.reduce(
    (acc, d) => ({
      protein: acc.protein + d.macros.protein,
      carbs: acc.carbs + d.macros.carbs,
      fat: acc.fat + d.macros.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
  const share = macroEnergyShare(total);
  const items: { key: keyof typeof share; label: string; color: ThemeColor }[] = [
    { key: 'protein', label: 'Proteína', color: 'protein' },
    { key: 'carbs', label: 'Carbs', color: 'carbs' },
    { key: 'fat', label: 'Grasa', color: 'fat' },
  ];

  return (
    <Card accessibilityLabel="Distribución de macros" style={{ gap: 14 }}>
      <Text variant="heading">Distribución promedio de macros</Text>
      {withFood.length === 0 ? (
        <Text variant="small" color="textSecondary">
          Registra alimentos para ver tu distribución.
        </Text>
      ) : (
        <>
          <View style={[styles.stack, { backgroundColor: theme.divider }]}>
            {items.map((it) => (
              <View key={it.key} style={{ flex: share[it.key], backgroundColor: theme[it.color] }} />
            ))}
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            {items.map((it) => (
              <View key={it.key}>
                <Text variant="body">
                  <Text variant="bodyBold" color={it.color}>
                    {Math.round(share[it.key] * 100)}%
                  </Text>{' '}
                  {it.label}
                </Text>
                <Text variant="caption" color="textSecondary">
                  meta {Math.round(MACRO_SPLIT[it.key] * 100)}%
                </Text>
              </View>
            ))}
          </Row>
        </>
      )}
    </Card>
  );
}

function SmaeCard({ days }: { days: WeekDay[] }) {
  const withFood = days.filter((d) => d.entries.length > 0);
  const adherence = PLAN_GROUPS.map((g) => {
    const ratios = withFood.map((d) => Math.min(1, d.equivalents[g.id] / d.equivalentGoals[g.id]));
    const avg = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
    return { ...g, avg };
  });
  const overall = adherence.reduce((t, g) => t + g.avg, 0) / adherence.length;
  const lowest = [...adherence].sort((a, b) => a.avg - b.avg)[0];

  return (
    <Card tone="primarySoft" accessibilityLabel="Plan SMAE" style={{ gap: Spacing.two }}>
      <Text variant="heading" color="primaryStrong">
        Plan SMAE
      </Text>
      {withFood.length === 0 ? (
        <Text variant="body" color="primaryStrong">
          Cuando registres alimentos verás qué tanto cumples tu plan de equivalentes.
        </Text>
      ) : (
        <Text variant="body" color="primaryStrong">
          Cumpliste en promedio el <Text variant="bodyBold" color="primaryStrong">{Math.round(overall * 100)}%</Text> de
          tus equivalentes en {withFood.length} {withFood.length === 1 ? 'día' : 'días'}. El grupo con menos avance es{' '}
          <Text variant="bodyBold" color="primaryStrong">{lowest.label.toLowerCase()}</Text> (
          {Math.round(lowest.avg * 100)}%).
        </Text>
      )}
    </Card>
  );
}

const formatNumber1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

const styles = StyleSheet.create({
  kpi: {
    flex: 1,
    padding: Spacing.four,
    gap: 2,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 8,
  },
  detail: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  stack: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
});
