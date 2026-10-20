import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { BRAND } from '../config/brand';
import { getWallpaper } from '../data/catalog';
import { useStore } from '../store/store';
import { colors, radius, space, type } from '../theme/tokens';

const SLIDES = [
  {
    art: ['violet-orb', 'himalayan-dawn', 'molten-glass'],
    title: 'Make your iPhone\nfeel like yours',
    body: `${'100+'} original wallpapers, made in Darjeeling. No sign-up, no ads.`,
  },
  {
    art: ['nero-marquina', 'gilded-lines', 'calacatta'],
    title: 'Complete themes,\nnot just wallpapers',
    body: 'Each theme pairs a home screen, a lock screen, a colour palette and a matching icon pack.',
  },
  {
    art: ['outrun', 'aurora-borealis', 'clay-arch'],
    title: 'Honest, one-tap\napply',
    body: 'Save to Photos anytime, or set up a tiny Shortcut once and apply any wallpaper with a single tap.',
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { set } = useStore();
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const cardW = Math.min(150, width * 0.34);

  const finish = () => {
    set({ onboarded: true });
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.art, { paddingTop: insets.top + space.xl }]}>
        {s.art.map((id, k) => {
          const w = getWallpaper(id);
          if (!w) return null;
          const rot = (k - 1) * 8;
          return (
            <Image
              key={id}
              source={w.thumb}
              style={[
                styles.card,
                { width: cardW, height: cardW * 2.17, transform: [{ rotate: `${rot}deg` }, { translateY: k === 1 ? -16 : 12 }], zIndex: k === 1 ? 2 : 1, marginHorizontal: -cardW * 0.14 },
              ]}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          );
        })}
      </View>
      <LinearGradient colors={['transparent', colors.bg]} style={{ height: 80, marginTop: -80 }} pointerEvents="none" />
      <View style={[styles.body, { paddingBottom: insets.bottom + space.lg }]}>
        <Text style={type.overline}>{BRAND.appName}</Text>
        <Text style={[type.hero, { marginTop: space.sm }]} accessibilityRole="header">
          {s.title}
        </Text>
        <Text style={[type.bodyMuted, { marginTop: space.sm }]}>{s.body}</Text>
        <View style={styles.dots} accessibilityLabel={`Step ${i + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, k) => (
            <View key={k} style={[styles.dot, k === i && styles.dotOn]} />
          ))}
        </View>
        <Button label={i < SLIDES.length - 1 ? 'Continue' : 'Start exploring'} onPress={() => (i < SLIDES.length - 1 ? setI(i + 1) : finish())} />
        {i < SLIDES.length - 1 && <Button label="Skip" variant="ghost" onPress={finish} style={{ marginTop: 4 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.lg, borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)' },
  body: { paddingHorizontal: space.xl },
  dots: { flexDirection: 'row', gap: 6, marginVertical: space.xl },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surfaceHigh },
  dotOn: { width: 22, backgroundColor: colors.accent },
});
