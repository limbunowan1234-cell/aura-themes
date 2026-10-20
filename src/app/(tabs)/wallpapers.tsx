import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, Tap } from '../../components/ui';
import { WallpaperGrid } from '../../components/wallpaper';
import { applyQuickFilter, CATEGORIES, QUICK_FILTERS, QuickFilter, sortWallpapers, WALLPAPERS } from '../../data/catalog';
import type { SortMode } from '../../data/types';
import { colors, radius, space, type } from '../../theme/tokens';

const SORTS: { id: SortMode; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'recent', label: 'Newest' },
  { id: 'az', label: 'A–Z' },
];

export default function Wallpapers() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<string>('all');
  const [filter, setFilter] = useState<QuickFilter>('all');
  const [sort, setSort] = useState<SortMode>('popular');

  const items = useMemo(() => {
    const base = cat === 'all' ? WALLPAPERS : WALLPAPERS.filter((w) => w.category === cat);
    return sortWallpapers(applyQuickFilter(base, filter), sort);
  }, [cat, filter, sort]);

  const header = (
    <View style={{ paddingTop: insets.top + space.sm, paddingBottom: space.sm }}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={type.hero} accessibilityRole="header">
            Wallpapers
          </Text>
          <Text style={type.caption}>{items.length} designs · sized for iPhone</Text>
        </View>
        <Tap onPress={() => router.push('/search')} accessibilityRole="button" accessibilityLabel="Search" style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={colors.text} />
        </Tap>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" selected={cat === 'all'} onPress={() => setCat('all')} />
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} selected={cat === c.id} onPress={() => setCat(c.id)} />
        ))}
      </ScrollView>

      <View style={styles.subRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: space.md }}>
          {QUICK_FILTERS.map((f) => (
            <Tap
              key={f.id}
              onPress={() => setFilter(f.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.id }}
              style={[styles.mini, filter === f.id && styles.miniOn]}
            >
              <Text style={[styles.miniText, filter === f.id && { color: colors.text }]}>{f.label}</Text>
            </Tap>
          ))}
        </ScrollView>
      </View>
      <View style={styles.sortRow} accessibilityRole="radiogroup" accessibilityLabel="Sort order">
        {SORTS.map((s) => (
          <Tap
            key={s.id}
            onPress={() => setSort(s.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: sort === s.id }}
            style={[styles.sort, sort === s.id && styles.sortOn]}
          >
            <Text style={[styles.sortText, sort === s.id && { color: colors.black }]}>{s.label}</Text>
          </Tap>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <WallpaperGrid
        items={items}
        header={header}
        empty={
          <EmptyState
            icon="funnel-outline"
            title="Nothing matches"
            body="Try a different category or clear the filter."
            action={{ label: 'Clear filters', onPress: () => { setCat('all'); setFilter('all'); } }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, marginBottom: space.md },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chips: { gap: 8, paddingHorizontal: space.lg },
  subRow: { paddingLeft: space.lg, marginTop: space.sm },
  mini: { paddingHorizontal: 10, height: 30, borderRadius: radius.pill, justifyContent: 'center' },
  miniOn: { backgroundColor: colors.accentSoft },
  miniText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  sortRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: space.lg,
    marginTop: space.sm,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    padding: 3,
  },
  sort: { paddingHorizontal: 14, height: 32, borderRadius: radius.pill, justifyContent: 'center', minWidth: 44 },
  sortOn: { backgroundColor: colors.text },
  sortText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
});
