import { Storage } from 'expo-sqlite/kv-store';

/** Almacenamiento key-value persistente (SQLite en iOS/Android). Ver storage.web.ts. */
export const kv = {
  getSync(key: string): string | null {
    try {
      return Storage.getItemSync(key);
    } catch (error) {
      console.warn('[storage] No se pudo leer', key, error);
      return null;
    }
  },
  set(key: string, value: string): Promise<void> {
    return Storage.setItemAsync(key, value).catch((error) => {
      console.warn('[storage] No se pudo guardar', key, error);
    });
  },
};
