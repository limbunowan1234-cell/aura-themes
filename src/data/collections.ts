import { byCategory, categoryLabel, getWallpaper, sortWallpapers, WALLPAPERS } from './catalog';
import type { Wallpaper } from './types';

const EDITORS = [
  'himalayan-dawn', 'aurora-borealis', 'nero-marquina', 'molten-glass', 'outrun', 'clay-arch',
  'festival-of-lights', 'tea-hills', 'solar-eclipse', 'sunset-sea', 'cloud-nine', 'ember-planet',
];

export interface CollectionDef {
  title: string;
  subtitle: string;
  items: () => Wallpaper[];
}

export function resolveCollection(key: string): CollectionDef | undefined {
  if (key.startsWith('cat:')) {
    const id = key.slice(4);
    const items = byCategory(id);
    if (!items.length) return undefined;
    return { title: categoryLabel(id), subtitle: `${items.length} wallpapers`, items: () => sortWallpapers(items, 'popular') };
  }
  switch (key) {
    case 'trending':
      return { title: 'Trending', subtitle: 'Most-loved designs right now', items: () => sortWallpapers(WALLPAPERS, 'popular').slice(0, 30) };
    case 'recent':
      return { title: 'Recently added', subtitle: 'Fresh from the studio', items: () => sortWallpapers(WALLPAPERS, 'recent').slice(0, 30) };
    case 'editors':
      return {
        title: "Editor's picks",
        subtitle: 'Hand-picked by the Aura team',
        items: () => EDITORS.map((id) => getWallpaper(id)).filter((w): w is Wallpaper => !!w),
      };
    case 'darkmode':
      return {
        title: 'AMOLED & dark',
        subtitle: 'Deep blacks that look stunning on OLED screens',
        items: () => sortWallpapers([...byCategory('amoled'), ...byCategory('dark')], 'popular'),
      };
    case 'lock':
      return {
        title: 'Lock-screen ready',
        subtitle: 'Calm space at the top where the clock sits',
        items: () => sortWallpapers(WALLPAPERS.filter((w) => w.clockFriendly), 'popular'),
      };
    case 'pastel':
      return {
        title: 'Pastel',
        subtitle: 'Soft, light and sweet',
        items: () =>
          sortWallpapers(
            WALLPAPERS.filter((w) => w.category === 'cute' || w.tags.includes('pastel')),
            'popular',
          ),
      };
    default:
      return undefined;
  }
}

export function editorsPicks() {
  return resolveCollection('editors')!.items();
}
