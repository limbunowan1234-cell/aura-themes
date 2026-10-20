import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/ui';
import { WallpaperGrid } from '../../components/wallpaper';
import { getWallpaper } from '../../data/catalog';
import { resolveCollection } from '../../data/collections';
import type { Wallpaper } from '../../data/types';
import { useStore } from '../../store/store';
import { colors } from '../../theme/tokens';

export default function CollectionScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { state } = useStore();

  const { title, subtitle, items } = useMemo(() => {
    if (key === 'saved') {
      const seen = new Set<string>();
      const list = state.saved
        .filter((s) => s.kind === 'wallpaper' && !seen.has(s.id) && seen.add(s.id))
        .map((s) => getWallpaper(s.id))
        .filter((w): w is Wallpaper => !!w);
      return { title: 'Save history', subtitle: 'Wallpapers you saved to Photos', items: list };
    }
    const def = resolveCollection(key ?? '');
    return def ? { title: def.title, subtitle: def.subtitle, items: def.items() } : { title: 'Collection', subtitle: '', items: [] as Wallpaper[] };
  }, [key, state.saved]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <WallpaperGrid
        items={items}
        header={<Header title={title} subtitle={subtitle} />}
        bottomPad={40}
        empty={
          <EmptyState
            icon={key === 'saved' ? 'download-outline' : 'albums-outline'}
            title={key === 'saved' ? 'Nothing saved yet' : 'Collection not found'}
            body={key === 'saved' ? 'Wallpapers you save to Photos will be listed here.' : 'This collection may have moved.'}
            action={{ label: 'Browse wallpapers', onPress: () => router.navigate('/wallpapers') }}
          />
        }
      />
    </View>
  );
}
