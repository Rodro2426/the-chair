import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/tokens';
import { Grain } from '@/components/ui';

const CYCLE_MS = 30_000;

/** Full-bleed photo with a slow, endless Ken Burns zoom/pan and a bottom scrim for legible text. */
export function KenBurnsPhoto({ uri }: { uri: string }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: CYCLE_MS, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(t);
  }, [uri, t]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1.05 + t.value * 0.12 }, { translateX: -14 + t.value * 28 }, { translateY: 10 - t.value * 20 }],
  }));

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={1200} />
      </Animated.View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', colors.bg]}
        locations={[0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Grain opacity={0.5} />
    </>
  );
}
