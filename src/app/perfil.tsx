import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icons';
import { Card, IconButton, PrimaryButton, Row, Screen, Segmented } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { calculateBmr, calculateDailyGoal, macroGoals } from '@/lib/calories';
import { formatNumber, todayISO } from '@/lib/dates';
import { actions, useAppState } from '@/store/app-store';
import type { ActivityLevel, Goal, Sex, UserProfile } from '@/types/nutrition';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentary', label: 'Sedentario', hint: 'Trabajo de escritorio, casi sin ejercicio' },
  { value: 'light', label: 'Ligero', hint: 'Ejercicio 1–3 días por semana' },
  { value: 'moderate', label: 'Moderado', hint: 'Ejercicio 3–5 días por semana' },
  { value: 'active', label: 'Activo', hint: 'Ejercicio intenso 6–7 días por semana' },
  { value: 'very_active', label: 'Muy activo', hint: 'Trabajo físico o entrenamiento diario doble' },
];

const RANGES = {
  age: [12, 100],
  weightKg: [30, 300],
  heightCm: [100, 230],
} as const;

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useAppState();

  const [name, setName] = useState(profile.name);
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [age, setAge] = useState(String(profile.age));
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile.goal);

  const num = (s: string) => Number(s.replace(',', '.'));
  const inRange = (value: number, [min, max]: readonly [number, number]) =>
    Number.isFinite(value) && value >= min && value <= max;
  const valid =
    inRange(num(age), RANGES.age) && inRange(num(weight), RANGES.weightKg) && inRange(num(height), RANGES.heightCm);

  const draft: UserProfile = {
    name: name.trim(),
    sex,
    age: Math.round(num(age)),
    weightKg: Math.round(num(weight) * 10) / 10,
    heightCm: Math.round(num(height)),
    activityLevel,
    goal,
  };
  const dailyGoal = valid ? calculateDailyGoal(draft) : null;
  const macros = dailyGoal ? macroGoals(dailyGoal) : null;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!valid) return;
    actions.saveProfile(draft);
    if (draft.weightKg !== profile.weightKg) actions.logWeight(todayISO(), draft.weightKg);
    close();
  };

  return (
    <Screen withTabBar={false}>
      <Row style={{ gap: Spacing.two }}>
        <IconButton accessibilityLabel="Cerrar" onPress={close} style={{ marginLeft: -10 }}>
          <Icon name="back" size={22} color={theme.text} strokeWidth={2} />
        </IconButton>
        <Text variant="title" accessibilityRole="header">
          Perfil y metas
        </Text>
      </Row>

      <Card style={{ gap: Spacing.four }}>
        <Field label="Nombre (opcional)" value={name} onChange={setName} placeholder="¿Cómo te llamas?" />
        <View style={{ gap: 6 }}>
          <Text variant="label" color="textSecondary">
            Sexo
          </Text>
          <Segmented
            accessibilityLabel="Sexo"
            options={[
              { value: 'female' as Sex, label: 'Mujer' },
              { value: 'male' as Sex, label: 'Hombre' },
            ]}
            value={sex}
            onChange={setSex}
          />
        </View>
        <Row style={{ alignItems: 'flex-start' }}>
          <Field label="Edad" value={age} onChange={setAge} numeric suffix="años" />
          <Field label="Peso" value={weight} onChange={setWeight} numeric decimal suffix="kg" />
          <Field label="Estatura" value={height} onChange={setHeight} numeric suffix="cm" />
        </Row>
        {!valid && (
          <Text variant="caption" color="danger">
            Revisa los datos: edad 12–100, peso 30–300 kg, estatura 100–230 cm.
          </Text>
        )}
      </Card>

      <View style={{ gap: Spacing.two }}>
        <Text variant="label" color="textSecondary">
          Nivel de actividad (sin contar lo que registres)
        </Text>
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          {ACTIVITY_LEVELS.map((level, i) => {
            const on = level.value === activityLevel;
            return (
              <Pressable
                key={level.value}
                accessibilityRole="radio"
                accessibilityLabel={`${level.label}: ${level.hint}`}
                accessibilityState={{ selected: on }}
                onPress={() => setActivityLevel(level.value)}
                style={[
                  styles.option,
                  {
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: theme.divider,
                    backgroundColor: on ? theme.primarySoft : theme.surface,
                  },
                ]}>
                <View style={[styles.radio, { borderColor: on ? theme.primary : theme.dashed }]}>
                  {on && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodySemibold">{level.label}</Text>
                  <Text variant="caption" color="textSecondary">
                    {level.hint}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>
      </View>

      <View style={{ gap: Spacing.two }}>
        <Text variant="label" color="textSecondary">
          Objetivo
        </Text>
        <Segmented
          accessibilityLabel="Objetivo"
          options={[
            { value: 'lose' as Goal, label: 'Bajar' },
            { value: 'maintain' as Goal, label: 'Mantener' },
            { value: 'gain' as Goal, label: 'Subir' },
          ]}
          value={goal}
          onChange={setGoal}
        />
      </View>

      <Card tone="primarySoft" style={{ gap: 6 }}>
        <Text variant="overline" color="primaryStrong">
          Tu meta diaria
        </Text>
        <Text variant="numberLg" color="primaryStrong">
          {dailyGoal ? `${formatNumber(dailyGoal)} kcal` : '—'}
        </Text>
        {macros && (
          <Text variant="small" color="primaryStrong">
            Proteína {macros.protein} g · Carbs {macros.carbs} g · Grasa {macros.fat} g
          </Text>
        )}
        {valid && (
          <Text variant="caption" color="primaryStrong">
            Metabolismo basal {formatNumber(calculateBmr(draft))} kcal (Mifflin-St Jeor) × nivel de actividad
            {goal === 'lose' ? ' − 500' : goal === 'gain' ? ' + 300' : ''}.
          </Text>
        )}
      </Card>

      <PrimaryButton label="Guardar perfil" disabled={!valid} onPress={save} />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric,
  decimal,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  decimal?: boolean;
  suffix?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <View style={[styles.field, { borderColor: theme.border, backgroundColor: theme.background }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={suffix ? `${label} en ${suffix}` : label}
          inputMode={numeric ? (decimal ? 'decimal' : 'numeric') : 'text'}
          keyboardType={numeric ? (decimal ? 'decimal-pad' : 'number-pad') : 'default'}
          style={[styles.input, { color: theme.text }]}
        />
        {suffix && (
          <Text variant="small" color="textSecondary">
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    gap: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 60,
    paddingVertical: 10,
    paddingHorizontal: Spacing.five,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
