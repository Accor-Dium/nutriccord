import { Link } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { FontFamily, TabBarHeight } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Pestañas: Hoy · Diario · (+ Agregar) · Actividad · Progreso. */
export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={[
          styles.bar,
          {
            height: TabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="home" label="Hoy" />
        </TabTrigger>
        <TabTrigger name="diario" href="/diario" asChild>
          <TabButton icon="list" label="Diario" />
        </TabTrigger>
        <View style={styles.fabSlot}>
          <Link href="/agregar" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Agregar alimento"
              style={StyleSheet.flatten([
                styles.fab,
                { backgroundColor: theme.primary, boxShadow: '0 6px 16px rgba(26,107,67,0.3)' },
              ])}>
              <Icon name="plus" size={26} color={theme.onPrimary} strokeWidth={2.2} />
            </Pressable>
          </Link>
        </View>
        <TabTrigger name="actividad" href="/actividad" asChild>
          <TabButton icon="activity" label="Actividad" />
        </TabTrigger>
        <TabTrigger name="progreso" href="/progreso" asChild>
          <TabButton icon="chart" label="Progreso" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

// `ref` se descarta: su tipo en expo-router/ui no es compatible con Pressable en TS 6.
function TabButton({
  icon,
  label,
  isFocused,
  ref: _ref,
  ...props
}: TabTriggerSlotProps & { icon: IconName; label: string }) {
  const theme = useTheme();
  const color = isFocused ? theme.primary : theme.textSecondary;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} color={color} />
      <Text variant="tab" style={{ color, fontFamily: isFocused ? FontFamily.bold : FontFamily.semibold }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  tab: {
    width: 68,
    minHeight: 48,
    alignItems: 'center',
    gap: 4,
  },
  fabSlot: {
    width: 64,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    marginTop: -22,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
