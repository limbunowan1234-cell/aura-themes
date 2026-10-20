import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '../theme/tokens';

type Kind = 'success' | 'error' | 'info';
interface ToastMsg {
  text: string;
  kind: Kind;
}

const ToastCtx = createContext<(text: string, kind?: Kind) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (text: string, kind: Kind = 'info') => {
      setMsg({ text, kind });
      AccessibilityInfo.announceForAccessibility(text);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(null));
      }, kind === 'error' ? 4200 : 2600);
    },
    [anim],
  );

  const icon = msg?.kind === 'success' ? 'checkmark-circle' : msg?.kind === 'error' ? 'alert-circle' : 'information-circle';
  const tint = msg?.kind === 'success' ? colors.success : msg?.kind === 'error' ? colors.danger : colors.accentText;

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { top: insets.top + 8, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
          ]}
        >
          <View style={styles.toast} accessibilityLiveRegion="polite">
            <Ionicons name={icon} size={20} color={tint} />
            <Text style={styles.text}>{msg.text}</Text>
          </View>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.md, right: space.md, alignItems: 'center', zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(28,28,34,0.97)',
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    maxWidth: 520,
  },
  text: { color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1 },
});
