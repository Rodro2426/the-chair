import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { brand, colors, fonts, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from '@/components/ui';

type Variant = 'primary' | 'quiet' | 'danger';

/** Huge, calm, rectangular button for chair screens. Primary = solid off-white with black mono label. */
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
  const fg = variant === 'primary' ? brand.black : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive }}
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
          {icon ? <Icon name={icon} size={40} color={fg} strokeWidth={2.4} /> : null}
          <Text style={[styles.label, { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>{label.toUpperCase()}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 110, paddingHorizontal: space.xxl, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.text },
  quiet: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  danger: { borderWidth: 2, borderColor: colors.danger },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  disabled: { opacity: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  label: { fontFamily: fonts.monoMedium, fontSize: 34, letterSpacing: 4 },
});
