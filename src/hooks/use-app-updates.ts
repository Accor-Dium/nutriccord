import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { IOS_STORE_URL, UPDATE_CHECK_INTERVAL_MS } from '@/constants/app';
import { fetchLatestNativeRelease, type NativeRelease } from '@/lib/native-release';
import { compareSemver } from '@/lib/semver';

let lastCheckAt = 0;

/**
 * Revisa ambos tipos de actualización. Devuelve la versión nativa nueva (o null), o
 * `undefined` si no se revisó (desarrollo, web o se revisó hace menos de una hora).
 */
async function checkForUpdates(): Promise<NativeRelease | null | undefined> {
  if (__DEV__ || Platform.OS === 'web') return undefined;
  const now = Date.now();
  if (now - lastCheckAt < UPDATE_CHECK_INTERVAL_MS) return undefined;
  lastCheckAt = now;

  // 1) OTA: se descarga en segundo plano; useUpdates() refleja cuando queda pendiente.
  if (Updates.isEnabled) {
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) await Updates.fetchUpdateAsync();
    } catch (error) {
      console.warn('[updates] Error revisando OTA', error);
    }
  }

  // 2) Nativa (Android): último Release con APK vs versión del APK instalado.
  const installed = Application.nativeApplicationVersion;
  if (Platform.OS !== 'android' || !installed) return null;
  try {
    const latest = await fetchLatestNativeRelease();
    return latest && compareSemver(latest.version, installed) > 0 ? latest : null;
  } catch (error) {
    console.warn('[updates] Error revisando GitHub Releases', error);
    return undefined;
  }
}

/**
 * Detecta actualizaciones de dos tipos:
 * - **OTA (EAS Update)**: cambios de JS/estilos/assets. Se descargan solas en segundo plano;
 *   cuando están listas, `isOtaReady` es true y `applyOta()` reinicia la app con la nueva versión.
 * - **Nativa**: la versión requiere reinstalar (cambió código nativo). En Android se compara la
 *   versión instalada contra el último GitHub Release con APK; en iOS se usará `IOS_STORE_URL`.
 *
 * Revisa al abrir la app y al volver a primer plano (máx. una vez por hora).
 * No hace nada en desarrollo, Expo Go ni web.
 */
export function useAppUpdates() {
  const { isUpdatePending } = Updates.useUpdates();
  const [nativeUpdate, setNativeUpdate] = useState<NativeRelease | null>(null);

  useEffect(() => {
    const run = () => {
      checkForUpdates().then((result) => {
        if (result !== undefined) setNativeUpdate(result);
      });
    };
    run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => subscription.remove();
  }, []);

  const applyOta = useCallback(() => Updates.reloadAsync(), []);

  const openNativeDownload = useCallback(() => {
    const url = Platform.OS === 'ios' ? IOS_STORE_URL : nativeUpdate?.apkUrl;
    if (url) Linking.openURL(url);
  }, [nativeUpdate]);

  return {
    /** Hay una OTA descargada lista para aplicarse al reiniciar. */
    isOtaReady: isUpdatePending,
    /** Versión nativa más nueva disponible (requiere instalar), o null. */
    nativeUpdate,
    applyOta,
    openNativeDownload,
  };
}
