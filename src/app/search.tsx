import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, IconButton, Tap } from '../components/ui';
import { ThemeCard, WallpaperGrid } from '../components/wallpaper';
import { applyQuickFilter, CATEGORIES, QUICK_FILTERS, QuickFilter, search, SEARCH_SUGGESTIONS } from '../data/catalog';
import { colors, radius, space, type } from '../theme/tokens';

export default function Search() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<QuickFilter>('all');
  const dq = q;
  const res = useMemo(() => search(dq), [dq]);
  const wallpapers = useMemo(() => applyQuickFilter(res.wallpapers, filter), [res.wallpapers, filter]);
  const hasQuery = dq.trim().length > 0;

  const header = (
    <View style={{ paddingBottom: space.md }}>
      {hasQuery && res.themes.length > 0 && (
        <View style={{ marginBottom: space.lg }}>
          <Text style={[type.heading, { paddingHorizontal: space.lg, marginBottom: space.sm }]}>Themes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}>
            {res.themes.map((t) => (
              <ThemeCard key={t.id} t={t} width={Math.min(170, width * 0.42)} />
            ))}
          </ScrollView>
        </View>
      )}
      {hasQuery && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 8 }}>
            {QUICK_FILTERS.map((f) => (
              <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />
            ))}
          </ScrollView>
          <Text style={[type.caption, { paddingHorizontal: space.lg, marginTop: space.md }]} accessibilityLiveRegion="polite">
            {wallpapers.length} wallpaper{wallpapers.length === 1 ? '' : 's'}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 6 }}>
      <View style={styles.bar}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} glass={false} />
        <View style={styles.field}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Try “black”, “aurora”, “pastel”"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            accessibilityLabel="Search wallpapers and themes"
          />
        </View>
      </View>

      {!hasQuery ? (
        <ScrollView contentContainerStyle={{ padding: space.lg }} keyboardShouldPersistTaps="handled">
          <Text style={type.label}>Popular searches</Text>
          <View style={styles.wrap}>
            {SEARCH_SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} onPress={() => setQ(s)} icon="trending-up" />
            ))}
          </View>
          <Text style={[type.label, { marginTop: space.xl }]}>Categories</Text>
          <View style={styles.wrap}>
            {CATEGORIES.map((c) => (
              <Tap
                key={c.id}
                onPress={() => router.push({ pathname: '/collection/[key]', params: { key: `cat:${c.id}` } })}
                accessibilityRole="button"
                style={styles.cat}
              >
                <Text style={type.label}>{c.label}</Text>
                <Text style={type.caption} numberOfLines={1}>
                  {c.blurb}
                </Text>
              </Tap>
            ))}
          </View>
        </ScrollView>
      ) : (
        <WallpaperGrid
          items={wallpapers}
          header={header}
          bottomPad={40}
          empty={
            res.themes.length ? undefined : (
              <EmptyState icon="search-outline" title={`No results for “${dq.trim()}”`} body="Try a colour (blue, gold), a mood (calm, neon) or a place (ocean, mountains)." />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, paddingRight: space.lg, marginBottom: space.md },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, height: 46 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.sm },
  cat: { width: '48%', padding: space.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
});
