import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';

export interface CardProps extends ViewProps {
  /** Ignored (kept for compatibility) — surfaces are flat graphite. */
  gradient?: readonly [string, string, ...string[]];
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Flat hairline surface. Use sparingly — prefer open space and dividers. */
export function Card({ padded = true, style, children, ...rest }: CardProps) {
  return (
    <View {...rest} style={[styles.card, padded && { padding: space.lg }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
});
