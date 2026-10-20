import { WALLPAPER_FULL, WALLPAPER_META, WALLPAPER_THUMB } from './wallpapers.generated';
import themesJson from './themes.json';
import type { CategoryId, SortMode, ThemeCollection, Wallpaper } from './types';

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: 'amoled', label: 'AMOLED', blurb: 'True black that saves battery on OLED iPhones' },
  { id: 'gradient', label: 'Gradient', blurb: 'Soft colour fields' },
  { id: 'abstract', label: 'Abstract', blurb: 'Liquid shapes and flowing colour' },
  { id: 'minimal', label: 'Minimal', blurb: 'One shape, lots of calm' },
  { id: 'dark', label: 'Dark', blurb: 'Low-light moods' },
  { id: 'space', label: 'Space', blurb: 'Nebulae, planets and starfields' },
  { id: 'mountains', label: 'Mountains', blurb: 'Layered peaks from dawn to night' },
  { id: 'ocean', label: 'Ocean', blurb: 'Horizons and reflections' },
  { id: 'nature', label: 'Nature', blurb: 'Auroras, hills and contour maps' },
  { id: 'retro', label: 'Retro', blurb: 'Synthwave grids and 70s stripes' },
  { id: 'luxury', label: 'Luxury', blurb: 'Marble, gold and velvet' },
  { id: 'architecture', label: 'Architecture', blurb: 'Arches, stairs and geometry' },
  { id: 'cute', label: 'Cute', blurb: 'Pastels, sparkles and hearts' },
  { id: 'seasonal', label: 'Seasonal', blurb: 'Festivals, snow, blossom and monsoon' },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

export function categoryLabel(id: string) {
  return CATEGORY_LABEL[id] ?? id;
}

const LICENSE = 'Original artwork by Darjeeling Web Studio for Aura Themes. Free for personal use as a device wallpaper.';

export const WALLPAPERS: Wallpaper[] = WALLPAPER_META.map((m) => ({
  ...m,
  description: `${categoryLabel(m.category)} wallpaper · ${m.tags.slice(0, 3).join(' · ')}`,
  premium: false,
  license: LICENSE,
  full: WALLPAPER_FULL[m.id],
  thumb: WALLPAPER_THUMB[m.id],
}));

const BY_ID = new Map(WALLPAPERS.map((w) => [w.id, w]));

export function getWallpaper(id: string | undefined | null): Wallpaper | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export const THEMES: ThemeCollection[] = themesJson as ThemeCollection[];
const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]));
export function getTheme(id: string | undefined | null) {
  return id ? THEME_BY_ID.get(id) : undefined;
}

export function sortWallpapers(list: Wallpaper[], mode: SortMode) {
  const copy = [...list];
  if (mode === 'popular') copy.sort((a, b) => b.popularity - a.popularity);
  else if (mode === 'recent') copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

export function byCategory(id: string) {
  return WALLPAPERS.filter((w) => w.category === id);
}

export function related(w: Wallpaper, n = 8) {
  const score = (o: Wallpaper) =>
    (o.category === w.category ? 3 : 0) + o.tags.filter((t) => w.tags.includes(t)).length + (o.tone === w.tone ? 1 : 0);
  return WALLPAPERS.filter((o) => o.id !== w.id)
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s || b.o.popularity - a.o.popularity)
    .slice(0, n)
    .map((x) => x.o);
}

// ---------- colour search ----------
const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0], white: [245, 245, 245], grey: [128, 128, 128], gray: [128, 128, 128],
  red: [220, 40, 50], orange: [240, 130, 40], yellow: [240, 210, 60], gold: [212, 175, 55],
  green: [50, 160, 90], teal: [20, 150, 150], mint: [150, 230, 200], blue: [40, 100, 220],
  navy: [15, 30, 80], purple: [120, 50, 200], violet: [130, 80, 230], lilac: [200, 170, 240],
  pink: [240, 120, 180], peach: [255, 200, 170], brown: [130, 80, 50], beige: [235, 220, 200],
};

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorMatches(w: Wallpaper, name: string) {
  const target = NAMED_COLORS[name];
  if (!target) return false;
  return w.palette.slice(0, 3).some((hex) => {
    const [r, g, b] = hexToRgb(hex);
    const d = Math.sqrt((r - target[0]) ** 2 + (g - target[1]) ** 2 + (b - target[2]) ** 2);
    return d < 95;
  });
}

export type QuickFilter = 'all' | 'dark' | 'light' | 'minimal' | 'lock';

export const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'lock', label: 'Lock-screen ready' },
];

export function applyQuickFilter(list: Wallpaper[], f: QuickFilter) {
  switch (f) {
    case 'dark':
      return list.filter((w) => w.tone === 'dark');
    case 'light':
      return list.filter((w) => w.tone === 'light');
    case 'minimal':
      return list.filter((w) => w.category === 'minimal' || w.tags.includes('minimal'));
    case 'lock':
      return list.filter((w) => w.clockFriendly);
    default:
      return list;
  }
}

/** Full-text search across titles, categories, tags, colours and theme names. */
export function search(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return { wallpapers: [] as Wallpaper[], themes: [] as ThemeCollection[] };
  const wallpapers = WALLPAPERS.filter((w) => {
    const hay = [w.title, w.category, categoryLabel(w.category), w.tone, ...w.tags].join(' ').toLowerCase();
    return terms.every((t) => hay.includes(t) || colorMatches(w, t));
  }).sort((a, b) => b.popularity - a.popularity);
  const themes = THEMES.filter((t) => {
    const hay = [t.name, t.tagline, ...t.mood].join(' ').toLowerCase();
    return terms.every((q) => hay.includes(q));
  });
  return { wallpapers, themes };
}

export const SEARCH_SUGGESTIONS = ['black', 'pastel', 'mountains', 'gold', 'neon', 'blue', 'minimal', 'aurora', 'retro', 'pink'];
