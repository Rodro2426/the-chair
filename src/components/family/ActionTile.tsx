import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colorsUi, gradientsUi, radius, shadow, space } from '@/theme/tokens';
import { haptic, Icon, Txt, accentPalette, type Accent, type IconName } from '@/components/ui';

const spring = { damping: 14, stiffness: 340, mass: 0.6 };
const DEPTH = 7;

/** Square-ish chunky 3D tile for the hub's secondary hero actions. */
export function ActionTile({ title, subtitle, icon, accent, onPress, done }: {
  title: string; subtitle: string; icon: IconName; accent: Accent; onPress: () => void; done?: boolean;
}) {
  const p = accentPalette[accent];
  const pressed = useSharedValue(0);
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.value * (DEPTH - 1) }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      onPressIn={() => { pressed.value = withSpring(1, spring); haptic.press(); }}
      onPressOut={() => { pressed.value = withSpring(0, spring); }}
      style={styles.outer}
    >
      <View style={[styles.base, { backgroundColor: p.depth }, shadow.button]} />
      <Animated.View style={[styles.face, face]}>
        <LinearGradient colors={p.face} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
        <View style={styles.edge} pointerEvents="none" />
        <View style={styles.top}>
          <Icon name={icon} size={36} />
          {done && (
            <View style={styles.done}>
              <Icon name="check" size={14} color={p.label} />
              <Txt variant="caption" color={p.label}>Sent today</Txt>
            </View>
          )}
        </View>
        <View>
          <Txt variant="heading" color={p.label} style={{ fontSize: 22 }}>{title}</Txt>
          <Txt variant="caption" color={p.label} style={{ opacity: 0.8 }}>{subtitle}</Txt>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, height: 168 + DEPTH },
  base: { position: 'absolute', left: 0, right: 0, top: DEPTH, height: 168, borderRadius: radius.lg },
  face: { height: 168, borderRadius: radius.lg, overflow: 'hidden', padding: space.md + 2, justifyContent: 'space-between' },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
  edge: { ...StyleSheet.absoluteFill, borderRadius: radius.lg, borderTopWidth: 1.5, borderColor: colorsUi.highlightEdge },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  done: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.pill, backgroundColor: colorsUi.highlightEdge,
  },
});
