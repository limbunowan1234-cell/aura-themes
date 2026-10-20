import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tap } from '../../components/ui';
import { useStore } from '../../store/store';
import { colors, radius } from '../../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: Record<string, { label: string; icon: IconName; iconOn: IconName }> = {
  index: { label: 'Discover', icon: 'sparkles-outline', iconOn: 'sparkles' },
  wallpapers: { label: 'Wallpapers', icon: 'images-outline', iconOn: 'images' },
  themes: { label: 'Themes', icon: 'color-palette-outline', iconOn: 'color-palette' },
  favorites: { label: 'Favourites', icon: 'heart-outline', iconOn: 'heart' },
  profile: { label: 'Profile', icon: 'person-circle-outline', iconOn: 'person-circle' },
};

function AuraTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 6, 10) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, i) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === i;
          return (
            <Tap
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={styles.tab}
            >
              <View style={[styles.pill, focused && styles.pillOn]}>
                <Ionicons name={focused ? meta.iconOn : meta.icon} size={21} color={focused ? colors.text : colors.textFaint} />
              </View>
              <Text style={[styles.label, focused && { color: colors.text }]} numberOfLines={1}>
                {meta.label}
              </Text>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { state } = useStore();
  if (!state.onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs tabBar={(p) => <AuraTabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wallpapers" />
      <Tabs.Screen name="themes" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  bar: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'web' ? 'rgba(18,18,22,0.96)' : 'rgba(18,18,22,0.94)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 8,
    paddingHorizontal: 4,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  tab: { flex: 1, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  pill: { width: 48, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.accentSoft },
  label: { fontSize: 10, fontWeight: '600', color: colors.textFaint, marginTop: 2 },
});
