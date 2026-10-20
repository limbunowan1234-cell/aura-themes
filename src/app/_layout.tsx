import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../components/Toast';
import { StoreProvider, useStore } from '../store/store';
import { colors } from '../theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, primary: colors.accent, border: colors.border },
};

function Gate({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  useEffect(() => {
    if (state.hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [state.hydrated]);
  if (!state.hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider value={navTheme}>
          <ToastProvider>
            <StatusBar style="light" />
            <Gate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="wallpaper/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
                <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
                <Stack.Screen name="applied" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                <Stack.Screen name="search" options={{ animation: 'fade' }} />
              </Stack>
            </Gate>
          </ToastProvider>
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
