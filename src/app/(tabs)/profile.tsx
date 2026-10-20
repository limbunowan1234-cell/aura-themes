import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Row } from '../../components/ui';
import { BRAND } from '../../config/brand';
import { getWallpaper } from '../../data/catalog';
import { useStore } from '../../store/store';
import { colors, radius, space, type } from '../../theme/tokens';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const kids = React.Children.toArray(children);
  return (
    <View style={{ marginTop: space.xl }}>
      <Text style={[type.overline, { marginLeft: space.lg, marginBottom: space.xs, color: colors.textFaint }]}>{title}</Text>
      <View style={styles.group}>
        {kids.map((c, i) => (
          <View key={i}>
            {i > 0 && <View style={styles.sep} />}
            {c}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { state, set, clearHistory, resetAll } = useStore();
  const savedWallpapers = state.saved.filter((s) => s.kind === 'wallpaper');
  const lastSaved = savedWallpapers[0] ? getWallpaper(savedWallpapers[0].id)?.title : undefined;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ paddingHorizontal: space.lg }}>
        <Text style={type.hero} accessibilityRole="header">
          Profile
        </Text>
        <Text style={type.caption}>Guest · everything stays on this device</Text>
      </View>

      <View style={styles.stats}>
        {[
          [state.favWallpapers.length, 'Favourites'],
          [state.favThemes.length, 'Themes'],
          [savedWallpapers.length, 'Saved'],
        ].map(([n, l]) => (
          <View key={l as string} style={styles.stat} accessible accessibilityLabel={`${n} ${l}`}>
            <Text style={styles.statN}>{n}</Text>
            <Text style={type.caption}>{l}</Text>
          </View>
        ))}
      </View>

      <Group title="You">
        <View style={styles.inputRow}>
          <Text style={[type.body, { width: 110 }]}>Your name</Text>
          <TextInput
            value={state.name}
            onChangeText={(name) => set({ name: name.slice(0, 24) })}
            placeholder="For your greeting"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            returnKeyType="done"
            accessibilityLabel="Your name, used in the greeting"
          />
        </View>
        <Row
          icon="download-outline"
          label="Save history"
          detail={lastSaved ? `Last: ${lastSaved}` : 'None yet'}
          onPress={() => router.push({ pathname: '/collection/[key]', params: { key: 'saved' } })}
        />
      </Group>

      <Group title="Customise your iPhone">
        <Row
          icon="flash-outline"
          label="One-tap Apply setup"
          detail={state.shortcutReady ? 'Ready' : 'Not set up'}
          onPress={() => router.push('/apply-setup')}
        />
        <Row icon="image-outline" label="Set a wallpaper manually" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'wallpaper' } })} />
        <Row icon="apps-outline" label="Custom app icons" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'icons' } })} />
        <Row icon="lock-closed-outline" label="Lock-screen tips" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'lockscreen' } })} />
        <Row icon="grid-outline" label="Widget looks" onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: 'widgets' } })} />
      </Group>

      <Group title="Appearance">
        <View style={styles.inputRow}>
          <Text style={[type.body, { flex: 1 }]}>Reduce motion</Text>
          <Switch
            value={state.reduceMotion}
            onValueChange={(v) => set({ reduceMotion: v })}
            trackColor={{ true: colors.accent, false: colors.surfaceHigh }}
            accessibilityLabel="Reduce motion"
          />
        </View>
      </Group>

      <Group title={`${BRAND.shortName} Pro`}>
        <Row icon="diamond-outline" label="Pro collections" detail="Coming soon" onPress={() => router.push('/premium')} />
      </Group>

      <Group title="About">
        <Row icon="shield-checkmark-outline" label="Privacy policy" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })} />
        <Row icon="document-text-outline" label="Terms of use" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })} />
        <Row icon="brush-outline" label="Artwork & licences" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'licences' } })} />
        <Row icon="mail-outline" label="Contact support" detail={BRAND.supportEmail} onPress={() => Linking.openURL(`mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(BRAND.appName + ' support')}`)} />
        <Row
          icon="trash-outline"
          label="Clear history"
          onPress={() => Alert.alert('Clear history?', 'Recently viewed and save history will be removed. Favourites stay.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearHistory },
          ])}
        />
        <Row
          icon="refresh-outline"
          label="Reset all data"
          danger
          onPress={() => Alert.alert('Reset everything?', 'Favourites, history and settings will be erased from this device.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: resetAll },
          ])}
        />
      </Group>

      <Text style={[type.caption, { textAlign: 'center', marginTop: space.xl }]}>
        {BRAND.appName} {version} · made in Darjeeling by {BRAND.studio}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, marginTop: space.lg },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, borderWidth: 1, borderColor: colors.border },
  statN: { color: colors.text, fontSize: 26, fontWeight: '700' },
  group: { marginHorizontal: space.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: space.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.md },
  input: { flex: 1, color: colors.text, fontSize: 15, textAlign: 'right', minHeight: 44 },
});
