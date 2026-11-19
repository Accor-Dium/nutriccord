import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActivityRow } from '@/components/activity-row';
import { CalorieRing } from '@/components/ui/calorie-ring';
import { Icon } from '@/components/ui/icons';
import { Card, IconButton, PrimaryButton, ProgressBar, Row, Screen, SectionHeader } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useDaySummary } from '@/hooks/use-day-summary';
import { useTheme } from '@/hooks/use-theme';
import { useWeek } from '@/hooks/use-week';
import { formatLongDate, formatNumber, formatSigned, todayISO, weekdayLetter } from '@/lib/dates';
import { PLAN_GROUPS, formatHalves } from '@/lib/equivalents';
import { useAppState } from '@/store/app-store';

export default function TodayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profileConfigured, profile } = useAppState();
  const today = todayISO();
  const day = useDaySummary(today);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text variant="small" color="textSecondary">
            {formatLongDate(today)}
          </Text>
          <Text variant="display" accessibilityRole="header">
            {profile.name ? `Hola, ${profile.name}` : 'Hoy'}
          </Text>
        </View>
        <IconButton
          accessibilityLabel="Perfil y metas"
          bordered
          background="surface"
          onPress={() => router.push('/perfil')}>
          <Icon name="user" size={22} color={theme.text} />
        </IconButton>
      </Row>

      {!profileConfigured && (
        <Card tone="primarySoft">
          <Text variant="heading" color="primaryStrong">
            Configura tu perfil
          </Text>
          <Text variant="body" color="primaryStrong">
            Con tu edad, peso, estatura y actividad calculamos tu meta de calorías y tu plan de
            equivalentes. Mientras tanto usamos valores de ejemplo.
          </Text>
          <PrimaryButton label="Configurar perfil" onPress={() => router.push('/perfil')} />
        </Card>
      )}

      {/* Calorías */}
      <Card accessibilityLabel="Calorías del día" style={{ gap: Spacing.four }}>
        <Row style={{ gap: Spacing.five }}>
          <CalorieRing eaten={day.eaten} available={day.goalKcal + day.burned} remaining={day.remaining} />
          <View style={{ flex: 1, gap: 14 }}>
            <Stat label="Meta" color="textSecondary" value={`${formatNumber(day.goalKcal)} kcal`} />
            <Stat label="Comido" color="primary" value={`${formatNumber(day.eaten)} kcal`} />
            <Stat label="Ejercicio" color="activity" value={`+${formatNumber(day.burned)} kcal`} />
          </View>
        </Row>
        <View style={{ borderTopWidth: 1, borderTopColor: theme.divider, paddingTop: Spacing.three }}>
          <Text variant="small" color="textSecondary">
            Restantes = meta − comido + ejercicio
          </Text>
        </View>
      </Card>

      {/* Macronutrientes */}
      <Card accessibilityLabel="Macronutrientes" style={{ gap: 14 }}>
        <Text variant="heading">Macronutrientes</Text>
        <MacroBar label="Proteína" value={day.macros.protein} goal={day.macroGoals.protein} color="protein" track="proteinSoft" />
        <MacroBar label="Carbohidratos" value={day.macros.carbs} goal={day.macroGoals.carbs} color="carbs" track="carbsSoft" />
        <MacroBar label="Grasa" value={day.macros.fat} goal={day.macroGoals.fat} color="fat" track="fatSoft" />
      </Card>

      {/* Actividad */}
      <Card accessibilityLabel="Actividad de hoy" style={{ gap: 14 }}>
        <SectionHeader
          title="Actividad de hoy"
          action={
            <Link href="/actividad" asChild>
              <Pressable accessibilityRole="link" style={styles.linkHit}>
                <Text variant="bodySemibold" color="activity">
                  + Registrar
                </Text>
              </Pressable>
            </Link>
          }
        />
        <Row>
          <View style={[styles.tile, { backgroundColor: theme.activitySoft }]}>
            <Text variant="number" color="activityStrong">
              {formatNumber(day.burned)}
            </Text>
            <Text variant="captionSemibold" color="activityStrong">
              kcal quemadas
            </Text>
          </View>
          <View style={[styles.tile, { backgroundColor: theme.background }]}>
            <Text variant="number">{day.activeMinutes}</Text>
            <Text variant="captionSemibold" color="textSecondary">
              minutos activos
            </Text>
          </View>
        </Row>
        {day.activities.length === 0 ? (
          <Text variant="small" color="textSecondary">
            Aún no registras actividad hoy.
          </Text>
        ) : (
          <View>
            {day.activities.map((a, i) => (
              <ActivityRow key={a.id} activity={a} divider={i > 0} />
            ))}
          </View>
        )}
      </Card>

      {/* Equivalentes SMAE */}
      <Card accessibilityLabel="Equivalentes SMAE del día" style={{ gap: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="heading">Equivalentes del día</Text>
          <Text variant="captionSemibold" color="textSecondary">
            Plan SMAE
          </Text>
        </Row>
        <View style={styles.grid}>
          {PLAN_GROUPS.map((g) => {
            const done = day.equivalents[g.id];
            const goal = day.equivalentGoals[g.id];
            return (
              <View key={g.id} style={styles.gridCell}>
                <Row style={{ justifyContent: 'space-between', gap: 4 }}>
                  <Text variant="label">{g.label}</Text>
                  <Text variant="small" color="textSecondary">
                    <Text variant="label">{formatHalves(done)}</Text> / {formatHalves(goal)}
                  </Text>
                </Row>
                <ProgressBar value={done / goal} color="primary" track="divider" height={6} />
              </View>
            );
          })}
        </View>
      </Card>

      <WeekCard />
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: ThemeColor }) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="overline" color={color}>
        {label}
      </Text>
      <Text variant="numberSm" style={{ fontSize: 18 }}>
        {value}
      </Text>
    </View>
  );
}

function MacroBar({
  label,
  value,
  goal,
  color,
  track,
}: {
  label: string;
  value: number;
  goal: number;
  color: ThemeColor;
  track: ThemeColor;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="bodySemibold">{label}</Text>
        <Text variant="body" color="textSecondary">
          <Text variant="bodyBold">{Math.round(value)}</Text> / {goal} g
        </Text>
      </Row>
      <ProgressBar value={value / goal} color={color} track={track} />
    </View>
  );
}

function WeekCard() {
  const theme = useTheme();
  const { days, avgBalance } = useWeek(7);
  const goal = days[days.length - 1].goalKcal;
  const max = Math.max(goal * 1.25, ...days.map((d) => d.eaten));
  const H = 96;

  return (
    <Card accessibilityLabel="Últimos 7 días" style={{ gap: 14 }}>
      <SectionHeader
        title="Últimos 7 días"
        action={
          <Link href="/progreso" asChild>
            <Pressable accessibilityRole="link" style={styles.linkHit}>
              <Text variant="bodySemibold" color="primary">
                Ver progreso
              </Text>
            </Pressable>
          </Link>
        }
      />
      <Row style={{ alignItems: 'baseline', gap: Spacing.two }}>
        <Text variant="number" style={{ fontSize: 26 }}>
          {avgBalance === null ? '—' : formatSigned(avgBalance)}
        </Text>
        <Text variant="small" color="textSecondary">
          {avgBalance === null ? 'registra varios días para ver tu promedio' : 'kcal/día promedio vs. meta'}
        </Text>
      </Row>
      <View style={{ height: H, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
        <View
          style={[styles.goalLine, { bottom: (goal / max) * H, borderColor: theme.textMuted }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        {days.map((d) => (
          <View key={d.date} style={styles.barCol}>
            <View
              style={{
                width: '100%',
                maxWidth: 28,
                height: Math.max(d.eaten > 0 ? 3 : 0, (d.eaten / max) * H),
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
                backgroundColor: d.isToday ? theme.primaryMuted : d.eaten > goal ? theme.over : theme.primary,
              }}
            />
          </View>
        ))}
      </View>
      <Row style={{ gap: 10 }}>
        {days.map((d) => (
          <Text key={d.date} variant="captionSemibold" color="textSecondary" style={{ flex: 1, textAlign: 'center' }}>
            {d.isToday ? 'Hoy' : weekdayLetter(d.date)}
          </Text>
        ))}
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  linkHit: { minHeight: 44, justifyContent: 'center' },
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: 14,
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
    columnGap: Spacing.four,
  },
  gridCell: {
    width: '46%',
    flexGrow: 1,
    gap: 6,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
  barCol: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
