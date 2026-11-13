import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, PanResponder, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming,
} from 'react-native-reanimated';
import { colors, colorsUi, gradientsUi, radius, shadow, space } from '@/theme/tokens';
import { haptic, Icon, Txt, accentPalette, useToast } from '@/components/ui';
import { MAX_RECORDING_MS, useVoiceRecorder, type RecordingResult } from '@/hooks/useVoiceRecorder';
import { formatDuration } from './format';
import { Waveform } from './Waveform';

const CANCEL_DX = -90; // slide left this far to cancel
const CANCEL_DY = -110; // or slide up this far
const spring = { damping: 15, stiffness: 300, mass: 0.7 };

export interface VoiceHoldButtonProps {
  chairName: string;
  onSend: (rec: RecordingResult) => Promise<void>;
  /** Lets the parent disable scrolling while the finger is down. */
  onActiveChange?: (active: boolean) => void;
}

/**
 * Hero "press and hold to talk" control. Hold → records with a live level meter
 * and timer; release → sends; slide left/up → cancel. Hard cap of 2 minutes.
 */
export function VoiceHoldButton({ chairName, onSend, onActiveChange }: VoiceHoldButtonProps) {
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [willCancel, setWillCancel] = useState(false);
  const willCancelRef = useRef(false);

  const rec = useVoiceRecorder((result, reason) => {
    setWillCancel(false);
    willCancelRef.current = false;
    if (reason === 'cancelled') { haptic.warning(); toast.show('Recording discarded'); return; }
    if (reason === 'too-short') { toast.show('Hold the button while you talk'); return; }
    if (reason === 'error' || !result) { toast.show('Couldn’t use the microphone. Please try again.', 'error'); return; }
    if (reason === 'max-length') toast.show('That’s the 2-minute limit — sending it now');
    setSending(true);
    onSend(result).finally(() => setSending(false));
  });

  const recording = rec.phase === 'recording';
  useEffect(() => { onActiveChange?.(rec.isActive); }, [rec.isActive, onActiveChange]);
  useEffect(() => { if (recording) haptic.heavy(); }, [recording]);

  // ---- animations ----
  const press = useSharedValue(0);
  const dragX = useSharedValue(0);
  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.value = recording
      ? withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true)
      : withTiming(0, { duration: 200 });
  }, [recording, breathe]);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: press.value * 6 },
      { translateX: dragX.value * 0.25 },
      { scale: 1 - press.value * 0.02 },
    ],
  }));
  const micStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breathe.value * 0.08 }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: breathe.value * 0.5, transform: [{ scale: 1 + breathe.value * 0.5 }] }));

  // Latest callbacks for the (stable) PanResponder.
  const api = useRef({ rec, sending });
  api.current = { rec, sending };

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !api.current.sending,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => {
      press.value = withSpring(1, spring);
      haptic.press();
      void api.current.rec.start();
    },
    onPanResponderMove: (_e, g) => {
      dragX.value = Math.min(0, g.dx);
      const cancel = g.dx < CANCEL_DX || g.dy < CANCEL_DY;
      if (cancel !== willCancelRef.current) {
        willCancelRef.current = cancel;
        setWillCancel(cancel);
        haptic.select();
      }
    },
    onPanResponderRelease: () => {
      press.value = withSpring(0, spring);
      dragX.value = withSpring(0, spring);
      api.current.rec.finish(willCancelRef.current ? 'cancel' : 'send');
    },
    onPanResponderTerminate: () => {
      press.value = withSpring(0, spring);
      dragX.value = withSpring(0, spring);
      api.current.rec.finish('cancel');
    },
  })).current;

  const p = willCancel && recording ? accentPalette.danger : accentPalette.voice;
  const remaining = MAX_RECORDING_MS - rec.elapsedMs;

  return (
    <View
      {...responder.panHandlers}
      accessibilityRole="button"
      accessibilityLabel={`Hold to record a voice message for ${chairName}`}
      style={styles.outer}
    >
      <View style={[styles.base, { backgroundColor: p.depth }, shadow.button]} />
      <Animated.View style={[styles.face, faceStyle]}>
        <LinearGradient colors={p.face} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
        <View style={styles.edge} pointerEvents="none" />

        {sending ? (
          <View style={styles.center}>
            <ActivityIndicator color={p.label} size="large" />
            <Txt variant="title" color={p.label}>Sending…</Txt>
          </View>
        ) : recording ? (
          <View style={styles.center}>
            <Txt variant="caption" color={p.label} upper style={{ opacity: 0.8 }}>
              {willCancel ? 'Release to cancel' : `Recording for ${chairName}`}
            </Txt>
            <Txt variant="display" color={p.label} style={styles.timer}>{formatDuration(rec.elapsedMs)}</Txt>
            <Waveform levels={rec.levels} color={p.label} height={64} />
            <Txt variant="caption" color={p.label} style={{ opacity: 0.75 }}>
              {willCancel ? '✕ Let go to discard' : remaining < 15_000 ? `${Math.ceil(remaining / 1000)}s left` : '‹ Slide to cancel · Release to send'}
            </Txt>
          </View>
        ) : (
          <View style={styles.idle}>
            <View style={styles.micWrap}>
              <Animated.View style={[styles.halo, haloStyle]} />
              <Animated.View style={[styles.mic, micStyle]}>
                <LinearGradient colors={gradientsUi.gloss} style={StyleSheet.absoluteFill} />
                <Icon name="mic" size={44} />
              </Animated.View>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="caption" color={p.label} upper style={{ opacity: 0.75 }}>Voice message</Txt>
              <Txt variant="title" color={p.label}>
                {rec.phase === 'starting' ? 'Getting ready…' : 'Hold to talk'}
              </Txt>
              <Txt variant="body" color={p.label} style={{ opacity: 0.8 }}>
                {chairName} hears it out loud
              </Txt>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const DEPTH = 8;
const styles = StyleSheet.create({
  outer: { minHeight: 196 + DEPTH },
  base: { position: 'absolute', left: 0, right: 0, top: DEPTH, bottom: 0, borderRadius: radius.xl },
  face: { minHeight: 196, marginBottom: DEPTH, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'center' },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
  edge: { ...StyleSheet.absoluteFill, borderRadius: radius.xl, borderTopWidth: 1.5, borderColor: colorsUi.highlightEdge },
  idle: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.lg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: space.lg },
  timer: { fontVariant: ['tabular-nums'] },
  micWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.text },
  mic: {
    width: 96, height: 96, borderRadius: 48, overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryDeep, borderWidth: 2, borderColor: colorsUi.highlightEdge,
  },
});
