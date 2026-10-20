import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { useToast } from '../components/Toast';
import { Button, Card, Tap } from '../components/ui';
import { BRAND } from '../config/brand';
import { getWallpaper } from '../data/catalog';
import { applyViaShortcut, fileNameFor, openShortcutsApp } from '../lib/actions';
import { useStore } from '../store/store';
import { colors, radius, space, type } from '../theme/tokens';

const STEPS: { title: string; body: string }[] = [
  { title: 'Open Shortcuts', body: 'Tap “Open Shortcuts” below, then tap + to start a new shortcut.' },
  { title: `Name it “${BRAND.applyShortcutName}”`, body: 'Tap the name at the top and type it exactly. Aura runs the shortcut by this name.' },
  { title: 'Add “Get Clipboard”', body: 'Tap “Add Action”, search for Get Clipboard and add it.' },
  {
    title: 'Add “Set Wallpaper Photo”',
    body: 'Search for Set Wallpaper Photo and add it below. It should read “Set Clipboard on Current wallpaper”. Tap the blue words to choose Lock Screen, Home Screen or both.',
  },
  {
    title: 'Optional: skip the preview',
    body: 'Expand the action (tap the arrow) and switch off “Show Preview” so it applies instantly. Leave it on if you like adjusting the crop.',
  },
  { title: 'Tap Done', body: 'The first time it runs, iOS asks to allow clipboard access. Choose “Always Allow” to make Apply one tap.' },
];

export default function ApplySetup() {
  const { then } = useLocalSearchParams<{ then?: string }>();
  const insets = useSafeAreaInsets();
  const { state, set } = useStore();
  const toast = useToast();
  const target = getWallpaper(then) ?? getWallpaper('violet-orb');

  const markReady = async () => {
    set({ shortcutReady: true });
    if (target) {
      const r = await applyViaShortcut(target.full, fileNameFor(target.title));
      if (!r.ok) toast(r.message, 'error');
    } else router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Header title="One-tap Apply" subtitle="A 2-minute, one-time setup" />
        <View style={{ paddingHorizontal: space.lg }}>
          <Card style={{ flexDirection: 'row', gap: space.sm }}>
            <Ionicons name="information-circle" size={22} color={colors.accentText} />
            <Text style={[type.bodyMuted, { flex: 1 }]}>
              Apple doesn’t let apps change your wallpaper directly. Apple’s own Shortcuts app can, so Aura hands the image to a tiny shortcut you create once. After that, Apply is one tap.
            </Text>
          </Card>

          {STEPS.map((s, i) => (
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

          <View style={styles.diagram} accessible accessibilityLabel={`Your finished shortcut: Get Clipboard, then Set Wallpaper Photo to Clipboard`}>
            <Text style={[type.caption, { marginBottom: 8 }]}>Your finished shortcut</Text>
            <View style={styles.action}>
              <Ionicons name="clipboard-outline" size={18} color="#ffb340" />
              <Text style={styles.actionText}>Get Clipboard</Text>
            </View>
            <View style={styles.action}>
              <Ionicons name="image-outline" size={18} color="#5ac8fa" />
              <Text style={styles.actionText}>
                Set <Text style={{ color: '#5ac8fa' }}>Clipboard</Text> on <Text style={{ color: '#5ac8fa' }}>Current</Text> wallpaper
              </Text>
            </View>
          </View>

          <Tap
            onPress={async () => {
              await Clipboard.setStringAsync(BRAND.applyShortcutName);
              toast('Name copied', 'success');
            }}
            accessibilityRole="button"
            accessibilityLabel={`Copy the shortcut name ${BRAND.applyShortcutName}`}
            style={styles.copy}
          >
            <Text style={type.label}>{BRAND.applyShortcutName}</Text>
            <Ionicons name="copy-outline" size={16} color={colors.accentText} />
          </Tap>

          <Button label="Open Shortcuts" icon="open-outline" variant="secondary" onPress={openShortcutsApp} style={{ marginTop: space.lg }} disabled={Platform.OS !== 'ios'} />
          <Button
            label={state.shortcutReady ? 'Test Apply again' : 'I’ve made it — test Apply'}
            icon="flash"
            onPress={markReady}
            style={{ marginTop: space.sm }}
            accessibilityHint={target ? `Applies ${target.title} using your shortcut` : undefined}
          />
          {state.shortcutReady && (
            <Button label="Turn off one-tap Apply" variant="ghost" onPress={() => set({ shortcutReady: false })} style={{ marginTop: space.xs }} />
          )}
          <Text style={[type.caption, { marginTop: space.md, textAlign: 'center' }]}>
            Prefer not to use Shortcuts? Every wallpaper can be saved to Photos and set from Settings → Wallpaper.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  n: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  nText: { color: colors.accentText, fontWeight: '800', fontSize: 13 },
  diagram: { marginTop: space.xl, backgroundColor: '#1c1c1e', borderRadius: radius.lg, padding: space.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#2c2c2e', borderRadius: radius.md, padding: 12, marginTop: 6 },
  actionText: { color: colors.white, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  copy: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    minHeight: 48,
  },
});
