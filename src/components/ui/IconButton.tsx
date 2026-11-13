import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colorsUi, gradientsUi, shadow } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { accentPalette, type Accent } from './palette';

/** Round glossy icon-only button (back, close, settings...). */
export function IconButton({ name, onPress, accent = 'neutral', size = 44, label }: {
  name: IconName; onPress?: () => void; accent?: Accent; size?: number; label: string;
}) {
  const p = accentPalette[accent];
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={[shadow.button, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.inner, { borderRadius: size / 2 }]}>
        <LinearGradient colors={p.face} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
        <Icon name={name} size={size * 0.45} color={p.label} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colorsUi.highlightEdge },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
});
