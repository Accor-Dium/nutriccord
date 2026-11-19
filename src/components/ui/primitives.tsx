import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing, TabBarHeight, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Pantalla con scroll, fondo del tema y espacio para la barra de pestañas. */
export function Screen({
  children,
  withTabBar = true,
  contentStyle,
}: {
  children: ReactNode;
  withTabBar?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = (withTabBar ? TabBarHeight + insets.bottom : insets.bottom) + Spacing.eight;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.screenContent,
        { paddingTop: insets.top + Spacing.six, paddingBottom: bottom },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

/** Tarjeta blanca redondeada. */
export function Card({ style, children, tone = 'surface', ...rest }: ViewProps & { tone?: ThemeColor }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme[tone] }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Row({ style, ...rest }: ViewProps) {
  return <View style={[styles.row, style]} {...rest} />;
}

/** Barra de progreso horizontal (value 0–1, se recorta a 1). */
export function ProgressBar({
  value,
  color,
  track,
  height = 8,
}: {
  value: number;
  color: ThemeColor;
  track: ThemeColor;
  height?: number;
}) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: theme[track], overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: theme[color] }} />
    </View>
  );
}

/** Botón principal de ancho completo. */
export function PrimaryButton({
  label,
  color = 'primary',
  disabled,
  ...rest
}: PressableProps & { label: string; color?: ThemeColor }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: theme[color], opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
      {...rest}>
      <Text variant="button" color="onPrimary">
        {label}
      </Text>
    </Pressable>
  );
}

/** Control segmentado (Piezas / Gramos / Equivalentes, Ligera / Moderada / Intensa). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.segmented, { backgroundColor: theme.surfaceMuted }]}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              on && { backgroundColor: theme.surface, boxShadow: `0 1px 3px ${theme.shadow}` },
            ]}>
            <Text variant={on ? 'bodyBold' : 'bodySemibold'} color={on ? 'text' : 'textSecondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Rejilla de opciones tipo chip (tipo de actividad, tiempo de comida). */
export function ChipGrid<T extends string | number>({
  options,
  value,
  onChange,
  columns,
  accent = 'primary',
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns: number;
  accent?: ThemeColor;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.chipGrid}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                width: `${100 / columns}%`,
              },
              pressed && { opacity: 0.8 },
            ]}>
            <View
              style={[
                styles.chipInner,
                {
                  borderColor: on ? theme[accent] : theme.border,
                  backgroundColor: on ? theme[accent] : theme.surface,
                },
              ]}>
              <Text
                variant={columns >= 4 ? 'label' : 'bodySemibold'}
                color={on ? 'onPrimary' : 'text'}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {option.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Botón redondo − / + con un valor grande al centro. */
export function Stepper({
  value,
  caption,
  onDecrement,
  onIncrement,
  decrementLabel,
  incrementLabel,
  accent = 'primary',
}: {
  value: string;
  caption: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementLabel: string;
  incrementLabel: string;
  accent?: ThemeColor;
}) {
  const theme = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={decrementLabel}
        onPress={onDecrement}
        style={({ pressed }) => [
          styles.stepperButton,
          { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
          pressed && { opacity: 0.7 },
        ]}>
        <Text variant="number" style={{ lineHeight: 30 }}>
          −
        </Text>
      </Pressable>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text variant="numberXl" accessibilityLiveRegion="polite">
          {value}
        </Text>
        <Text variant="small" color="textSecondary" style={{ textAlign: 'center' }}>
          {caption}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={incrementLabel}
        onPress={onIncrement}
        style={({ pressed }) => [
          styles.stepperButton,
          { backgroundColor: theme[accent] },
          pressed && { opacity: 0.8 },
        ]}>
        <Text variant="number" color="onPrimary" style={{ lineHeight: 30 }}>
          +
        </Text>
      </Pressable>
    </Row>
  );
}

/** Botón circular con ícono (perfil, cerrar, agregar a comida). */
export function IconButton({
  children,
  accessibilityLabel,
  background,
  bordered,
  size = 44,
  ...rest
}: PressableProps & {
  children: ReactNode;
  accessibilityLabel: string;
  background?: ThemeColor;
  bordered?: boolean;
  size?: number;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background ? theme[background] : 'transparent',
          borderWidth: bordered ? 1 : 0,
          borderColor: theme.border,
        },
        pressed && { opacity: 0.7 },
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Row style={{ justifyContent: 'space-between', minHeight: 24 }}>
      <Text variant="heading">{title}</Text>
      {action}
    </Row>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  segmented: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Radius.md,
    gap: Spacing.one,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.one,
    rowGap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.one,
  },
  chipInner: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
