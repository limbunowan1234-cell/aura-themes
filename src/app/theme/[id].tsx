import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomePreview, LockPreview } from '../../components/PhonePreview';
import { useToast } from '../../components/Toast';
import { Button, EmptyState, IconButton, Tap } from '../../components/ui';
import { getTheme, getWallpaper } from '../../data/catalog';
import { ICON_IMAGES, ICON_SLOTS } from '../../data/icons.generated';
import type { Wallpaper } from '../../data/types';
import { fileNameFor, openAppSettings, saveImageToPhotos, saveManyToPhotos } from '../../lib/actions';
import { useStore } from '../../store/store';
import { colors, radius, space, type } from '../../theme/tokens';

function Step({ n, title, body, children }: { n: number; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepHead}>
        <View style={styles.stepN}>
          <Text style={styles.stepNText}>{n}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.heading}>{title}</Text>
          {body ? <Text style={[type.bodyMuted, { marginTop: 2 }]}>{body}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function WallpaperStep({ w, label }: { w: Wallpaper; label: string }) {
  return (
    <Tap
      onPress={() => router.push({ pathname: '/wallpaper/[id]', params: { id: w.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${w.title}. Opens preview with Save and Apply`}
      style={styles.wpRow}
    >
      <Image source={w.thumb} style={styles.wpThumb} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <Text style={type.caption}>{label}</Text>
        <Text style={type.label}>{w.title}</Text>
        <Text style={[type.caption, { marginTop: 4 }]}>Open to save or apply</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Tap>
  );
}

export default function ThemeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = getTheme(id);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state, toggleFavTheme, recordSave } = useStore();
  const toast = useToast();
  const [savingAll, setSavingAll] = useState(false);

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="color-palette-outline" title="Theme not found" body="It may have been renamed." action={{ label: 'Go back', onPress: () => router.back() }} />
      </View>
    );
  }
  const home = getWallpaper(t.homeWallpaper)!;
  const lock = getWallpaper(t.lockWallpaper)!;
  const icons = ICON_IMAGES[t.id];
  const fav = state.favThemes.includes(t.id);
  const pw = Math.min(250, width * 0.62);
  const iconW = Math.floor((Math.min(width, 700) - space.lg * 2 - space.md * 2 - 12 * 3) / 4);

  const permissionAlert = (msg: string, canAskAgain?: boolean) =>
    Alert.alert('Photos access needed', msg, [
      { text: 'Not now', style: 'cancel' },
      ...(canAskAgain === false ? [{ text: 'Open Settings', onPress: () => openAppSettings() }] : []),
    ]);

  const saveAll = async () => {
    setSavingAll(true);
    const r = await saveManyToPhotos(ICON_SLOTS.map((s) => ({ module: icons[s.id], fileName: fileNameFor(`${t.name}-${s.label}`, 'png') })));
    setSavingAll(false);
    if (r.ok) {
      recordSave(t.id, 'icon');
      toast(`${r.count} icons saved to Photos`, 'success');
    } else if (r.reason === 'denied') permissionAlert(r.message, r.canAskAgain);
    else toast(r.message, 'error');
  };

  const saveOne = async (slot: { id: string; label: string }) => {
    const r = await saveImageToPhotos(icons[slot.id], fileNameFor(`${t.name}-${slot.label}`, 'png'));
    if (r.ok) toast(`${slot.label} icon saved`, 'success');
    else if (r.reason === 'denied') permissionAlert(r.message, r.canAskAgain);
    else toast(r.message, 'error');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: space.lg }}>
          <Text style={[type.overline, { color: t.accent }]}>Theme collection</Text>
          <Text style={[type.hero, { marginTop: 4 }]} accessibilityRole="header">
            {t.name}
          </Text>
          <Text style={type.bodyMuted}>{t.tagline}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md, marginTop: space.lg }}>
          <View>
            <HomePreview theme={t} wallpaper={home} width={pw} />
            <Text style={styles.cap}>Home screen</Text>
          </View>
          <View>
            <LockPreview wallpaper={lock} width={pw} />
            <Text style={styles.cap}>Lock screen</Text>
          </View>
        </ScrollView>
        <Text style={[type.caption, { paddingHorizontal: space.lg, marginTop: space.xs }]}>
          Illustrative preview. Your real screen depends on your apps, widgets and iOS settings.
        </Text>

        <View style={{ paddingHorizontal: space.lg, marginTop: space.lg }}>
          <Text style={type.label}>Palette</Text>
          <View style={styles.palette}>
            {t.palette.map((c) => (
              <Tap
                key={c}
                onPress={async () => {
                  await Clipboard.setStringAsync(c);
                  toast(`${c} copied`, 'success');
                }}
                accessibilityRole="button"
                accessibilityLabel={`Colour ${c}. Tap to copy`}
                style={styles.swatchWrap}
              >
                <View style={[styles.swatch, { backgroundColor: c }]} />
                <Text style={styles.hex}>{c.toUpperCase()}</Text>
              </Tap>
            ))}
          </View>
        </View>

        <Text style={[type.title, { paddingHorizontal: space.lg, marginTop: space.xl }]}>Set it up</Text>

        <Step n={1} title="Home-screen wallpaper">
          <WallpaperStep w={home} label="Home screen" />
        </Step>
        <Step n={2} title="Lock-screen wallpaper">
          <WallpaperStep w={lock} label="Lock screen" />
        </Step>
        <Step n={3} title="Matching icons" body="Save the icons, then add them with the Shortcuts app. Each icon takes about 30 seconds.">
          <View style={styles.iconGrid}>
            {ICON_SLOTS.map((s) => (
              <Tap key={s.id} onPress={() => saveOne(s)} accessibilityRole="button" accessibilityLabel={`${s.label} icon. Tap to save to Photos`} style={{ width: iconW, alignItems: 'center' }}>
                <Image source={icons[s.id]} style={{ width: iconW * 0.82, height: iconW * 0.82, borderRadius: iconW * 0.82 * 0.225 }} />
                <Text style={styles.iconLabel} numberOfLines={1}>
                  {s.label}
                </Text>
              </Tap>
            ))}
          </View>
          <Button label={`Save all ${ICON_SLOTS.length} icons`} icon="download-outline" variant="secondary" loading={savingAll} onPress={saveAll} style={{ marginTop: space.md }} />
          <Button
            label="How to add icons"
            icon="help-circle-outline"
            variant="ghost"
            onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'icons' } })}
          />
        </Step>
        <Step n={4} title="Optional: widget look" body="Match your widgets to this palette.">
          <Button
            label="See widget looks"
            icon="grid-outline"
            variant="secondary"
            onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'widgets', theme: t.id } })}
          />
        </Step>
      </ScrollView>

      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <IconButton icon={fav ? 'heart' : 'heart-outline'} active={fav} label={fav ? 'Remove theme from favourites' : 'Save theme to favourites'} onPress={() => toggleFavTheme(t.id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.md },
  cap: { color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  palette: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  swatchWrap: { flex: 1, alignItems: 'center' },
  swatch: { width: '100%', height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong },
  hex: { color: colors.textMuted, fontSize: 11, marginTop: 6, fontVariant: ['tabular-nums'] },
  step: { marginHorizontal: space.lg, marginTop: space.md, padding: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  stepHead: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  stepN: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stepNText: { color: colors.accentText, fontWeight: '800' },
  wpRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  wpThumb: { width: 56, height: 120, borderRadius: radius.sm },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: space.md },
  iconLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});
