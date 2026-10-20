import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, gradients, HIT, radius, space, type } from '../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Pressable with a gentle press-down scale. */
export function Tap({ style, children, ...rest }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 }]}
    >
      {children as React.ReactNode}
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';

export function Button({
  label,
  icon,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  accessibilityHint,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  const fg = variant === 'light' ? colors.black : variant === 'primary' ? colors.white : colors.text;
  const content = (
    <View style={styles.btnInner}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.btnLabel, { color: fg }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </View>
  );
  return (
    <Tap
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={[styles.btn, disabled && { opacity: 0.45 }, style]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnFill}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.btnFill,
            variant === 'secondary' && { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.borderStrong },
            variant === 'light' && { backgroundColor: colors.text },
            variant === 'ghost' && { backgroundColor: 'transparent' },
          ]}
        >
          {content}
        </View>
      )}
    </Tap>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  active,
  activeColor = colors.pink,
  size = 22,
  style,
  glass = true,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  active?: boolean;
  activeColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  glass?: boolean;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      hitSlop={6}
      style={[styles.iconBtn, glass && styles.iconBtnGlass, style]}
    >
      <Ionicons name={icon} size={size} color={active ? activeColor : colors.text} />
    </Tap>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected && styles.chipOn]}
    >
      {icon && <Ionicons name={icon} size={14} color={selected ? colors.black : colors.textMuted} style={{ marginRight: 6 }} />}
      <Text style={[styles.chipText, selected && { color: colors.black }]}>{label}</Text>
    </Tap>
  );
}

export function SectionHeader({
  title,
  subtitle,
  onSeeAll,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={{ flex: 1 }}>
        <Text style={type.heading} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={[type.caption, { marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {onSeeAll && (
        <Tap onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`} hitSlop={10} style={styles.seeAll}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accentText} />
        </Tap>
      )}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.accentText} />
      </View>
      <Text style={[type.heading, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 6, maxWidth: 300 }]}>{body}</Text>
      {action && <Button label={action.label} onPress={action.onPress} variant="secondary" style={{ marginTop: space.lg }} />}
    </View>
  );
}

export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={[{ backgroundColor: colors.surfaceHigh, opacity: v, borderRadius: radius.md }, style]} />;
}

export function Badge({ label, color = colors.accent }: { label: string; color?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Row({
  icon,
  label,
  detail,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.accentText} />
      </View>
      <Text style={[type.body, { flex: 1 }, danger && { color: colors.danger }]}>{label}</Text>
      {detail ? <Text style={[type.caption, { marginRight: 6 }]}>{detail}</Text> : null}
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />}
    </Tap>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, overflow: 'hidden', minHeight: 52 },
  btnFill: { flex: 1, minHeight: 52, borderRadius: radius.pill, justifyContent: 'center', paddingHorizontal: space.lg },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  iconBtn: { width: HIT, height: HIT, borderRadius: HIT / 2, alignItems: 'center', justifyContent: 'center' },
  iconBtnGlass: { backgroundColor: 'rgba(20,20,24,0.55)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.18)' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  section: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.lg, marginBottom: space.sm },
  seeAll: { flexDirection: 'row', alignItems: 'center', minHeight: 32, paddingLeft: 8 },
  seeAllText: { color: colors.accentText, fontSize: 13, fontWeight: '600', marginRight: 2 },
  empty: { alignItems: 'center', paddingVertical: space.xxxl, paddingHorizontal: space.xl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.md },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.md, gap: 12 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
