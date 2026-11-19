import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icons';
import { IconButton, Row } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ACTIVITY_TYPES_BY_ID, INTENSITY_LABELS } from '@/lib/activity';
import { formatTime } from '@/lib/dates';
import type { ActivityEntry } from '@/types/nutrition';

/** Fila de una actividad registrada; con `onDelete` muestra el botón de eliminar. */
export function ActivityRow({
  activity,
  divider,
  onDelete,
}: {
  activity: ActivityEntry;
  divider?: boolean;
  onDelete?: () => void;
}) {
  const theme = useTheme();
  const type = ACTIVITY_TYPES_BY_ID[activity.type];
  return (
    <Row style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: theme.divider }]}>
      <View style={[styles.icon, { backgroundColor: theme.activitySoft }]}>
        <Icon
          name={activity.type === 'strength' ? 'dumbbell' : activity.type === 'walk' ? 'walk' : 'activity'}
          size={20}
          color={theme.activity}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodySemibold">{type.label}</Text>
        <Text variant="caption" color="textSecondary">
          {formatTime(activity.createdAt)} · {activity.minutes} min · {INTENSITY_LABELS[activity.intensity].toLowerCase()}
        </Text>
      </View>
      <Text variant="bodyBold">{activity.kcal} kcal</Text>
      {onDelete && (
        <IconButton accessibilityLabel={`Eliminar ${type.label}`} onPress={onDelete} size={36}>
          <Icon name="trash" size={18} color={theme.textSecondary} />
        </IconButton>
      )}
    </Row>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm + 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
