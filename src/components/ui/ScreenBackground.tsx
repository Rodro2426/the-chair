import { StyleSheet, View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '@/theme/tokens';

/** Full-screen rich dark gradient with soft colored glows. Every family screen sits on this. */
export function ScreenBackground({ children, style, glow = 'voice', ...rest }: ViewProps & { glow?: 'voice' | 'photo' | 'text' | 'none' }) {
  const glowColor = glow === 'photo' ? colors.secondary : glow === 'text' ? colors.tertiary : colors.primary;
  return (
    <View {...rest} style={[styles.root, style]}>
      <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} />
      {glow !== 'none' && (
        <>
          <View pointerEvents="none" style={[styles.glow, styles.glowTop, { backgroundColor: glowColor }]} />
          <View pointerEvents="none" style={[styles.glow, styles.glowBottom, { backgroundColor: colors.secondary }]} />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  glow: { position: 'absolute', width: 420, height: 420, borderRadius: 210 },
  glowTop: { top: -260, right: -160, opacity: 0.14 },
  glowBottom: { bottom: -300, left: -200, opacity: 0.08 },
});
