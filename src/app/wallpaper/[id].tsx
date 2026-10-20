import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../components/Toast';
import { Badge, Button, EmptyState, IconButton, Tap } from '../../components/ui';
import { WallpaperCard } from '../../components/wallpaper';
import { categoryLabel, getWallpaper, related } from '../../data/catalog';
import { applyViaShortcut, fileNameFor, openAppSettings, saveImageToPhotos, shareImage } from '../../lib/actions';
import { useStore } from '../../store/store';
import { colors, radius, space, type } from '../../theme/tokens';

type Overlay = 'none' | 'lock' | 'home';

export default function WallpaperPreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = getWallpaper(id);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { state, toggleFavWallpaper, markViewed, recordSave } = useStore();
  const toast = useToast();
  const [chrome, setChrome] = useState(true);
  const [overlay, setOverlay] = useState<Overlay>('none');
  const [busy, setBusy] = useState<'save' | 'apply' | 'share' | null>(null);
  const [loaded, setLoaded] = useState(false);
  const fade = React.useRef(new Animated.Value(state.reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (w) markViewed(w.id);
  }, [w, markViewed]);

  useEffect(() => {
    Animated.timing(fade, { toValue: chrome ? 1 : 0, duration: state.reduceMotion ? 0 : 200, useNativeDriver: true }).start();
  }, [chrome, fade, state.reduceMotion]);

  if (!w) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="image-outline" title="Wallpaper not found" body="It may have been removed from the catalogue." action={{ label: 'Go back', onPress: () => router.back() }} />
      </View>
    );
  }

  const fav = state.favWallpapers.includes(w.id);
  const fileName = fileNameFor(w.title);

  const onSave = async () => {
    setBusy('save');
    const r = await saveImageToPhotos(w.full, fileName);
    setBusy(null);
    if (r.ok) {
      recordSave(w.id, 'wallpaper');
      toast('Saved to Photos. Set it from Settings → Wallpaper.', 'success');
    } else if (r.reason === 'denied') {
      Alert.alert('Photos access needed', r.message, [
        { text: 'Not now', style: 'cancel' },
        ...(r.canAskAgain === false ? [{ text: 'Open Settings', onPress: () => openAppSettings() }] : []),
      ]);
    } else toast(r.message, 'error');
  };

  const onApply = async () => {
    if (!state.shortcutReady) {
      router.push({ pathname: '/apply-setup', params: { then: w.id } });
      return;
    }
    setBusy('apply');
    const r = await applyViaShortcut(w.full, fileName);
    setBusy(null);
    if (!r.ok) toast(r.message, 'error');
  };

  const onShare = async () => {
    setBusy('share');
    const r = await shareImage(w.full, fileName);
    setBusy(null);
    if (!r.ok) toast(r.message, 'error');
  };

  const rel = related(w, 10);
  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');

  return (
    <View style={{ flex: 1, backgroundColor: w.dominantColor }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} scrollEnabled={chrome}>
        <Pressable
          onPress={() => setChrome((c) => !c)}
          style={{ width, height }}
          accessibilityRole="image"
          accessibilityLabel={`${w.title}. Tap to ${chrome ? 'hide' : 'show'} controls`}
        >
          <Image source={w.thumb} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Image
            source={w.full}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={state.reduceMotion ? 0 : 250}
            onLoad={() => setLoaded(true)}
            cachePolicy="memory-disk"
            priority="high"
          />

          {overlay === 'lock' && (
            <View pointerEvents="none" style={{ alignItems: 'center', marginTop: insets.top + 40 }}>
              <Text style={styles.lockDate}>{new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
              <Text style={styles.lockTime}>{time}</Text>
            </View>
          )}
          {overlay === 'home' && (
            <View pointerEvents="none" style={[styles.homeGrid, { marginTop: insets.top + 70 }]}>
              {Array.from({ length: 16 }).map((_, i) => (
                <View key={i} style={styles.homeIconCell}>
                  <View style={styles.homeIcon} />
                </View>
              ))}
            </View>
          )}

          {!loaded && (
            <View style={styles.loading} pointerEvents="none">
              <Text style={type.caption}>Loading full resolution…</Text>
            </View>
          )}
        </Pressable>

        <View style={{ backgroundColor: colors.bg, paddingTop: space.xl, paddingBottom: insets.bottom + space.xl }}>
          <Text style={[type.heading, { paddingHorizontal: space.lg, marginBottom: space.md }]}>More like this</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm }}>
            {rel.map((r) => (
              <View key={r.id}>
                <WallpaperCard w={r} width={110} />
              </View>
            ))}
          </ScrollView>
          <Text style={[type.caption, { paddingHorizontal: space.lg, marginTop: space.lg }]}>{w.license}</Text>
          <Text style={[type.caption, { paddingHorizontal: space.lg, marginTop: 4 }]}>
            {w.width} × {w.height} px · JPEG
          </Text>
        </View>
      </ScrollView>

      {/* top bar */}
      <Animated.View pointerEvents={chrome ? 'box-none' : 'none'} style={[styles.top, { paddingTop: insets.top + 6, opacity: fade }]}>
        <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <IconButton icon="chevron-down" label="Close preview" onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <IconButton icon="share-outline" label="Share wallpaper" onPress={onShare} />
          <IconButton icon={fav ? 'heart' : 'heart-outline'} active={fav} label={fav ? 'Remove from favourites' : 'Add to favourites'} onPress={() => toggleFavWallpaper(w.id)} />
        </View>
      </Animated.View>

      {/* bottom panel */}
      <Animated.View pointerEvents={chrome ? 'box-none' : 'none'} style={[styles.bottom, { paddingBottom: insets.bottom + space.md, opacity: fade }]}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.metaRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              <Badge label={categoryLabel(w.category)} color="rgba(255,255,255,0.18)" />
              {w.clockFriendly && <Badge label="Lock-screen ready" color="rgba(155,123,255,0.55)" />}
              {w.premium && <Badge label="Pro" />}
            </View>
            <Text style={[type.title, { color: colors.white }]}>{w.title}</Text>
          </View>
        </View>

        <View style={styles.overlayToggle} accessibilityRole="radiogroup" accessibilityLabel="Preview overlay">
          {(
            [
              ['none', 'Clean'],
              ['lock', 'Lock screen'],
              ['home', 'Home screen'],
            ] as [Overlay, string][]
          ).map(([k, l]) => (
            <Tap
              key={k}
              onPress={() => setOverlay(k)}
              accessibilityRole="radio"
              accessibilityState={{ checked: overlay === k }}
              style={[styles.ovBtn, overlay === k && styles.ovOn]}
            >
              <Text style={[styles.ovText, overlay === k && { color: colors.black }]}>{l}</Text>
            </Tap>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            label={busy === 'save' ? 'Saving…' : 'Save to Photos'}
            icon="download-outline"
            variant="light"
            loading={busy === 'save'}
            onPress={onSave}
            style={{ flex: 1 }}
            accessibilityHint="Adds the full-resolution image to your Photos"
          />
          <Button
            label="Apply"
            icon="flash"
            loading={busy === 'apply'}
            onPress={onApply}
            style={{ flex: 1 }}
            accessibilityHint={state.shortcutReady ? 'Runs your Aura Apply shortcut to set this wallpaper' : 'Opens the one-time setup for one-tap apply'}
          />
        </View>
        <Text style={styles.note}>
          {state.shortcutReady
            ? 'Apply runs your “Aura Apply” shortcut. iOS may ask you to confirm.'
            : 'iPhone apps can’t change your wallpaper on their own. Save it, or set up one-tap Apply once.'}
        </Text>
      </Animated.View>

      {!chrome && (
        <Tap onPress={() => setChrome(true)} accessibilityRole="button" accessibilityLabel="Show controls" style={[styles.showChrome, { bottom: insets.bottom + 20 }]}>
          <Ionicons name="options-outline" size={20} color={colors.white} />
        </Tap>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.md, paddingBottom: space.lg },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: 80 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: space.md },
  overlayToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.pill, padding: 3, marginBottom: space.md, alignSelf: 'flex-start' },
  ovBtn: { paddingHorizontal: 12, height: 32, borderRadius: radius.pill, justifyContent: 'center' },
  ovOn: { backgroundColor: colors.white },
  ovText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: space.sm },
  note: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 16, marginTop: space.sm, textAlign: 'center' },
  loading: { position: 'absolute', alignSelf: 'center', top: '48%', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  lockDate: { color: 'rgba(255,255,255,0.92)', fontSize: 17, fontWeight: '600' },
  lockTime: { color: 'rgba(255,255,255,0.95)', fontSize: 96, fontWeight: '700', letterSpacing: -3, lineHeight: 104 },
  homeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, rowGap: 28 },
  homeIconCell: { width: '25%', alignItems: 'center' },
  homeIcon: { width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.28)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  showChrome: { position: 'absolute', right: space.lg, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
});
