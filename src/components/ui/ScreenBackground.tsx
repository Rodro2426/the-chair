import { StyleSheet, View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/tokens';
import { Grain } from './Grain';

/**
 * Graphite with film grain and a barely-there top light. Every screen sits on this.
 * `glow` is kept for compatibility and ignored — the brand is monochrome.
 */
export function ScreenBackground({ children, style, ...rest }: ViewProps & { glow?: 'voice' | 'photo' | 'text' | 'none' }) {
  return (
    <View {...rest} style={[styles.root, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.035)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.18)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Grain />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
});
