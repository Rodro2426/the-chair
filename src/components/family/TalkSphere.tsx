import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { colors, space } from '@/theme/tokens';
import { Dashes, ExtrudedCheck, PressableScale, Sphere, Txt, haptic, hapticTick, useToast } from '@/components/ui';
import { MAX_RECORDING_MS, useVoiceRecorder, type RecordingResult } from '@/hooks/useVoiceRecorder';
import { mmss, shortName } from './format';

export type SpherePhase = 'idle' | 'holding' | 'sending' | 'sent' | 'cancelled' | 'short' | 'failed';

export interface TalkSphereProps {
  /** Grandparent's name. Undefined = no chair linked (sphere goes hollow). */
  chairName?: string;
  /** Upload + send. Throw to signal failure. */
  onSend: (rec: RecordingResult) => Promise<void>;
  onActiveChange?: (active: boolean) => void;
  /** Tap target when no chair is linked. */
  onDisabledPress?: () => void;
  /** Latest message has been played on the chair. */
  heard?: boolean;
  loading?: boolean;
  /** Sphere diameter. */
  size?: number;
  /** Preview/testing only: force a visual state. */
  demo?: { phase: SpherePhase; elapsedMs?: number; level?: number; willCancel?: boolean };
}

const CANCEL_DIST = 120; // drag this far from where you pressed → cancel
const SENT_HOLD_MS = 2500;
const spring = { damping: 14, stiffness: 260, mass: 0.7 };

/**
 * The home hero. Press and HOLD the sphere to talk; it sinks into its well,
 * a progress arc fills, the dashes breathe with your voice and light haptic
 * ticks keep time. Slide away to cancel. Release to send → the sphere
 * "completes" with an extruded check and the dashes burst.
 */
export function TalkSphere({ chairName, onSend, onActiveChange, onDisabledPress, heard, loading, size = 240, demo }: TalkSphereProps) {
  const toast = useToast();
  const disabled = !chairName;
  const [ui, setUi] = useState<SpherePhase>('idle');
  const [willCancel, setWillCancel] = useState(false);
  const willCancelRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const press = useSharedValue(0);
  const level = useSharedValue(0);
  const burst = useSharedValue(0);
  const check = useSharedValue(0);
  const breathe = useSharedValue(0);

  const settle = useCallback((next: SpherePhase, ms: number) => {
    setUi(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setUi('idle'), ms);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const complete = useCallback(() => {
    haptic.success();
    setUi('sent');
    check.value = withSpring(1, { damping: 9, stiffness: 180, mass: 0.6 });
    burst.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      check.value = withTiming(0, { duration: 260 });
      burst.value = withDelay(120, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
      setUi('idle');
    }, SENT_HOLD_MS);
  }, [burst, check]);

  const rec = useVoiceRecorder((result, reason) => {
    setWillCancel(false);
    willCancelRef.current = false;
    if (reason === 'cancelled') { haptic.warning(); settle('cancelled', 1600); return; }
    if (reason === 'too-short') { settle('short', 1800); return; }
    if (reason === 'mic-ready') { toast.show('Microphone ready — press and hold to talk', 'success'); return; }
    if (reason === 'denied') { toast.show('Microphone access is blocked — allow it in your browser settings.', 'error'); return; }
    if (reason === 'error' || !result) { haptic.error(); toast.show('Couldn’t use the microphone. Please try again.', 'error'); settle('failed', 2200); return; }
    if (reason === 'max-length') toast.show('That’s the 2-minute limit — sending it now');
    setUi('sending');
    onSend(result).then(complete, () => { haptic.error(); settle('failed', 2400); });
  });

  const recording = rec.phase === 'recording';
  const phase: SpherePhase = demo?.phase ?? (rec.isActive ? 'holding' : ui);
  const cancelArmed = demo?.willCancel ?? willCancel;
  const elapsed = demo?.elapsedMs ?? rec.elapsedMs;

  useEffect(() => { onActiveChange?.(rec.isActive); }, [rec.isActive, onActiveChange]);

  // Haptic metronome while recording — light, then firmer as you near the limit.
  useEffect(() => {
    if (!recording) return;
    haptic.heavy();
    const t0 = Date.now();
    const id = setInterval(() => {
      const e = Date.now() - t0;
      hapticTick(e < 20_000 ? 0 : e < MAX_RECORDING_MS - 15_000 ? 1 : 2);
    }, 400);
    return () => clearInterval(id);
  }, [recording]);

  // Mic level → dashes.
  const lastLevel = rec.levels[rec.levels.length - 1] ?? 0;
  useEffect(() => {
    if (demo) return;
    level.value = withTiming(recording ? lastLevel : 0, { duration: recording ? 110 : 300 });
  }, [demo, recording, lastLevel, level]);

  // Sending: slow breathe.
  useEffect(() => {
    breathe.value = phase === 'sending'
      ? withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })), -1)
      : withTiming(0, { duration: 250 });
  }, [phase, breathe]);

  // Demo states (preview route).
  useEffect(() => {
    if (!demo) return;
    press.value = demo.phase === 'holding' ? (demo.willCancel ? 0.3 : 1) : 0;
    level.value = demo.level ?? 0;
    burst.value = demo.phase === 'sent' ? 0.42 : 0;
    check.value = demo.phase === 'sent' ? 1 : 0;
  }, [demo, press, level, burst, check]);

  const sphereStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.055 + level.value * press.value * 0.018 - breathe.value * 0.02 }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, check.value * 1.4),
    transform: [{ scale: 0.4 + check.value * 0.6 }, { rotate: `${(1 - check.value) * -14}deg` }],
  }));

  // Stable responder reading the latest values through a ref.
  const api = useRef({ rec, phase, disabled });
  api.current = { rec, phase, disabled };
  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => {
      const p = api.current.phase;
      return !api.current.disabled && (p === 'idle' || p === 'cancelled' || p === 'short' || p === 'failed');
    },
    onMoveShouldSetPanResponder: () => false,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => {
      clearTimeout(timer.current);
      setUi('idle');
      press.value = withSpring(1, spring);
      haptic.press();
      void api.current.rec.start();
    },
    onPanResponderMove: (_e, g) => {
      const cancel = Math.hypot(g.dx, g.dy) > CANCEL_DIST || g.dy < -90;
      if (cancel !== willCancelRef.current) {
        willCancelRef.current = cancel;
        setWillCancel(cancel);
        press.value = withSpring(cancel ? 0.25 : 1, spring);
        haptic.select();
      }
    },
    onPanResponderRelease: () => {
      press.value = withSpring(0, spring);
      api.current.rec.finish(willCancelRef.current ? 'cancel' : 'send');
    },
    onPanResponderTerminate: () => {
      press.value = withSpring(0, spring);
      api.current.rec.finish('cancel');
    },
  })).current;

  const ring = Math.round(size * 0.075);
  const well = size + ring * 2;
  const r = size / 2;
  const holding = phase === 'holding';
  const progress = holding ? Math.max(0.004, elapsed / MAX_RECORDING_MS) : 0;
  const who = chairName ? shortName(chairName).toUpperCase() : '';

  const sphere = (
    <Animated.View style={sphereStyle}>
      <Sphere size={size} ring={ring} dim={disabled || loading} progress={progress} progressColor={cancelArmed ? colors.textFaint : colors.primary}>
        <Animated.View style={checkStyle}>
          <ExtrudedCheck size={size * 0.56} />
        </Animated.View>
      </Sphere>
    </Animated.View>
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.field, { height: well * 1.32 }]}>
        {disabled || loading ? (
          <PressableScale
            onPress={onDisabledPress}
            disabled={loading || !onDisabledPress}
            dimWhenDisabled={false}
            pressedScale={0.96}
            accessibilityRole="button"
            accessibilityLabel="Link a chair"
            style={{ width: well, height: well }}
          >
            {sphere}
          </PressableScale>
        ) : (
          <View
            {...responder.panHandlers}
            accessibilityRole="button"
            accessibilityLabel={`Hold to record a voice message for ${chairName}`}
            style={[{ width: well, height: well, borderRadius: well / 2 }, webNoSelect]}
          >
            {sphere}
          </View>
        )}
        {!disabled && !loading && <Dashes r={r} level={level} burst={burst} keepClearBelow />}
      </View>

      <View style={styles.status}>
        <StatusLine phase={phase} disabled={disabled} loading={loading} who={who} elapsed={elapsed} cancelArmed={cancelArmed} heard={heard} />
      </View>
    </View>
  );
}

function StatusLine({ phase, disabled, loading, who, elapsed, cancelArmed, heard }: {
  phase: SpherePhase; disabled: boolean; loading?: boolean; who: string; elapsed: number; cancelArmed: boolean; heard?: boolean;
}) {
  if (loading) return null;
  if (disabled) return <Txt variant="label" align="center">Link a chair</Txt>;
  switch (phase) {
    case 'holding': {
      const left = MAX_RECORDING_MS - elapsed;
      return (
        <>
          <Txt variant="number" align="center" style={styles.timer}>{mmss(elapsed)}</Txt>
          <Txt variant="label" tone={cancelArmed ? 'danger' : 'faint'} align="center" style={styles.small}>
            {cancelArmed ? 'Release to cancel' : left < 15_000 ? `${Math.ceil(left / 1000)}s left` : 'Slide away to cancel'}
          </Txt>
        </>
      );
    }
    case 'sending':
      return <Txt variant="label" tone="muted" align="center">Sending</Txt>;
    case 'sent':
      return <Txt variant="label" align="center">Sent to {who}</Txt>;
    case 'cancelled':
      return <Txt variant="label" tone="muted" align="center">Cancelled</Txt>;
    case 'short':
      return <Txt variant="label" align="center">Keep holding to talk</Txt>;
    case 'failed':
      return <Txt variant="label" tone="danger" align="center">Not sent — try again</Txt>;
    default:
      return (
        <>
          <Txt variant="label" tone="faint" align="center">Hold to talk</Txt>
          {heard ? (
            <View style={styles.heard}>
              <Txt variant="label" align="center" style={styles.small}>Heard</Txt>
              <View style={styles.underline} />
            </View>
          ) : null}
        </>
      );
  }
}

const webNoSelect = Platform.OS === 'web' ? ({ userSelect: 'none', cursor: 'pointer', touchAction: 'none' } as object) : null;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', alignSelf: 'stretch' },
  field: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  status: { height: 64, alignItems: 'center', justifyContent: 'flex-start', gap: space.xs },
  timer: { fontSize: 24, lineHeight: 30, letterSpacing: 2 },
  small: { fontSize: 13, letterSpacing: 1.8 },
  heard: { alignItems: 'center', marginTop: space.sm },
  underline: { width: 22, height: 2, borderRadius: 1, backgroundColor: colors.primary, marginTop: 4 },
});
