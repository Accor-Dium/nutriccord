/** Configuración de distribución de la app. */

/** Repo de GitHub donde el pipeline publica los Releases con el APK de Android. */
export const GITHUB_REPO = 'Accor-Dium/nutriccord';

/**
 * URL de la app en App Store / TestFlight. Mientras sea `null`, en iOS solo se usan
 * actualizaciones OTA (las versiones nativas las notifica la propia App Store / TestFlight).
 */
export const IOS_STORE_URL: string | null = null;

/** Tiempo mínimo entre revisiones de actualizaciones al volver la app a primer plano. */
export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hora
