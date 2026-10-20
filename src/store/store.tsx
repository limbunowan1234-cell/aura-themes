import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

const KEY = 'aura.state.v1';

export interface SavedEntry {
  id: string;
  kind: 'wallpaper' | 'icon';
  at: number;
}

export interface AppState {
  hydrated: boolean;
  favWallpapers: string[];
  favThemes: string[];
  recent: string[];
  saved: SavedEntry[];
  shortcutReady: boolean;
  onboarded: boolean;
  name: string;
  reduceMotion: boolean;
}

const initial: AppState = {
  hydrated: false,
  favWallpapers: [],
  favThemes: [],
  recent: [],
  saved: [],
  shortcutReady: false,
  onboarded: false,
  name: '',
  reduceMotion: false,
};

type Action =
  | { type: 'hydrate'; state: Partial<AppState> }
  | { type: 'toggleFavWallpaper'; id: string }
  | { type: 'toggleFavTheme'; id: string }
  | { type: 'viewed'; id: string }
  | { type: 'saved'; entry: SavedEntry }
  | { type: 'set'; patch: Partial<AppState> }
  | { type: 'clearHistory' }
  | { type: 'reset' };

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
}

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'hydrate':
      return { ...s, ...a.state, hydrated: true };
    case 'toggleFavWallpaper':
      return { ...s, favWallpapers: toggle(s.favWallpapers, a.id) };
    case 'toggleFavTheme':
      return { ...s, favThemes: toggle(s.favThemes, a.id) };
    case 'viewed':
      return { ...s, recent: [a.id, ...s.recent.filter((x) => x !== a.id)].slice(0, 24) };
    case 'saved':
      return { ...s, saved: [a.entry, ...s.saved].slice(0, 100) };
    case 'set':
      return { ...s, ...a.patch };
    case 'clearHistory':
      return { ...s, recent: [], saved: [] };
    case 'reset':
      return { ...initial, hydrated: true, onboarded: true };
  }
}

interface Ctx {
  state: AppState;
  toggleFavWallpaper(id: string): void;
  toggleFavTheme(id: string): void;
  markViewed(id: string): void;
  recordSave(id: string, kind: SavedEntry['kind']): void;
  set(patch: Partial<AppState>): void;
  clearHistory(): void;
  resetAll(): void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const ready = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        dispatch({ type: 'hydrate', state: raw ? JSON.parse(raw) : {} });
      } catch {
        dispatch({ type: 'hydrate', state: {} });
      } finally {
        ready.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready.current || !state.hydrated) return;
    const { hydrated, ...persist } = state;
    AsyncStorage.setItem(KEY, JSON.stringify(persist)).catch(() => {});
  }, [state]);

  const toggleFavWallpaper = useCallback((id: string) => dispatch({ type: 'toggleFavWallpaper', id }), []);
  const toggleFavTheme = useCallback((id: string) => dispatch({ type: 'toggleFavTheme', id }), []);
  const markViewed = useCallback((id: string) => dispatch({ type: 'viewed', id }), []);
  const recordSave = useCallback(
    (id: string, kind: SavedEntry['kind']) => dispatch({ type: 'saved', entry: { id, kind, at: Date.now() } }),
    [],
  );
  const set = useCallback((patch: Partial<AppState>) => dispatch({ type: 'set', patch }), []);
  const clearHistory = useCallback(() => dispatch({ type: 'clearHistory' }), []);
  const resetAll = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo(
    () => ({ state, toggleFavWallpaper, toggleFavTheme, markViewed, recordSave, set, clearHistory, resetAll }),
    [state, toggleFavWallpaper, toggleFavTheme, markViewed, recordSave, set, clearHistory, resetAll],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
