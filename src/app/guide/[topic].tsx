import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Button, Card, Chip, EmptyState } from '../../components/ui';
import { getTheme, THEMES } from '../../data/catalog';
import type { ThemeCollection } from '../../data/types';
import { openShortcutsApp } from '../../lib/actions';
import { colors, radius, space, type } from '../../theme/tokens';

type Step = { title: string; body: string };

const GUIDES: Record<string, { title: string; subtitle: string; intro?: string; steps: Step[]; notes?: string[] }> = {
  wallpaper: {
    title: 'Set a wallpaper',
    subtitle: 'The manual way, no Shortcuts needed',
    steps: [
      { title: 'Save it', body: 'Open any wallpaper in Aura and tap “Save to Photos”.' },
      { title: 'Open Settings → Wallpaper', body: 'Tap “Add New Wallpaper”, then choose Photos.' },
      { title: 'Pick the image', body: 'Choose the Aura wallpaper you just saved. Pinch to adjust the crop if you like.' },
      { title: 'Tap Add', body: 'Choose “Set as Wallpaper Pair” to use it on both screens, or customise the Home Screen separately.' },
    ],
    notes: ['Aura wallpapers are 1179 × 2556 px, matching the 19.5:9 shape of modern iPhones, so they fill the screen without stretching.'],
  },
  icons: {
    title: 'Custom app icons',
    subtitle: 'How it really works on iPhone',
    intro:
      'iOS doesn’t allow any app to swap your app icons automatically. The supported way is a Shortcuts bookmark: it shows your custom icon on the Home Screen and opens the real app when tapped.',
    steps: [
      { title: 'Save the icons', body: 'In a theme, tap “Save all icons”. They land in your Photos.' },
      { title: 'New shortcut', body: 'Open Shortcuts, tap +, add the action “Open App” and pick the app (for example, Messages).' },
      { title: 'Add to Home Screen', body: 'Tap the share/settings menu at the top, choose “Add to Home Screen”.' },
      { title: 'Choose your icon', body: 'Tap the small icon, choose “Choose Photo”, select the matching Aura icon and type the app name.' },
      { title: 'Tidy up', body: 'Move the original app to the App Library (long-press → Remove App → Remove from Home Screen). Nothing is deleted.' },
    ],
    notes: [
      'Each icon is one shortcut, so do your most-used apps first.',
      'Notification badges don’t appear on shortcut icons. That’s an iOS limit.',
      'Prefer zero setup? On iOS 18 and later, long-press the Home Screen → Edit → Customize → Tinted, then pick your theme’s accent colour.',
    ],
  },
  lockscreen: {
    title: 'Lock-screen tips',
    subtitle: 'Get a clean clock and a nice crop',
    steps: [
      { title: 'Choose a “Lock-screen ready” design', body: 'These have a calm area at the top so the clock stays readable. Filter for them in Wallpapers.' },
      { title: 'Preview with the clock', body: 'In any wallpaper, switch the preview to “Lock screen” to see where the time will sit.' },
      { title: 'Customise the clock in iOS', body: 'Long-press the Lock Screen → Customize → Lock Screen. Tap the time to pick a font and colour that matches.' },
      { title: 'Pair it', body: 'Each Aura theme has a lock-screen design picked to go with its home wallpaper.' },
    ],
    notes: ['The clock font, widgets and controls on the Lock Screen are set by iOS. Aura can’t change them, but the palette in each theme makes matching easy.'],
  },
};

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const QUOTES = ['Slow down. You’re doing fine.', 'Make it simple, make it yours.', 'Little by little, a little becomes a lot.'];

function WidgetLooks({ theme }: { theme: ThemeCollection }) {
  const { width } = useWindowDimensions();
  const now = useClock();
  const small = (Math.min(width, 600) - space.lg * 2 - space.md) / 2;
  const [bg, mid, accent, light] = theme.palette;
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay() + i);
    return d;
  });
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={[styles.w, { width: small, height: small, backgroundColor: bg }]} accessible accessibilityLabel="Digital clock widget design">
          <Text style={{ color: accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>{now.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</Text>
          <Text style={{ color: light, fontSize: small * 0.26, fontWeight: '200', letterSpacing: -1 }}>{time}</Text>
        </View>
        <View style={[styles.w, { width: small, height: small, backgroundColor: mid, alignItems: 'center' }]} accessible accessibilityLabel="Minimal date widget design">
          <Text style={{ color: light, fontSize: 13, fontWeight: '600', opacity: 0.8 }}>{now.toLocaleDateString([], { month: 'long' })}</Text>
          <Text style={{ color: light, fontSize: small * 0.38, fontWeight: '700' }}>{now.getDate()}</Text>
        </View>
      </View>
      <View style={[styles.w, { height: small, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: space.md }]} accessible accessibilityLabel="Week calendar widget design">
        {days.map((d) => {
          const today = d.toDateString() === now.toDateString();
          return (
            <View key={d.toISOString()} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: light, opacity: 0.6, fontSize: 11 }}>{d.toLocaleDateString([], { weekday: 'narrow' })}</Text>
              <View style={[styles.day, today && { backgroundColor: accent }]}>
                <Text style={{ color: today ? bg : light, fontWeight: '700' }}>{d.getDate()}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={[styles.w, { height: small * 0.8, backgroundColor: mid }]} accessible accessibilityLabel="Quote widget design">
        <Ionicons name="sparkles" size={16} color={accent} />
        <Text style={{ color: light, fontSize: 17, fontWeight: '600', marginTop: 8 }}>{QUOTES[now.getDate() % QUOTES.length]}</Text>
      </View>
    </View>
  );
}

export default function Guide() {
  const { topic, theme: themeId } = useLocalSearchParams<{ topic: string; theme?: string }>();
  const insets = useSafeAreaInsets();
  const [themeSel, setThemeSel] = useState(themeId ?? THEMES[0].id);

  if (topic === 'widgets') {
    const t = getTheme(themeSel) ?? THEMES[0];
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Header title="Widget looks" subtitle="Design previews in each theme’s palette" />
        <View style={{ paddingHorizontal: space.lg }}>
          <Card style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.lg }}>
            <Ionicons name="construct-outline" size={20} color={colors.warning} />
            <Text style={[type.bodyMuted, { flex: 1 }]}>
              These are previews inside Aura, not installable widgets yet. Real Home Screen widgets are planned for a later version. For now, recreate a look with iOS’s built-in Clock, Calendar and Photos widgets and your theme colours.
            </Text>
          </Card>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: space.lg, paddingBottom: space.lg }}>
          {THEMES.map((th) => (
            <Chip key={th.id} label={th.name} selected={th.id === t.id} onPress={() => setThemeSel(th.id)} />
          ))}
        </ScrollView>
        <View style={{ paddingHorizontal: space.lg }}>
          <WidgetLooks theme={t} />
        </View>
      </ScrollView>
    );
  }

  const g = GUIDES[topic ?? ''];
  if (!g) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="book-outline" title="Guide not found" body="Try another guide from your Profile." action={{ label: 'Go back', onPress: () => router.back() }} />
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <Header title={g.title} subtitle={g.subtitle} />
      <View style={{ paddingHorizontal: space.lg }}>
        {g.intro && (
          <Card style={{ flexDirection: 'row', gap: space.sm }}>
            <Ionicons name="information-circle" size={22} color={colors.accentText} />
            <Text style={[type.bodyMuted, { flex: 1 }]}>{g.intro}</Text>
          </Card>
        )}
        {g.steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.n}>
              <Text style={styles.nText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.label}>{s.title}</Text>
              <Text style={[type.bodyMuted, { marginTop: 2 }]}>{s.body}</Text>
            </View>
          </View>
        ))}
        {topic === 'icons' && <Button label="Open Shortcuts" icon="open-outline" variant="secondary" onPress={openShortcutsApp} style={{ marginTop: space.xl }} />}
        {g.notes?.map((n) => (
          <View key={n} style={styles.note}>
            <Ionicons name="bulb-outline" size={16} color={colors.warning} />
            <Text style={[type.caption, { flex: 1, fontSize: 13, lineHeight: 18 }]}>{n}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  n: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  nText: { color: colors.accentText, fontWeight: '800', fontSize: 13 },
  note: { flexDirection: 'row', gap: 8, marginTop: space.lg, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface },
  w: { borderRadius: 24, padding: 16, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  day: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
});
