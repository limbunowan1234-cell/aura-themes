import { Platform, TextStyle } from 'react-native';

export const colors = {
  bg: '#08080a',
  surface: '#121216',
  surfaceRaised: '#1a1a20',
  surfaceHigh: '#24242c',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#f5f1ea',
  textMuted: '#a29fa8',
  textFaint: '#6e6b75',
  accent: '#9b7bff',
  accentSoft: 'rgba(155,123,255,0.16)',
  accentText: '#c9b8ff',
  pink: '#ff7ac6',
  success: '#5ee3a1',
  warning: '#ffcc66',
  danger: '#ff6b7a',
  scrim: 'rgba(0,0,0,0.55)',
  white: '#ffffff',
  black: '#000000',
} as const;

export const gradients = {
  brand: ['#7c4dff', '#ff78c8'] as const,
  fadeBottom: ['transparent', 'rgba(8,8,10,0.85)'] as const,
  fadeTop: ['rgba(0,0,0,0.55)', 'transparent'] as const,
};

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

const display = Platform.select({ ios: 'System', default: undefined });

export const type: Record<string, TextStyle> = {
  hero: { fontFamily: display, fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.8, color: colors.text },
  title: { fontFamily: display, fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.4, color: colors.text },
  heading: { fontFamily: display, fontSize: 19, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  bodyMuted: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.text },
  caption: { fontSize: 12, lineHeight: 16, color: colors.textMuted },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accentText },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

/** Minimum touch target per Apple HIG. */
export const HIT = 44;

/** iPhone wallpaper aspect ratio (height / width) for 19.5:9 screens. */
export const WALLPAPER_RATIO = 2556 / 1179;
