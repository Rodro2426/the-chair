import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { brand, colors, fonts, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from '@/components/ui';

type Variant = 'primary' | 'quiet' | 'danger';

/** Huge, calm, rectangular button for chair screens. Primary = solid dark-brown with cream mono label. */
export function ChairButton({
  label, onPress, variant = 'primary', disabled, loading, icon, style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;
  // Fit the label to the button's width (adjustsFontSizeToFit doesn't work on web).
  const [w, setW] = useState(0);
  const text = label.toUpperCase();
  const room = w - space.lg * 2 - (icon ? 40 + space.md : 0);
  const fontSize = w ? Math.max(16, Math.min(34, room / (text.length * 0.72))) : 34;
  const fg = variant === 'primary' ? brand.black : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : variant === 'danger' ? styles.danger : styles.quiet,
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="large" />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={Math.round(fontSize * 1.15)} color={fg} strokeWidth={2.4} /> : null}
          <Text style={[styles.label, { color: fg, fontSize, letterSpacing: fontSize * 0.12 }]} numberOfLines={1}>{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 110, paddingHorizontal: space.lg, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.text },
  quiet: { borderWidth: 2, borderColor: 'rgba(47,33,22,0.4)' },
  danger: { borderWidth: 2, borderColor: colors.danger },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  disabled: { opacity: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  label: { fontFamily: fonts.monoMedium, fontSize: 34, letterSpacing: 4 },
});
