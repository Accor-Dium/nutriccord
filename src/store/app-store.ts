import { useSyncExternalStore } from 'react';

import { kv } from '@/lib/storage';
import type { ActivityEntry, FoodEntry, UserProfile, WeightEntry } from '@/types/nutrition';

/**
 * Estado global de la app, persistido localmente (SQLite key-value / localStorage en web).
 * Se carga de forma síncrona al importar el módulo y se guarda en cada cambio.
 * Si cambia la forma de los datos, subir STORAGE_VERSION y migrar en `load()`.
 */

const STORAGE_KEY = 'nutriccord:state';
const STORAGE_VERSION = 1;

export interface AppState {
  version: number;
  /** false hasta que el usuario guarda su perfil por primera vez. */
  profileConfigured: boolean;
  profile: UserProfile;
  entries: FoodEntry[];
  activities: ActivityEntry[];
  weights: WeightEntry[];
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  sex: 'female',
  age: 30,
  weightKg: 70,
  heightCm: 165,
  activityLevel: 'light',
  goal: 'maintain',
};

function initialState(): AppState {
  return {
    version: STORAGE_VERSION,
    profileConfigured: false,
    profile: DEFAULT_PROFILE,
    entries: [],
    activities: [],
    weights: [],
  };
}

function load(): AppState {
  const raw = kv.getSync(STORAGE_KEY);
  if (!raw) return initialState();
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initialState(), ...parsed, profile: { ...DEFAULT_PROFILE, ...parsed.profile } };
  } catch {
    return initialState();
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function setState(update: (prev: AppState) => AppState) {
  state = update(state);
  listeners.forEach((listener) => listener());
  void kv.set(STORAGE_KEY, JSON.stringify(state));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getState = () => state;

/** Estado completo; el componente se vuelve a renderizar en cada cambio. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

let idCounter = 0;
export function newId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const actions = {
  saveProfile(profile: UserProfile) {
    setState((s) => ({ ...s, profile, profileConfigured: true }));
  },

  addEntry(entry: Omit<FoodEntry, 'id' | 'createdAt'>) {
    const full: FoodEntry = { ...entry, id: newId(), createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, entries: [...s.entries, full] }));
  },

  removeEntry(id: string) {
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
  },

  addActivity(activity: Omit<ActivityEntry, 'id' | 'createdAt'>) {
    const full: ActivityEntry = { ...activity, id: newId(), createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, activities: [...s.activities, full] }));
  },

  removeActivity(id: string) {
    setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }));
  },

  /** Guarda el peso del día (reemplaza el de esa fecha) y actualiza el perfil. */
  logWeight(date: string, kg: number) {
    setState((s) => {
      const weights = [...s.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const latest = weights[weights.length - 1];
      return { ...s, weights, profile: { ...s.profile, weightKg: latest.kg } };
    });
  },
};
