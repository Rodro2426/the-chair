import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradientsUi, radius, shadow, space } from '@/theme/tokens';

export interface CardProps extends ViewProps {
  /** Optional colored gradient fill instead of the default glossy dark card. */
  gradient?: readonly [string, string, ...string[]];
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Glossy elevated surface. */
export function Card({ gradient, padded = true, style, children, ...rest }: CardProps) {
  return (
    <View {...rest} style={[styles.card, shadow.card, padded && { padding: space.lg }, style]}>
      {gradient && <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <LinearGradient colors={gradient ? gradientsUi.gloss : gradientsUi.glossSoft} style={styles.gloss} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
});
