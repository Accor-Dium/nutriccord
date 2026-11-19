import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { formatNumber } from '@/lib/dates';
import { useTheme } from '@/hooks/use-theme';

/** Anillo de calorías: el arco muestra lo comido sobre lo disponible (meta + ejercicio). */
export function CalorieRing({
  eaten,
  available,
  remaining,
  size = 148,
}: {
  eaten: number;
  available: number;
  remaining: number;
  size?: number;
}) {
  const theme = useTheme();
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = available > 0 ? Math.min(1, eaten / available) : 0;
  const over = remaining < 0;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${formatNumber(eaten)} de ${formatNumber(available)} kcal disponibles consumidas. ${
        over ? `Excedido por ${formatNumber(-remaining)}` : `Quedan ${formatNumber(remaining)}`
      } kcal`}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.primarySoft} strokeWidth={stroke} />
        {progress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={over ? theme.over : theme.primary}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * progress} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text variant="numberLg">{formatNumber(Math.abs(remaining))}</Text>
        <Text variant="captionSemibold" color="textSecondary">
          {over ? 'kcal excedidas' : 'kcal restantes'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
