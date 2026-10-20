import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconButton } from '../components/ui';
import { BRAND } from '../config/brand';
import { getWallpaper } from '../data/catalog';
import { colors, radius, space, type } from '../theme/tokens';

const PERKS: [React.ComponentProps<typeof Ionicons>['name'], string, string][] = [
  ['images-outline', 'Exclusive collections', 'New original series every month'],
  ['apps-outline', 'More icon packs', 'Extra symbols and alternate styles'],
  ['color-palette-outline', 'More theme sets', 'Additional matching wallpaper + icon combos'],
  ['heart-outline', 'Support the studio', 'Help a small studio from Darjeeling keep making art'],
];

/**
 * Pro is not on sale yet: this screen deliberately has no purchase button.
 * When subscriptions arrive they will use Apple In-App Purchase with clear pricing,
 * renewal terms and Restore Purchases.
 */
export default function Premium() {
  const insets = useSafeAreaInsets();
  const art = getWallpaper('aura-bloom') ?? getWallpaper('molten-glass');
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.hero}>
          {art && <Image source={art.full} style={StyleSheet.absoluteFill} contentFit="cover" />}
          <LinearGradient colors={['rgba(8,8,10,0.1)', colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', bottom: space.lg, left: space.lg, right: space.lg }}>
            <Text style={type.overline}>Coming soon</Text>
            <Text style={[type.hero, { marginTop: 4 }]}>{BRAND.shortName} Pro</Text>
            <Text style={type.bodyMuted}>Everything in Aura is free right now. Pro will add more, never take away.</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
          {PERKS.map(([icon, t, b]) => (
            <View key={t} style={styles.perk}>
              <View style={styles.perkIcon}>
                <Ionicons name={icon} size={20} color={colors.accentText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.label}>{t}</Text>
                <Text style={type.caption}>{b}</Text>
              </View>
            </View>
          ))}
          <Button label="Keep exploring for free" onPress={() => router.back()} style={{ marginTop: space.md }} />
          <Text style={[type.caption, { textAlign: 'center' }]}>No purchase is available yet. Nothing will be charged.</Text>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', top: insets.top + 6, left: space.md }}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 380, marginBottom: space.lg },
  perk: { flexDirection: 'row', gap: space.md, alignItems: 'center', padding: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  perkIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
