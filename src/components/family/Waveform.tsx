import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '@/theme/tokens';

function Bar({ level, color, height }: { level: number; color: string; height: number }) {
  const style = useAnimatedStyle(() => ({
    height: withSpring(Math.max(4, level * height), { damping: 18, stiffness: 400 }),
  }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

/** Live level-meter bars (0..1 values, newest on the right). */
export function Waveform({ levels, color = colors.text, height = 56 }: { levels: number[]; color?: string; height?: number }) {
  return (
    <View style={[styles.row, { height }]}>
      {levels.map((l, i) => <Bar key={i} level={l} color={color} height={height} />)}
    </View>
  );
}

/** Static waveform for a voice bubble, progress-colored. Deterministic from a seed. */
export function StaticWaveform({ seed, progress, color, dim, bars = 28, height = 28 }: {
  seed: string; progress: number; color: string; dim: string; bars?: number; height?: number;
}) {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 9973;
  const values = Array.from({ length: bars }, (_, i) => {
    h = (h * 77 + 13 + i) % 9973;
    return 0.25 + ((h % 100) / 100) * 0.75;
  });
  return (
    <View style={[styles.row, { height, gap: 2.5 }]}>
      {values.map((v, i) => (
        <View key={i} style={[styles.bar, { height: v * height, backgroundColor: i / bars < progress ? color : dim }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'center' },
  bar: { width: 4, borderRadius: 2 },
});
