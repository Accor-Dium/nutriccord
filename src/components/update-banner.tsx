import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Row } from '@/components/ui/primitives';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAppUpdates } from '@/hooks/use-app-updates';
import { useTheme } from '@/hooks/use-theme';

/** Aviso flotante cuando hay una actualización OTA lista o una versión nativa nueva. */
export function UpdateBanner() {
  const theme = useTheme();
  const { isOtaReady, nativeUpdate, applyOta, openNativeDownload } = useAppUpdates();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // La versión nativa tiene prioridad: una OTA no puede aportar cambios nativos.
  const content = nativeUpdate
    ? {
        title: `Nueva versión ${nativeUpdate.version} disponible`,
        body: 'Esta versión requiere descargar e instalar la app.',
        action: 'Descargar',
        onPress: openNativeDownload,
      }
    : isOtaReady
      ? {
          title: 'Actualización lista',
          body: 'Reinicia la app para usar la versión más reciente.',
          action: 'Reiniciar',
          onPress: applyOta,
        }
      : null;

  if (!content) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.wrapper} pointerEvents="box-none">
      <Card style={[styles.banner, { boxShadow: `0 4px 16px ${theme.shadow}` }]}>
        <Row>
          <View style={styles.text}>
            <Text variant="bodyBold">{content.title}</Text>
            <Text variant="caption" color="textSecondary">
              {content.body}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDismissed(true)}
            hitSlop={8}
            style={styles.later}>
            <Text variant="small" color="textSecondary">
              Después
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={content.onPress}
            style={({ pressed }) => [styles.button, { backgroundColor: theme.primary }, pressed && { opacity: 0.8 }]}>
            <Text variant="bodyBold" color="onPrimary">
              {content.action}
            </Text>
          </Pressable>
        </Row>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  banner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    marginTop: Spacing.two,
  },
  text: { flex: 1 },
  later: { minHeight: 44, justifyContent: 'center' },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
});
