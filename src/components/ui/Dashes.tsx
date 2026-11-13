import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { colors } from '@/theme/tokens';

export interface Dash {
  angle: number; // radians, 0 = right
  dist: number; // distance from center in sphere radii
  len: number; // px
  thick: number; // px
  rot: number; // extra rotation (radians) on top of radial
  color: string;
  opacity: number;
  gain: number; // how strongly it reacts to level/burst
}

/** Deterministic burst of short bars (+ a few small squares) around a sphere of radius `r`. */
export function makeDashes(r: number, count = 18, seed = 7, accent?: string, keepClearBelow = false): Dash[] {
  let h = seed * 9301 + 49297;
  const rnd = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };
  const out: Dash[] = [];
  for (let i = 0; i < count; i++) {
    const square = i % 6 === 5;
    const inside = !square && i % 4 === 1;
    const angle = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.7;
    let dist = inside ? 0.35 + rnd() * 0.55 : 1.18 + rnd() * 0.75;
    // Leave room for the status text under the sphere.
    if (keepClearBelow && !inside && Math.sin(angle) > 0.45) dist = Math.min(dist, 1.22);
    const len = square ? r * 0.06 : r * (0.08 + rnd() * 0.17);
    out.push({
      angle,
      dist,
      len,
      thick: square ? r * 0.06 : Math.max(3.5, r * (0.035 + rnd() * 0.02)),
      rot: (rnd() - 0.5) * (square ? 1.6 : 0.6),
      color: square ? '#8C8C8C' : accent && i === 3 ? accent : '#FFFFFF',
      opacity: square ? 0.7 : 0.85 + rnd() * 0.15,
      gain: 0.4 + rnd() * 0.9,
    });
  }
  return out;
}

function DashView({ d, r, level, burst, glow }: {
  d: Dash; r: number; level?: SharedValue<number>; burst?: SharedValue<number>; glow?: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const l = level ? level.value : 0;
    const b = burst ? burst.value : 0;
    const g = glow ? glow.value : 0;
    const dist = d.dist * r + l * r * 0.32 * d.gain + b * r * 0.55 * d.gain + g * r * 0.12 * d.gain;
    const x = Math.cos(d.angle) * dist;
    const y = Math.sin(d.angle) * dist;
    return {
      opacity: d.opacity * (1 - b) * (0.75 + Math.min(1, l * 1.6 + g) * 0.25),
      transform: [
        { translateX: x - d.len / 2 },
        { translateY: y - d.thick / 2 },
        { rotate: `${d.angle + d.rot}rad` },
        { scaleX: 1 + l * 0.9 * d.gain + g * 0.25 },
      ],
    };
  });
  return <Animated.View style={[styles.dash, { width: d.len, height: d.thick, backgroundColor: d.color }, style]} />;
}

/**
 * Field of dashes radiating from the center of its (absolute-fill) parent.
 * `level` (mic/voice 0..1) pushes them out and stretches them; `burst` (0..1)
 * flings them outward and fades them; `glow` (0..1) is a calm breathing offset.
 */
export function Dashes({ r, count = 18, seed = 7, accent, level, burst, glow, insideOnly, outsideOnly, keepClearBelow }: {
  r: number; count?: number; seed?: number; accent?: string;
  level?: SharedValue<number>; burst?: SharedValue<number>; glow?: SharedValue<number>;
  insideOnly?: boolean; outsideOnly?: boolean; keepClearBelow?: boolean;
}) {
  const dashes = useMemo(() => makeDashes(r, count, seed, accent, keepClearBelow), [r, count, seed, accent, keepClearBelow]);
  const list = dashes.filter((d) => (insideOnly ? d.dist < 1 : outsideOnly ? d.dist >= 1 : true));
  return (
    <View pointerEvents="none" style={styles.field}>
      <View style={styles.origin}>
        {list.map((d, i) => <DashView key={i} d={d} r={r} level={level} burst={burst} glow={glow} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  origin: { width: 0, height: 0 },
  dash: { position: 'absolute', left: 0, top: 0, borderRadius: 1, backgroundColor: colors.text },
});
