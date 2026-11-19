import { useState } from 'react';
import { View } from 'react-native';

import { ActivityRow } from '@/components/activity-row';
import { Card, ChipGrid, PrimaryButton, Row, Screen, Segmented, Stepper } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useDaySummary } from '@/hooks/use-day-summary';
import { useTheme } from '@/hooks/use-theme';
import { ACTIVITY_TYPES, ACTIVITY_TYPES_BY_ID, INTENSITY_LABELS, activityKcal } from '@/lib/activity';
import { formatLongDate, formatNumber, todayISO } from '@/lib/dates';
import { actions, useAppState } from '@/store/app-store';
import type { ActivityTypeId, Intensity } from '@/types/nutrition';

export default function ActivityScreen() {
  const theme = useTheme();
  const { profile } = useAppState();
  const today = todayISO();
  const day = useDaySummary(today);

  const [type, setType] = useState<ActivityTypeId>('walk');
  const [intensity, setIntensity] = useState<Intensity>(1);
  const [minutes, setMinutes] = useState(30);
  const [saved, setSaved] = useState(false);

  const met = ACTIVITY_TYPES_BY_ID[type].mets[intensity];
  const kcal = activityKcal(met, profile.weightKg, minutes);

  const save = () => {
    actions.addActivity({ type, intensity, minutes, kcal, date: today });
    setSaved(true);
  };

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setSaved(false);
  };

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Text variant="small" color="textSecondary">
          {formatLongDate(today)}
        </Text>
        <Text variant="display" accessibilityRole="header">
          Actividad
        </Text>
      </View>

      <View style={{ gap: Spacing.two }}>
        <Text variant="label" color="textSecondary">
          ¿Qué hiciste?
        </Text>
        <ChipGrid
          accessibilityLabel="Tipo de actividad"
          options={ACTIVITY_TYPES.map((t) => ({ value: t.id, label: t.label }))}
          value={type}
          onChange={touch(setType)}
          columns={3}
          accent="activity"
        />
      </View>

      <Card accessibilityLabel="Detalles" style={{ gap: 18 }}>
        <View style={{ gap: Spacing.two }}>
          <Text variant="label" color="textSecondary">
            Intensidad
          </Text>
          <Segmented
            accessibilityLabel="Intensidad"
            options={([0, 1, 2] as Intensity[]).map((i) => ({ value: i, label: INTENSITY_LABELS[i] }))}
            value={intensity}
            onChange={touch(setIntensity)}
          />
        </View>

        <View style={{ gap: Spacing.two }}>
          <Text variant="label" color="textSecondary">
            Duración
          </Text>
          <Stepper
            value={String(minutes)}
            caption="minutos"
            accent="activity"
            decrementLabel="Restar 5 minutos"
            incrementLabel="Sumar 5 minutos"
            onDecrement={() => touch(setMinutes)(Math.max(5, minutes - 5))}
            onIncrement={() => touch(setMinutes)(Math.min(300, minutes + 5))}
          />
        </View>

        <View style={{ backgroundColor: theme.activitySoft, borderRadius: Radius.xl, padding: Spacing.four, gap: 6 }}>
          <Row style={{ alignItems: 'baseline', gap: 6 }}>
            <Text variant="numberLg" color="activityStrong">
              ≈ {formatNumber(kcal)}
            </Text>
            <Text variant="bodySemibold" color="activityStrong">
              kcal quemadas
            </Text>
          </Row>
          <Text variant="small" color="activityStrong">
            Te quedarán <Text variant="label" color="activityStrong">{formatNumber(day.remaining + (saved ? 0 : kcal))} kcal</Text>{' '}
            disponibles hoy{saved ? '' : ` (ahora ${formatNumber(day.remaining)})`}.
          </Text>
          <Text variant="caption" color="activityStrong">
            MET {met} × {profile.weightKg} kg × {minutes} min ÷ 60
          </Text>
        </View>

        <PrimaryButton
          color="activity"
          label={saved ? '✓ Actividad guardada' : 'Guardar actividad'}
          disabled={saved}
          onPress={save}
        />
      </Card>

      <Card accessibilityLabel="Registrado hoy" style={{ paddingVertical: Spacing.four, gap: 0 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 6 }}>
          <Text variant="heading">Registrado hoy</Text>
          <Text variant="label" color="activity">
            {formatNumber(day.burned)} kcal · {day.activeMinutes} min
          </Text>
        </Row>
        {day.activities.length === 0 ? (
          <Text variant="small" color="textSecondary" style={{ paddingVertical: Spacing.two }}>
            Sin actividades registradas.
          </Text>
        ) : (
          day.activities.map((a) => (
            <ActivityRow key={a.id} activity={a} divider onDelete={() => actions.removeActivity(a.id)} />
          ))
        )}
      </Card>
    </Screen>
  );
}
