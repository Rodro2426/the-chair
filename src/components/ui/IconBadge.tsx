import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colorsUi, gradientsUi, shadow } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { accentPalette, type Accent } from './palette';

/** Rounded gradient tile holding an icon — like a glossy app icon. */
export function IconBadge({ name, accent = 'voice', size = 56 }: { name: IconName; accent?: Accent; size?: number }) {
  const p = accentPalette[accent];
  return (
    <View style={[shadow.button, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <View style={[styles.tile, { borderRadius: size * 0.32 }]}>
        <LinearGradient colors={p.face} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
        <Icon name={name} size={size * 0.5} color={p.label} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colorsUi.highlightEdge },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
});
