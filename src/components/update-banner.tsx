import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
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
      <ThemedView type="backgroundElement" style={styles.banner}>
        <View style={styles.text}>
          <ThemedText type="smallBold">{content.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {content.body}
          </ThemedText>
        </View>
        <Pressable onPress={() => setDismissed(true)} hitSlop={8} accessibilityLabel="Cerrar aviso">
          <ThemedText type="small" themeColor="textSecondary">
            Después
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={content.onPress}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            {content.action}
          </ThemedText>
        </Pressable>
      </ThemedView>
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
    paddingHorizontal: Spacing.three,
  },
  banner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  text: {
    flex: 1,
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  buttonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
});
