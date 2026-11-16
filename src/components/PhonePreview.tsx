import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ICON_IMAGES, ICON_SLOTS, type IconVariant } from '../data/icons.generated';
import type { ThemeCollection, Wallpaper } from '../data/types';
import { WALLPAPER_RATIO } from '../theme/tokens';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const DOCK = ['phone', 'messages', 'browser', 'music'];

/** Illustrative mock of a home screen — not a reproduction of the user's real iPhone. */
export function HomePreview({
  theme,
  wallpaper,
  width,
  variant = 'signature',
}: {
  theme: ThemeCollection;
  wallpaper: Wallpaper;
  width: number;
  variant?: IconVariant;
}) {
  const now = useNow();
  const height = width * WALLPAPER_RATIO;
  const s = width / 300;
  const icons = ICON_IMAGES[theme.id]?.[variant] ?? {};
  const grid = ICON_SLOTS.map((x) => x.id).filter((id) => !DOCK.includes(id)).slice(0, 8);
  const iconSize = 50 * s;
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day = now.toLocaleDateString([], { weekday: 'long' });
  const date = now.toLocaleDateString([], { day: 'numeric', month: 'short' });
  return (
    <View
      style={[styles.phone, { width, height, borderRadius: 44 * s }]}
      accessible
      accessibilityLabel={`Illustrative home-screen preview of the ${theme.name} theme`}
    >
      <Image source={wallpaper.full} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      <View style={[styles.island, { width: 90 * s, height: 26 * s, top: 10 * s, borderRadius: 13 * s }]} />
      <View style={{ paddingHorizontal: 20 * s, paddingTop: 58 * s }}>
        <View
          style={[
            styles.widget,
            { borderRadius: 22 * s, padding: 14 * s, height: 120 * s, backgroundColor: theme.palette[0] + 'cc' },
          ]}
        >
          <Text style={{ color: theme.accent, fontSize: 11 * s, fontWeight: '700', letterSpacing: 1 }}>{day.toUpperCase()}</Text>
          <Text style={{ color: '#fff', fontSize: 40 * s, fontWeight: '200', letterSpacing: -1 }}>{time}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 * s }}>{date}</Text>
        </View>
        <View style={[styles.grid, { marginTop: 22 * s, rowGap: 18 * s }]}>
          {grid.map((id) => (
            <View key={id} style={{ width: '25%', alignItems: 'center' }}>
              <Image source={icons[id]} style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.225 }} />
              <Text style={{ color: '#fff', fontSize: 9.5 * s, marginTop: 4 * s, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 3 }} numberOfLines={1}>
                {ICON_SLOTS.find((x) => x.id === id)?.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.dock, { left: 10 * s, right: 10 * s, bottom: 12 * s, height: 78 * s, borderRadius: 30 * s }]}>
        {DOCK.map((id) => (
          <Image key={id} source={icons[id]} style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.225 }} />
        ))}
      </View>
    </View>
  );
}

export function LockPreview({ wallpaper, width }: { wallpaper: Wallpaper; width: number }) {
  const now = useNow();
  const s = width / 300;
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
  const date = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <View
      style={[styles.phone, { width, height: width * WALLPAPER_RATIO, borderRadius: 44 * s }]}
      accessible
      accessibilityLabel="Illustrative lock-screen preview"
    >
      <Image source={wallpaper.full} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      <View style={[styles.island, { width: 90 * s, height: 26 * s, top: 10 * s, borderRadius: 13 * s }]} />
      <View style={{ alignItems: 'center', marginTop: 70 * s }}>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 * s, fontWeight: '600' }}>{date}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 84 * s, fontWeight: '700', letterSpacing: -2, lineHeight: 92 * s }}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: { overflow: 'hidden', backgroundColor: '#000', borderWidth: 3, borderColor: '#2a2a30' },
  island: { position: 'absolute', alignSelf: 'center', backgroundColor: '#000', zIndex: 2 },
  widget: { justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dock: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
