import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, Tap } from '../../components/ui';
import { ThemeCard, WallpaperGrid } from '../../components/wallpaper';
import { getTheme, getWallpaper } from '../../data/catalog';
import type { ThemeCollection, Wallpaper } from '../../data/types';
import { useStore } from '../../store/store';
import { colors, radius, space, type } from '../../theme/tokens';

type Tab = 'wallpapers' | 'themes' | 'recent';

export default function Favorites() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('wallpapers');

  const favW = useMemo(() => state.favWallpapers.map((id) => getWallpaper(id)).filter((w): w is Wallpaper => !!w), [state.favWallpapers]);
  const favT = useMemo(() => state.favThemes.map((id) => getTheme(id)).filter((t): t is ThemeCollection => !!t), [state.favThemes]);
  const recent = useMemo(() => state.recent.map((id) => getWallpaper(id)).filter((w): w is Wallpaper => !!w), [state.recent]);

  const header = (
    <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.lg, paddingBottom: space.md }}>
      <Text style={type.hero} accessibilityRole="header">
        Favourites
      </Text>
      <Text style={type.caption}>Saved on this iPhone · no account needed</Text>
      <View style={styles.seg} accessibilityRole="tablist">
        {(
          [
            ['wallpapers', `Wallpapers ${favW.length || ''}`],
            ['themes', `Themes ${favT.length || ''}`],
            ['recent', 'Recent'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <Tap
            key={id}
            onPress={() => setTab(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            style={[styles.segBtn, tab === id && styles.segOn]}
          >
            <Text style={[styles.segText, tab === id && { color: colors.black }]}>{label.trim()}</Text>
          </Tap>
        ))}
      </View>
    </View>
  );

  if (tab === 'themes') {
    const cardW = Math.floor((width - space.lg * 2 - space.md) / 2);
    return (
      <FlatList
        style={{ flex: 1, backgroundColor: colors.bg }}
        data={favT}
        numColumns={2}
        keyExtractor={(t) => t.id}
        columnWrapperStyle={{ gap: space.md, paddingHorizontal: space.lg }}
        contentContainerStyle={{ gap: space.lg, paddingBottom: 130 }}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ThemeCard t={item} width={cardW} />}
        ListEmptyComponent={
          <EmptyState
            icon="color-palette-outline"
            title="No saved themes"
            body="Tap the heart on any theme to keep it here."
            action={{ label: 'Browse themes', onPress: () => router.navigate('/themes') }}
          />
        }
      />
    );
  }

  const items = tab === 'wallpapers' ? favW : recent;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <WallpaperGrid
        items={items}
        header={header}
        empty={
          tab === 'wallpapers' ? (
            <EmptyState
              icon="heart-outline"
              title="No favourites yet"
              body="Tap the heart on any wallpaper and it will wait for you here, even offline."
              action={{ label: 'Explore wallpapers', onPress: () => router.navigate('/wallpapers') }}
            />
          ) : (
            <EmptyState icon="time-outline" title="Nothing viewed yet" body="Wallpapers you open will show up here." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: colors.surfaceRaised, borderRadius: radius.pill, padding: 3, marginTop: space.md },
  segBtn: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.text },
  segText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
});
