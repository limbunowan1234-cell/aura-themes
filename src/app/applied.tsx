import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { colors, radius, space, type } from '../theme/tokens';

/** Shown when the Shortcuts app hands control back via aura://applied */
export default function Applied() {
  const { error } = useLocalSearchParams<{ error?: string }>();
  const failed = !!error;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Dismiss">
      <Pressable style={styles.sheet} accessibilityViewIsModal>
        <View style={[styles.icon, { backgroundColor: failed ? 'rgba(255,107,122,0.15)' : 'rgba(94,227,161,0.15)' }]}>
          <Ionicons name={failed ? 'alert-circle' : 'checkmark-circle'} size={34} color={failed ? colors.danger : colors.success} />
        </View>
        <Text style={[type.title, { textAlign: 'center' }]}>{failed ? 'Shortcut didn’t finish' : 'Shortcut finished'}</Text>
        <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 6 }]}>
          {failed
            ? 'Check that a shortcut named “Aura Apply” exists and that clipboard access is allowed, then try again.'
            : 'Lock your phone or go home to see your new wallpaper.'}
        </Text>
        <Button label={failed ? 'Open setup guide' : 'Done'} onPress={failed ? () => router.replace('/apply-setup') : close} style={{ marginTop: space.lg, alignSelf: 'stretch' }} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end', padding: space.md },
  sheet: { backgroundColor: colors.surfaceRaised, borderRadius: radius.xl, padding: space.xl, alignItems: 'center', marginBottom: space.xl, borderWidth: 1, borderColor: colors.borderStrong },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
});
