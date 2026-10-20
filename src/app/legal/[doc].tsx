import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { BRAND } from '../../config/brand';
import { colors, space, type } from '../../theme/tokens';

const UPDATED = '20 October 2026';

const DOCS: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: {
    title: 'Privacy policy',
    sections: [
      ['Summary', `${BRAND.appName} works without an account and does not collect personal data. There are no ads, analytics or tracking SDKs.`],
      ['What stays on your device', 'Your favourites, recently viewed items, save history, display name and settings are stored only on your iPhone. Deleting the app removes them. You can also erase them from Profile → Reset all data.'],
      ['Photos', 'Aura asks for “Add Photos Only” access so it can save wallpapers and icons you choose. It never reads, uploads or analyses your photo library.'],
      ['Clipboard', 'When you tap Apply, Aura copies the chosen wallpaper to your clipboard so your Shortcut can use it. Aura does not read your clipboard.'],
      ['Shortcuts', 'Apply opens Apple’s Shortcuts app to run a shortcut you created. Aura cannot see or change your other shortcuts.'],
      ['Contact', `Questions: ${BRAND.supportEmail}`],
    ],
  },
  terms: {
    title: 'Terms of use',
    sections: [
      ['Personal use', `Wallpapers and icons in ${BRAND.appName} are licensed to you for personal use on your own devices. Please don’t resell or redistribute them as your own.`],
      ['No guarantees', 'Customisation depends on iOS features controlled by Apple, which can change. Aura provides guidance and tools but can’t guarantee every iOS version behaves the same way.'],
      ['Trademarks', 'Icon packs use generic symbols (Phone, Mail, Camera…). They are not affiliated with, or endorsed by, any app maker.'],
      ['Contact', `${BRAND.studio} · ${BRAND.supportEmail}`],
    ],
  },
  licences: {
    title: 'Artwork & licences',
    sections: [
      ['Wallpapers', `All wallpapers are original procedural artwork created by ${BRAND.studio} for ${BRAND.appName}. No stock or third-party images are used.`],
      ['Icon glyphs', 'Icon packs are composed by Darjeeling Web Studio using glyphs from Ionicons (MIT licence, © Ionic). Brand logos are deliberately not included.'],
      ['Open-source software', 'Built with Expo and React Native (MIT licence) and related open-source libraries, each under its own licence.'],
    ],
  },
};

export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const insets = useSafeAreaInsets();
  const d = DOCS[doc ?? ''] ?? DOCS.privacy;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <Header title={d.title} subtitle={`Last updated ${UPDATED}`} />
      <View style={{ paddingHorizontal: space.lg, gap: space.lg }}>
        {d.sections.map(([h, b]) => (
          <View key={h}>
            <Text style={type.label}>{h}</Text>
            <Text style={[type.bodyMuted, { marginTop: 4 }]}>{b}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
