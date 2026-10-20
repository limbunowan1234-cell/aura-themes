import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, Row } from '../../components/ui';
import { ThemeCard } from '../../components/wallpaper';
import { THEMES } from '../../data/catalog';
import { colors, radius, space, type } from '../../theme/tokens';

const MOODS = ['all', 'dark', 'light', 'neon', 'nature', 'minimal', 'warm'];

export default function Themes() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [mood, setMood] = useState('all');
  const cols = width > 600 ? 3 : 2;
  const cardW = Math.floor((Math.min(width, 900) - space.lg * 2 - space.md * (cols - 1)) / cols);
  const items = useMemo(() => (mood === 'all' ? THEMES : THEMES.filter((t) => t.mood.includes(mood))), [mood]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={items}
      key={cols}
      numColumns={cols}
      keyExtractor={(t) => t.id}
      columnWrapperStyle={{ gap: space.md, paddingHorizontal: space.lg }}
      contentContainerStyle={{ gap: space.lg, paddingBottom: 130 }}
      renderItem={({ item }) => <ThemeCard t={item} width={cardW} />}
      ListHeaderComponent={
        <View style={{ paddingTop: insets.top + space.sm }}>
          <View style={{ paddingHorizontal: space.lg }}>
            <Text style={type.hero} accessibilityRole="header">
              Themes
            </Text>
            <Text style={[type.bodyMuted, { marginTop: 4 }]}>
              Complete looks: home wallpaper, lock screen, colour palette and a matching icon pack.
            </Text>
          </View>

          <View style={styles.tools}>
            <Row icon="apps-outline" label="How custom icons work" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'icons' } })} />
            <View style={styles.sep} />
            <Row icon="time-outline" label="Widget looks (preview)" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'widgets' } })} />
            <View style={styles.sep} />
            <Row icon="lock-closed-outline" label="Lock-screen tips" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'lockscreen' } })} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {MOODS.map((m) => (
              <Chip key={m} label={m === 'all' ? 'All' : m[0].toUpperCase() + m.slice(1)} selected={mood === m} onPress={() => setMood(m)} />
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={<EmptyState icon="color-palette-outline" title="No themes here yet" body="Try another mood." />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  tools: {
    marginHorizontal: space.lg,
    marginTop: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 60 },
  chips: { gap: 8, paddingHorizontal: space.lg, paddingVertical: space.lg },
});
