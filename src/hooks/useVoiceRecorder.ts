import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export const MAX_RECORDING_MS = 2 * 60 * 1000;
export const MIN_RECORDING_MS = 700;
const LEVEL_COUNT = 36;

export type RecorderPhase = 'idle' | 'starting' | 'recording' | 'stopping';
export type FinishMode = 'send' | 'cancel';
export interface RecordingResult { uri: string; durationMs: number }
export type FinishReason = 'sent' | 'cancelled' | 'too-short' | 'max-length' | 'error';

const options = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

/** Converts metering dBFS (-160..0) to a 0..1 visual level. */
function dbToLevel(db: number | undefined) {
  if (db === undefined || !Number.isFinite(db)) return 0.15 + Math.random() * 0.35; // web / no metering: keep it alive
  const v = Math.min(1, Math.max(0, (db + 55) / 55));
  return Math.pow(v, 1.6);
}

async function ensureMicPermission(): Promise<'granted' | 'asked' | 'denied'> {
  const current = await getRecordingPermissionsAsync();
  if (current.granted) return 'granted';
  if (current.canAskAgain) {
    const res = await requestRecordingPermissionsAsync();
    // The system dialog interrupted the hold gesture: let the user press again.
    return res.granted ? 'asked' : 'denied';
  }
  return 'denied';
}

/**
 * Press-and-hold voice recorder built on expo-audio.
 * Call `start()` on press-in and `finish('send' | 'cancel')` on release; the result
 * arrives via `onFinished`. Handles fast releases while the recorder is still starting.
 */
export function useVoiceRecorder(onFinished: (result: RecordingResult | null, reason: FinishReason) => void) {
  const recorder = useAudioRecorder(options);
  const state = useAudioRecorderState(recorder, 60);
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [levels, setLevels] = useState<number[]>(() => Array(LEVEL_COUNT).fill(0));
  const startedAt = useRef(0);
  const phaseRef = useRef<RecorderPhase>('idle');
  const pending = useRef<FinishMode | null>(null);
  const cb = useRef(onFinished);
  cb.current = onFinished;

  const setP = (p: RecorderPhase) => { phaseRef.current = p; setPhase(p); };

  const resetAudioMode = () => setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});

  const doFinish = useCallback(async (mode: FinishMode, forcedReason?: FinishReason) => {
    if (phaseRef.current !== 'recording') return;
    setP('stopping');
    const elapsed = Date.now() - startedAt.current;
    try {
      await recorder.stop();
    } catch (e) {
      console.warn('[voice] stop failed', e);
    }
    await resetAudioMode();
    const uri = recorder.uri;
    setP('idle');
    setLevels(Array(LEVEL_COUNT).fill(0));
    if (mode === 'cancel') return cb.current(null, 'cancelled');
    if (!uri) return cb.current(null, 'error');
    const durationMs = Math.min(MAX_RECORDING_MS, Math.max(elapsed, recorder.getStatus().durationMillis || 0));
    if (durationMs < MIN_RECORDING_MS) return cb.current(null, 'too-short');
    cb.current({ uri, durationMs }, forcedReason ?? 'sent');
  }, [recorder]);

  const start = useCallback(async (): Promise<boolean> => {
    if (phaseRef.current !== 'idle') return false;
    pending.current = null;
    setP('starting');
    try {
      const perm = await ensureMicPermission();
      if (perm !== 'granted') {
        setP('idle');
        if (perm === 'denied') {
          Alert.alert(
            'Microphone is off',
            'To record a voice message, allow The Chair to use your microphone in Settings.',
            Platform.OS === 'web'
              ? [{ text: 'OK' }]
              : [{ text: 'Not now', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {}) }],
          );
        }
        return false;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      if (pending.current === 'cancel') { setP('idle'); await resetAudioMode(); return false; }
      recorder.record();
      startedAt.current = Date.now();
      setP('recording');
      if (pending.current) {
        // Released before recording began → treat as an accidental tap.
        pending.current = null;
        await doFinish('send');
      }
      return true;
    } catch (e) {
      console.warn('[voice] start failed', e);
      setP('idle');
      await resetAudioMode();
      cb.current(null, 'error');
      return false;
    }
  }, [recorder, doFinish]);

  const finish = useCallback((mode: FinishMode) => {
    if (phaseRef.current === 'starting') { pending.current = mode; return; }
    void doFinish(mode);
  }, [doFinish]);

  // Live waveform from metering.
  useEffect(() => {
    if (phase !== 'recording') return;
    setLevels((cur) => [...cur.slice(1), dbToLevel(state.metering)]);
  }, [phase, state.metering, state.durationMillis]);

  const elapsedMs = phase === 'recording' ? state.durationMillis : 0;

  // Hard cap at 2 minutes: auto-send.
  useEffect(() => {
    if (phase === 'recording' && elapsedMs >= MAX_RECORDING_MS) void doFinish('send', 'max-length');
  }, [phase, elapsedMs, doFinish]);

  return { phase, levels, elapsedMs, start, finish, isActive: phase === 'recording' || phase === 'starting' };
}
