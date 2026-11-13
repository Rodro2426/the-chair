import { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, colorsUi, gradients, gradientsUi, radius, shadow } from '@/theme/tokens';
import { haptic } from '@/components/ui';

const THUMB = 34;
const TRACK = 14;

/** Chunky custom slider (0..1). `onChange` fires live, `onCommit` on release. */
export function VolumeSlider({ value, onChange, onCommit }: {
  value: number; onChange?: (v: number) => void; onCommit: (v: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const [local, setLocal] = useState(value);
  const dragging = useRef(false);
  const startV = useRef(value);
  const lastStep = useRef(Math.round(value * 10));
  const refs = useRef({ width, local, onChange, onCommit });
  refs.current = { width, local, onChange, onCommit };

  useEffect(() => { if (!dragging.current) setLocal(value); }, [value]);

  const setFromX = (x: number) => {
    const w = refs.current.width - THUMB;
    if (w <= 0) return refs.current.local;
    const v = Math.min(1, Math.max(0, (x - THUMB / 2) / w));
    const step = Math.round(v * 10);
    if (step !== lastStep.current) { lastStep.current = step; haptic.select(); }
    setLocal(v);
    refs.current.onChange?.(v);
    return v;
  };

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      dragging.current = true;
      startV.current = setFromX(e.nativeEvent.locationX);
    },
    onPanResponderMove: (_e, g) => {
      const w = refs.current.width - THUMB;
      const startX = startV.current * w + THUMB / 2;
      setFromX(startX + g.dx);
    },
    onPanResponderRelease: () => {
      dragging.current = false;
      refs.current.onCommit(refs.current.local);
    },
    onPanResponderTerminate: () => {
      dragging.current = false;
      refs.current.onCommit(refs.current.local);
    },
  })).current;

  const usable = Math.max(0, width - THUMB);
  const left = local * usable;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={styles.wrap}
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(local * 100) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const v = Math.min(1, Math.max(0, local + (e.nativeEvent.actionName === 'increment' ? 0.1 : -0.1)));
        setLocal(v); onCommit(v);
      }}
      {...responder.panHandlers}
    >
      <View pointerEvents="none" style={styles.track}>
        <View style={[styles.fill, { width: left + THUMB / 2 }]}>
          <LinearGradient colors={gradients.voice} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </View>
      </View>
      <View pointerEvents="none" style={[styles.thumb, shadow.button, { left }]}>
        <LinearGradient colors={gradientsUi.gloss} style={StyleSheet.absoluteFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: THUMB + 12, justifyContent: 'center' },
  track: { height: TRACK, borderRadius: radius.pill, backgroundColor: colorsUi.inputBg, borderWidth: 1, borderColor: colorsUi.inputBorder, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  thumb: {
    position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, overflow: 'hidden',
    backgroundColor: colors.text, borderWidth: 2, borderColor: colorsUi.highlightEdge,
  },
});
