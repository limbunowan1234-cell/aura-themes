import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, type } from '../theme/tokens';
import { IconButton } from './ui';

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.bar}>
        <IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} glass={false} />
        <View style={{ flex: 1 }} />
        {right}
      </View>
      <Text style={[type.hero, { paddingHorizontal: space.lg }]} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={[type.caption, { paddingHorizontal: space.lg, marginTop: 2 }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, paddingBottom: space.md },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, marginBottom: space.xs },
});
