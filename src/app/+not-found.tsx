import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { EmptyState } from '../components/ui';
import { colors } from '../theme/tokens';

export default function NotFound() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
      <EmptyState icon="compass-outline" title="Lost in the clouds" body="That page doesn’t exist." action={{ label: 'Go to Discover', onPress: () => router.replace('/') }} />
    </View>
  );
}
