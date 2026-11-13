import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, gradients, radius, shadow, space, type } from '@/theme/tokens';

type Variant = 'primary' | 'quiet' | 'danger';

/** Huge, chunky, tap-friendly button for chair screens. */
export function ChairButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive }}
      style={({ pressed }) => [styles.base, shadow.button, pressed && styles.pressed, inactive && styles.disabled, style]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={gradients.voice} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: variant === 'danger' ? colors.danger : colors.bgElevated }]} />
      )}
      {loading ? (
        <ActivityIndicator color={colors.text} size="large" />
      ) : (
        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
          {icon ? `${icon}  ` : ''}
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 110,
    paddingHorizontal: space.xxl,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pressed: { transform: [{ scale: 0.97 }, { translateY: 4 }] },
  disabled: { opacity: 0.45 },
  label: { ...type.chairBody, color: colors.text },
});
