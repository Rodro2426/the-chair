import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors, colorsUi, radius, space } from '@/theme/tokens';
import type { Chair } from '@/types';
import { Txt } from '@/components/ui';
import { useNow } from '@/hooks/useNow';
import { isChairOnline, lastSeenLabel } from './format';

/** "● In the chair" pill with a breathing dot when the chair heartbeat is fresh. */
export function OnlinePill({ chair }: { chair: Chair }) {
  const now = useNow(15_000);
  const online = isChairOnline(chair, now);
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = online ? withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false) : 0;
  }, [online, pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 1.6 }] }));
  const color = online ? colors.success : colors.textFaint;
  return (
    <View style={styles.pill}>
      <View style={styles.dotWrap}>
        {online && <Animated.View style={[styles.dot, { backgroundColor: color, position: 'absolute' }, ring]} />}
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <Txt variant="caption" color={online ? colors.success : colors.textMuted}>{lastSeenLabel(chair, now)}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start',
    paddingHorizontal: space.md, paddingVertical: 6, borderRadius: radius.pill,
    backgroundColor: colorsUi.inputBg, borderWidth: 1, borderColor: colors.cardBorder,
  },
  dotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
