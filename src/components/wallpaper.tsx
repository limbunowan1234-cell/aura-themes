import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ThemeCollection, Wallpaper } from '../data/types';
import { getWallpaper } from '../data/catalog';
import { useStore } from '../store/store';
import { colors, radius, space, type, WALLPAPER_RATIO } from '../theme/tokens';
import { Tap } from './ui';

export function openWallpaper(id: string) {
  router.push({ pathname: '/wallpaper/[id]', params: { id } });
}

export const WallpaperCard = memo(function WallpaperCard({
  w,
  width,
  showTitle = true,
  showFav = true,
}: {
  w: Wallpaper;
  width: number;
  showTitle?: boolean;
  showFav?: boolean;
}) {
  const { state, toggleFavWallpaper } = useStore();
  const fav = state.favWallpapers.includes(w.id);
  const [failed, setFailed] = useState(false);
  const height = width * WALLPAPER_RATIO;
  return (
    <Tap
      onPress={() => openWallpaper(w.id)}
      accessibilityRole="imagebutton"
      accessibilityLabel={`${w.title}, ${w.category} wallpaper`}
      accessibilityHint="Opens full-screen preview"
      style={[styles.card, { width, height, backgroundColor: w.dominantColor }]}
    >
      {!failed ? (
        <Image
          source={w.thumb}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
          recyclingKey={w.id}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.failed]}>
          <Ionicons name="image-outline" size={22} color={colors.textFaint} />
        </View>
      )}
      {showTitle && (
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {w.title}
          </Text>
        </LinearGradient>
      )}
      {showFav && (
        <Tap
          onPress={() => toggleFavWallpaper(w.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={fav ? `Remove ${w.title} from favourites` : `Add ${w.title} to favourites`}
          style={styles.fav}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? colors.pink : colors.white} />
        </Tap>
      )}
    </Tap>
  );
});

export function WallpaperRail({ items, cardWidth = 132 }: { items: Wallpaper[]; cardWidth?: number }) {
  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(w) => w.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm }}
      renderItem={({ item }) => <WallpaperCard w={item} width={cardWidth} />}
      initialNumToRender={4}
      windowSize={5}
    />
  );
}

const PAGE = 24;

/** Responsive grid with incremental rendering ("pagination") for large lists. */
export function WallpaperGrid({
  items,
  header,
  empty,
  columns,
  bottomPad = 120,
}: {
  items: Wallpaper[];
  header?: React.ReactElement;
  empty?: React.ReactElement;
  columns?: number;
  bottomPad?: number;
}) {
  const { width } = useWindowDimensions();
  const cols = columns ?? (width > 600 ? 4 : 3);
  const gap = space.sm;
  const cardW = Math.floor((Math.min(width, 900) - space.lg * 2 - gap * (cols - 1)) / cols);
  const [limit, setLimit] = useState(PAGE);
  const data = useMemo(() => items.slice(0, limit), [items, limit]);
  const renderItem: ListRenderItem<Wallpaper> = useCallback(
    ({ item }) => <WallpaperCard w={item} width={cardW} showTitle={false} />,
    [cardW],
  );
  return (
    <FlatList
      key={cols}
      data={data}
      numColumns={cols}
      keyExtractor={(w) => w.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      columnWrapperStyle={{ gap, paddingHorizontal: space.lg }}
      contentContainerStyle={{ gap, paddingBottom: bottomPad }}
      onEndReached={() => limit < items.length && setLimit((l) => l + PAGE)}
      onEndReachedThreshold={0.6}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
    />
  );
}

export function PaletteDots({ palette, size = 12 }: { palette: string[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }} accessibilityElementsHidden>
      {palette.map((c, i) => (
        <View
          key={c + i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c,
            marginLeft: i ? -size * 0.3 : 0,
            borderWidth: 1.5,
            borderColor: colors.surface,
          }}
        />
      ))}
    </View>
  );
}

export function ThemeCard({ t, width }: { t: ThemeCollection; width: number }) {
  const home = getWallpaper(t.homeWallpaper);
  const lock = getWallpaper(t.lockWallpaper);
  const { state, toggleFavTheme } = useStore();
  const fav = state.favThemes.includes(t.id);
  const h = width * 1.25;
  return (
    <Tap
      onPress={() => router.push({ pathname: '/theme/[id]', params: { id: t.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${t.name} theme. ${t.tagline}`}
      style={[styles.theme, { width }]}
    >
      <View style={[styles.themeArt, { height: h, backgroundColor: t.palette[0] }]}>
        {home && <Image source={home.thumb} style={[styles.themeImg, { left: 0 }]} contentFit="cover" cachePolicy="memory-disk" />}
        {lock && (
          <Image
            source={lock.thumb}
            style={[styles.themeImg, { right: 0, width: '46%', top: '12%', bottom: '12%', borderRadius: radius.md, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' }]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}
        <Tap
          onPress={() => toggleFavTheme(t.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={fav ? `Remove ${t.name} from favourites` : `Save ${t.name} to favourites`}
          style={[styles.fav, { top: 10, right: 10 }]}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? colors.pink : colors.white} />
        </Tap>
      </View>
      <View style={{ paddingTop: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={type.label} numberOfLines={1}>
            {t.name}
          </Text>
          <PaletteDots palette={t.palette} size={11} />
        </View>
        <Text style={[type.caption, { marginTop: 2 }]} numberOfLines={1}>
          {t.tagline}
        </Text>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, overflow: 'hidden' },
  failed: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  titleWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingTop: 24, paddingBottom: 10 },
  title: { color: colors.white, fontSize: 12, fontWeight: '700' },
  fav: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  theme: {},
  themeArt: { borderRadius: radius.lg, overflow: 'hidden' },
  themeImg: { position: 'absolute', top: 0, bottom: 0, width: '62%' },
});
