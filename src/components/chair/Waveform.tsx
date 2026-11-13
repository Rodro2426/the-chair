import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme/tokens';

const BARS = 7;

function Bar({ index, active, color }: { index: number; active: boolean; color: string }) {
  const v = useSharedValue(0.25);
  useEffect(() => {
    if (active) {
      v.value = withDelay(
        index * 110,
        withRepeat(withTiming(1, { duration: 520 + (index % 3) * 140, easing: Easing.inOut(Easing.sin) }), -1, true),
      );
    } else {
      cancelAnimation(v);
      v.value = withTiming(0.25, { duration: 400 });
    }
    return () => cancelAnimation(v);
  }, [active, index, v]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: v.value }] }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

/** Calm animated waveform shown while a message plays. */
export function Waveform({ active = true, color = colors.text }: { active?: boolean; color?: string }) {
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: BARS }, (_, i) => (
        <Bar key={i} index={i} active={active} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 120, gap: 14 },
  bar: { width: 18, height: 120, borderRadius: radius.pill },
});
