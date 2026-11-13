import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Dashes, Sphere } from '@/components/ui';

/**
 * The chair's sphere. At rest it simply sits in its well. While a message plays
 * it breathes slowly (a soft halo swells, dashes drift outward and back) — calm,
 * never flashy.
 */
export function ChairSphere({ size, active, dashes = true }: { size: number; active?: boolean; dashes?: boolean }) {
  const glow = useSharedValue(0);
  useEffect(() => {
    if (active) {
      glow.value = withRepeat(withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ), -1);
    } else {
      cancelAnimation(glow);
      glow.value = withTiming(0, { duration: 800 });
    }
    return () => cancelAnimation(glow);
  }, [active, glow]);

  const ring = Math.round(size * 0.075);
  const well = size + ring * 2;
  const halo = useAnimatedStyle(() => ({ opacity: glow.value * 0.55, transform: [{ scale: 0.9 + glow.value * 0.15 }] }));
  const H = well * 1.6;
  const body = useAnimatedStyle(() => ({ transform: [{ scale: 1 + glow.value * 0.025 }] }));

  return (
    <View style={{ width: well * 1.9, height: well * 1.5, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
      <Animated.View style={[styles.halo, { width: H, height: H }, halo]}>
        <Svg width={H} height={H}>
          <Defs>
            <RadialGradient id="chairHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.22" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={H / 2} cy={H / 2} r={H / 2} fill="url(#chairHalo)" />
        </Svg>
      </Animated.View>
      <Animated.View style={body}>
        <Sphere size={size} ring={ring} />
      </Animated.View>
      {dashes ? <Dashes r={size / 2} glow={glow} count={16} seed={11} keepClearBelow /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute' },
});
