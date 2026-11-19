import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '@/theme/tokens';
import { Grain } from './Grain';

/**
 * Graphite with film grain and a barely-there top light. Every screen sits on this.
 * `glow` is kept for compatibility and ignored — the brand is monochrome.
 */
export function ScreenBackground({ children, style, ...rest }: ViewProps & { glow?: 'voice' | 'photo' | 'text' | 'none' }) {
  return (
    <View {...rest} style={[styles.root, style]}>
      <Grain />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
});
