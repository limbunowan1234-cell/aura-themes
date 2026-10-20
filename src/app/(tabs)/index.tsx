import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, SectionHeader, Tap } from '../../components/ui';
import { PaletteDots, ThemeCard, WallpaperRail } from '../../components/wallpaper';
import { BRAND } from '../../config/brand';
import { byCategory, getWallpaper, sortWallpapers, THEMES, WALLPAPERS } from '../../data/catalog';
import { editorsPicks, resolveCollection } from '../../data/collections';
import { useStore } from '../../store/store';
import { colors, radius, space, type } from '../../theme/tokens';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const seeAll = (key: string) => () => router.push({ pathname: '/collection/[key]', params: { key } });

export default function Discover() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state } = useStore();
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const featured = THEMES[dayIndex % THEMES.length];
  const featuredWp = getWallpaper(featured.homeWallpaper)!;

  const rails = useMemo(
    () => [
      { key: 'trending', title: 'Trending', subtitle: 'Most-loved this week', items: sortWallpapers(WALLPAPERS, 'popular').slice(0, 12) },
      { key: 'recent', title: 'Recently added', subtitle: 'Fresh from the studio', items: sortWallpapers(WALLPAPERS, 'recent').slice(0, 12) },
      { key: 'editors', title: "Editor's picks", subtitle: 'Hand-picked favourites', items: editorsPicks() },
      { key: 'cat:minimal', title: 'Minimal', subtitle: 'One shape, lots of calm', items: byCategory('minimal') },
      { key: 'darkmode', title: 'AMOLED & dark', subtitle: 'True black for OLED screens', items: resolveCollection('darkmode')!.items().slice(0, 12) },
      { key: 'cat:nature', title: 'Nature', subtitle: 'Auroras, tea hills, contours', items: byCategory('nature') },
      { key: 'cat:mountains', title: 'Mountains', subtitle: 'Layered peaks, dawn to night', items: byCategory('mountains') },
      { key: 'cat:abstract', title: 'Abstract art', subtitle: 'Liquid colour', items: byCategory('abstract') },
      { key: 'cat:retro', title: 'Retro', subtitle: 'Synthwave and 70s stripes', items: byCategory('retro') },
      { key: 'pastel', title: 'Pastel', subtitle: 'Soft and sweet', items: resolveCollection('pastel')!.items() },
      { key: 'cat:luxury', title: 'Luxury', subtitle: 'Marble, gold and velvet', items: byCategory('luxury') },
      { key: 'cat:seasonal', title: 'Seasonal', subtitle: 'Festivals, snow, blossom, monsoon', items: byCategory('seasonal') },
    ],
    [],
  );

  const themeCardW = Math.min(220, width * 0.52);
  const name = state.name.trim();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={type.overline}>{BRAND.appName}</Text>
          <Text style={[type.hero, { marginTop: 4 }]} accessibilityRole="header">
            {greeting()}
            {name ? `, ${name}` : ''}
          </Text>
        </View>
      </View>

      <Tap onPress={() => router.push('/search')} accessibilityRole="search" accessibilityLabel="Search wallpapers, themes and colours" style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchText}>Search colours, moods, themes…</Text>
      </Tap>

      {/* Featured theme */}
      <Tap
        onPress={() => router.push({ pathname: '/theme/[id]', params: { id: featured.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Featured theme: ${featured.name}. ${featured.tagline}`}
        style={styles.hero}
      >
        <Image source={featuredWp.full} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" transition={250} />
        <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
        <View style={styles.heroBody}>
          <Badge label="Theme of the day" />
          <Text style={[type.title, { marginTop: space.sm, color: colors.white }]}>{featured.name}</Text>
          <Text style={[type.bodyMuted, { color: 'rgba(255,255,255,0.8)' }]}>{featured.tagline}</Text>
          <View style={styles.heroFoot}>
            <PaletteDots palette={featured.palette} size={16} />
            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Wallpapers + icons</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.black} />
            </View>
          </View>
        </View>
      </Tap>

      {state.recent.length > 0 && (
        <View style={styles.block}>
          <SectionHeader title="Jump back in" subtitle="Recently viewed" />
          <WallpaperRail items={state.recent.map((id) => getWallpaper(id)!).filter(Boolean).slice(0, 10)} cardWidth={104} />
        </View>
      )}

      {rails.slice(0, 3).map((r) => (
        <View key={r.key} style={styles.block}>
          <SectionHeader title={r.title} subtitle={r.subtitle} onSeeAll={seeAll(r.key)} />
          <WallpaperRail items={r.items} />
        </View>
      ))}

      <View style={styles.block}>
        <SectionHeader title="Matching sets" subtitle="Wallpaper + lock screen + icon pack" onSeeAll={() => router.push('/themes')} />
        <FlatList
          horizontal
          data={THEMES}
          keyExtractor={(t) => t.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}
          renderItem={({ item }) => <ThemeCard t={item} width={themeCardW} />}
        />
      </View>

      {rails.slice(3).map((r) => (
        <View key={r.key} style={styles.block}>
          <SectionHeader title={r.title} subtitle={r.subtitle} onSeeAll={seeAll(r.key)} />
          <WallpaperRail items={r.items} />
        </View>
      ))}

      <Text style={[type.caption, { textAlign: 'center', marginTop: space.lg, paddingHorizontal: space.xl }]}>
        Every design in {BRAND.shortName} is original artwork made by {BRAND.studio}.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.lg, marginBottom: space.md },
  search: {
    marginHorizontal: space.lg,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    gap: 10,
  },
  searchText: { color: colors.textFaint, fontSize: 15 },
  hero: {
    marginHorizontal: space.lg,
    marginTop: space.lg,
    height: 420,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  heroBody: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.lg },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.text,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
  },
  heroCtaText: { color: colors.black, fontWeight: '700', fontSize: 13 },
  block: { marginTop: space.xl },
});
