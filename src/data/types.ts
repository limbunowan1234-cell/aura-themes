export type CategoryId =
  | 'gradient'
  | 'abstract'
  | 'amoled'
  | 'dark'
  | 'space'
  | 'mountains'
  | 'ocean'
  | 'nature'
  | 'retro'
  | 'minimal'
  | 'architecture'
  | 'luxury'
  | 'seasonal'
  | 'cute';

/** Shape written by tools/gen/render.py */
export interface WallpaperMeta {
  id: string;
  title: string;
  category: CategoryId | string;
  tags: string[];
  width: number;
  height: number;
  dominantColor: string;
  palette: string[];
  tone: 'dark' | 'light';
  clockFriendly: boolean;
  createdAt: string;
  popularity: number;
}

export interface Wallpaper extends WallpaperMeta {
  description: string;
  premium: boolean;
  license: string;
  full: number;
  thumb: number;
}

export interface ThemeIconStyle {
  bg: [string, string] | string[];
  glyph: string;
  outline: boolean;
}

export interface ThemeCollection {
  id: string;
  name: string;
  tagline: string;
  homeWallpaper: string;
  lockWallpaper: string;
  palette: string[];
  accent: string;
  icon: ThemeIconStyle;
  mood: string[];
}

export type SortMode = 'popular' | 'recent' | 'az';
