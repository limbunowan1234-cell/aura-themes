import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomePreview, LockPreview } from '../../components/PhonePreview';
import { useToast } from '../../components/Toast';
import { Button, Chip, EmptyState, IconButton, Tap } from '../../components/ui';
import { getTheme, getWallpaper } from '../../data/catalog';
import { ICON_GROUPS, ICON_IMAGES, ICON_SLOTS, ICON_VARIANTS, type IconVariant } from '../../data/icons.generated';
import type { Wallpaper } from '../../data/types';
import { fileNameFor, openAppSettings, openShortcutsApp, saveImageToPhotos, saveManyToPhotos } from '../../lib/actions';
import { useStore } from '../../store/store';
import { colors, radius, space, type } from '../../theme/tokens';

const VARIANT_HINTS: Record<IconVariant, string> = {
  signature: 'The theme’s own look, made to sit on its wallpaper.',
  light: 'Soft white tiles. Best with iOS Light appearance.',
  dark: 'Near-black tiles with a glow. Best with iOS Dark appearance.',
  tinted: 'One colour, like iOS tinted icons. Calm and uniform.',
};

type Slot = (typeof ICON_SLOTS)[number];

function Step({
  n,
  title,
  body,
  done,
  onToggle,
  children,
}: {
  n: number;
  title: string;
  body?: string;
  done: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View style={[styles.step, done && styles.stepDone]}>
      <View style={styles.stepHead}>
        <View style={[styles.stepN, done && { backgroundColor: colors.success }]}>
          {done ? <Ionicons name="checkmark" size={16} color={colors.black} /> : <Text style={styles.stepNText}>{n}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.heading}>{title}</Text>
          {body ? <Text style={[type.bodyMuted, { marginTop: 2 }]}>{body}</Text> : null}
        </View>
        {onToggle && (
          <Tap
            onPress={onToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={`Mark “${title}” as ${done ? 'not done' : 'done'}`}
            hitSlop={8}
            style={styles.doneToggle}
          >
            <Text style={[styles.doneToggleText, done && { color: colors.success }]}>{done ? 'Done' : 'Mark done'}</Text>
          </Tap>
        )}
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
  const { state, toggleFavTheme, recordSave, kit, setKitVariant, markIconsSaved, toggleKitStep } = useStore();
  const toast = useToast();
  const [group, setGroup] = useState<string>('essentials');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="color-palette-outline" title="Theme not found" body="It may have been renamed." action={{ label: 'Go back', onPress: () => router.back() }} />
      </View>
    );
  }
  const home = getWallpaper(t.homeWallpaper)!;
  const lock = getWallpaper(t.lockWallpaper)!;
  const k = kit(t.id);
  const variant = (ICON_VARIANTS.some((v) => v.id === k.variant) ? k.variant : 'signature') as IconVariant;
  const variantLabel = ICON_VARIANTS.find((v) => v.id === variant)!.label;
  const icons = ICON_IMAGES[t.id][variant];
  const saved = new Set(k.savedIcons.filter((s) => s.startsWith(`${variant}:`)).map((s) => s.slice(variant.length + 1)));
  const savedAny = k.savedIcons.length > 0;
  const fav = state.favThemes.includes(t.id);
  const pw = Math.min(250, width * 0.62);
  const cols = 5;
  const iconW = Math.floor((Math.min(width, 700) - space.lg * 2 - space.md * 2 - 10 * (cols - 1)) / cols);
  const shown: Slot[] = group === 'all' ? ICON_SLOTS : ICON_SLOTS.filter((s) => s.group === group);
  const groupLabel = group === 'all' ? 'all' : ICON_GROUPS.find((g) => g.id === group)!.label;

  const steps = {
    wallpapers: k.done.includes('wallpapers'),
    style: !!k.variant,
    icons: savedAny,
    homescreen: k.done.includes('homescreen'),
  };
  const doneCount = Object.values(steps).filter(Boolean).length;

  const permissionAlert = (msg: string, canAskAgain?: boolean) =>
    Alert.alert('Photos access needed', msg, [
      { text: 'Not now', style: 'cancel' },
      ...(canAskAgain === false ? [{ text: 'Open Settings', onPress: () => openAppSettings() }] : []),
    ]);

  const fileName = (s: Slot) => fileNameFor(`${t.name}-${variantLabel}-${s.label}`, 'jpg');

  const saveSet = async (list: Slot[]) => {
    setProgress({ done: 0, total: list.length });
    const r = await saveManyToPhotos(
      list.map((s) => ({ module: icons[s.id], fileName: fileName(s) })),
      (done, total) => setProgress({ done, total }),
    );
    setProgress(null);
    const ok = list.slice(0, r.count ?? 0).map((s) => `${variant}:${s.id}`);
    if (ok.length) markIconsSaved(t.id, ok);
    if (r.ok) {
      recordSave(t.id, 'icon');
      toast(`${r.count} ${variantLabel.toLowerCase()} icons saved to Photos`, 'success');
    } else if (r.reason === 'denied') permissionAlert(r.message, r.canAskAgain);
    else toast(r.message, 'error');
  };

  const saveOne = async (s: Slot) => {
    const r = await saveImageToPhotos(icons[s.id], fileName(s));
    if (r.ok) {
      markIconsSaved(t.id, [`${variant}:${s.id}`]);
      toast(`${s.label} icon saved`, 'success');
    } else if (r.reason === 'denied') permissionAlert(r.message, r.canAskAgain);
    else toast(r.message, 'error');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: space.lg }}>
          <Text style={[type.overline, { color: t.accent }]}>Theme install kit</Text>
          <Text style={[type.hero, { marginTop: 4 }]} accessibilityRole="header">
            {t.name}
          </Text>
          <Text style={type.bodyMuted}>{t.tagline}</Text>
          <View style={styles.statRow}>
            <Text style={styles.stat}>2 wallpapers</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>{ICON_SLOTS.length} icons</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>{ICON_VARIANTS.length} icon styles</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md, marginTop: space.lg }}>
          <View>
            <HomePreview theme={t} wallpaper={home} width={pw} variant={variant} />
            <Text style={styles.cap}>Home screen · {variantLabel} icons</Text>
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

        <View style={styles.kitHead}>
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Install kit</Text>
            <Text style={type.caption}>{doneCount === 4 ? 'All set. Enjoy your new look.' : `${doneCount} of 4 steps done`}</Text>
          </View>
          <Text style={[styles.kitPct, { color: t.accent }]}>{Math.round((doneCount / 4) * 100)}%</Text>
        </View>
        <View style={styles.bar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 4, now: doneCount }}>
          <View style={[styles.barFill, { width: `${(doneCount / 4) * 100}%`, backgroundColor: t.accent }]} />
        </View>

        <Step n={1} title="Wallpapers" body="Save or apply the matching home and lock screens." done={steps.wallpapers} onToggle={() => toggleKitStep(t.id, 'wallpapers')}>
          <View style={{ gap: space.md }}>
            <WallpaperStep w={home} label="Home screen" />
            <WallpaperStep w={lock} label="Lock screen" />
          </View>
        </Step>

        <Step n={2} title="Pick an icon style" body={VARIANT_HINTS[variant]} done={steps.style}>
          <View style={styles.variants}>
            {ICON_VARIANTS.map((v) => {
              const on = v.id === variant;
              return (
                <Tap
                  key={v.id}
                  onPress={() => setKitVariant(t.id, v.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${v.label} icon style`}
                  style={[styles.variant, on && { borderColor: t.accent, backgroundColor: colors.surfaceHigh }]}
                >
                  <View style={styles.variantIcons}>
                    {['phone', 'camera', 'music'].map((s) => (
                      <Image key={s} source={ICON_IMAGES[t.id][v.id][s]} style={styles.variantIcon} />
                    ))}
                  </View>
                  <Text style={[styles.variantLabel, on && { color: colors.text }]}>{v.label}</Text>
                </Tap>
              );
            })}
          </View>
        </Step>

        <Step
          n={3}
          title="Save your icons"
          body={`${saved.size} of ${ICON_SLOTS.length} ${variantLabel.toLowerCase()} icons saved. Tap one to save it, or save a whole set.`}
          done={steps.icons}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs, paddingBottom: space.md }}>
            {ICON_GROUPS.map((g) => (
              <Chip key={g.id} label={g.label} selected={group === g.id} onPress={() => setGroup(g.id)} />
            ))}
            <Chip label={`All ${ICON_SLOTS.length}`} selected={group === 'all'} onPress={() => setGroup('all')} />
          </ScrollView>
          <View style={styles.iconGrid}>
            {shown.map((s) => {
              const isSaved = saved.has(s.id);
              return (
                <Tap
                  key={s.id}
                  onPress={() => saveOne(s)}
                  disabled={!!progress}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.label} icon${isSaved ? ', saved' : ''}. Tap to save to Photos`}
                  style={{ width: iconW, alignItems: 'center' }}
                >
                  <View>
                    <Image source={icons[s.id]} style={{ width: iconW * 0.84, height: iconW * 0.84, borderRadius: iconW * 0.84 * 0.225 }} />
                    {isSaved && (
                      <View style={styles.savedBadge}>
                        <Ionicons name="checkmark" size={11} color={colors.black} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.iconLabel} numberOfLines={1}>
                    {s.label}
                  </Text>
                </Tap>
              );
            })}
          </View>
          {progress ? (
            <View style={styles.saving} accessibilityLiveRegion="polite">
              <Text style={type.label}>
                Saving {progress.done} of {progress.total}…
              </Text>
              <View style={[styles.bar, { marginHorizontal: 0, marginTop: space.xs }]}>
                <View style={[styles.barFill, { width: `${(progress.done / progress.total) * 100}%`, backgroundColor: t.accent }]} />
              </View>
            </View>
          ) : (
            <>
              {group !== 'all' && (
                <Button
                  label={`Save ${groupLabel} (${shown.length})`}
                  icon="download-outline"
                  onPress={() => saveSet(shown)}
                  style={{ marginTop: space.md }}
                />
              )}
              <Button
                label={`Save all ${ICON_SLOTS.length} icons`}
                icon="albums-outline"
                variant={group === 'all' ? 'primary' : 'secondary'}
                onPress={() => saveSet(ICON_SLOTS)}
                style={{ marginTop: space.sm }}
              />
            </>
          )}
        </Step>

        <Step
          n={4}
          title="Add them to your Home Screen"
          body="In Shortcuts, make one “Open App” shortcut per app and give it your Aura icon. Start with your dock and most-used apps."
          done={steps.homescreen}
          onToggle={() => toggleKitStep(t.id, 'homescreen')}
        >
          <Button label="Open Shortcuts" icon="open-outline" variant="secondary" onPress={openShortcutsApp} />
          <Button
            label="Step-by-step guide"
            icon="help-circle-outline"
            variant="ghost"
            onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'icons' } })}
          />
        </Step>

        <View style={styles.extra}>
          <Ionicons name="grid-outline" size={18} color={colors.accentText} />
          <View style={{ flex: 1 }}>
            <Text style={type.label}>Optional: widget look</Text>
            <Text style={type.caption}>Match your widgets to this palette.</Text>
          </View>
          <Button
            label="See looks"
            variant="ghost"
            onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'widgets', theme: t.id } })}
          />
        </View>
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
  statRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm },
  stat: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  statDot: { color: colors.textFaint, marginHorizontal: 6 },
  cap: { color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  palette: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  swatchWrap: { flex: 1, alignItems: 'center' },
  swatch: { width: '100%', height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong },
  hex: { color: colors.textMuted, fontSize: 11, marginTop: 6, fontVariant: ['tabular-nums'] },
  kitHead: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.lg, marginTop: space.xl },
  kitPct: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceHigh, marginHorizontal: space.lg, marginTop: space.sm, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  step: { marginHorizontal: space.lg, marginTop: space.md, padding: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  stepDone: { borderColor: 'rgba(94,227,161,0.35)' },
  stepHead: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  stepN: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stepNText: { color: colors.accentText, fontWeight: '800' },
  doneToggle: { minHeight: 28, justifyContent: 'center' },
  doneToggleText: { color: colors.accentText, fontSize: 13, fontWeight: '700' },
  wpRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  wpThumb: { width: 56, height: 120, borderRadius: radius.sm },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  variant: { width: '47%', flexGrow: 1, padding: space.sm, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  variantIcons: { flexDirection: 'row', gap: 6 },
  variantIcon: { flex: 1, maxWidth: 36, aspectRatio: 1, borderRadius: 8 },
  variantLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: space.xs },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, rowGap: space.md },
  iconLabel: { color: colors.textMuted, fontSize: 10.5, marginTop: 4 },
  savedBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  saving: { marginTop: space.md },
  extra: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.lg, marginTop: space.md, paddingLeft: space.md, paddingVertical: space.xs, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
});
