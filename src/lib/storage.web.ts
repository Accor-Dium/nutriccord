/** Almacenamiento key-value en web: localStorage (sin SQLite/WebAssembly). */
export const kv = {
  getSync(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Navegación privada o almacenamiento bloqueado: la app sigue funcionando en memoria.
    }
  },
};
