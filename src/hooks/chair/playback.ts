// Low-level, promise-based playback helpers for the chair receiver.
import { createAudioPlayer, setAudioModeAsync, type AudioStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export const SPEECH_RATE = 0.85;

let audioModeReady: Promise<void> | null = null;

/** Configure the audio session once: play even in silent mode and keep playing in the background. */
export function ensureChairAudioMode(): Promise<void> {
  if (!audioModeReady) {
    audioModeReady = setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    }).catch((e) => {
      audioModeReady = null; // allow a retry next time
      console.warn('[chair] setAudioModeAsync failed', e);
    });
  }
  return audioModeReady;
}

/** Speak text and resolve when finished (or stopped). Rejects on TTS error. */
export function speakAsync(text: string, opts: { rate?: number; volume?: number } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      if (err) reject(err);
      else resolve();
    };
    // Safety net: some platforms never fire onDone. ~120 ms/char at slow rate, min 8s.
    const guard = setTimeout(() => done(), Math.max(8000, text.length * 120));
    Speech.speak(text, {
      rate: opts.rate ?? SPEECH_RATE,
      volume: opts.volume,
      onDone: () => done(),
      onStopped: () => done(),
      onError: (e) => done(e instanceof Error ? e : new Error(String(e))),
    });
  });
}

export type CancelHandle = { cancel: () => void };

/**
 * Web only: browsers (iPhone Safari especially) only let an <audio> element play
 * without a tap if that same element was started by a tap before. WebAudioUnlock
 * plays silence on this shared element; every message then reuses it.
 */
export function getSharedWebAudio(): HTMLAudioElement | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as { __chairAudio?: HTMLAudioElement };
  if (!w.__chairAudio) {
    const a = new Audio();
    a.preload = 'auto';
    a.setAttribute('playsinline', 'true');
    w.__chairAudio = a;
  }
  return w.__chairAudio;
}

function playWebAudio(uri: string, opts: { volume: number; expectedMs?: number; handle?: CancelHandle }, a: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      a.onended = null;
      a.onerror = null;
      try { a.pause(); } catch {}
      if (err) reject(err); else resolve();
    };
    const guard = setTimeout(() => finish(new Error('audio playback timeout')),
      opts.expectedMs ? opts.expectedMs + 30000 : 10 * 60 * 1000);
    if (opts.handle) opts.handle.cancel = () => finish();
    a.onended = () => finish();
    a.onerror = () => finish(new Error('audio could not be played'));
    a.volume = clamp01(opts.volume);
    a.src = uri;
    a.currentTime = 0;
    a.play().catch((e) => finish(e instanceof Error ? e : new Error(String(e))));
  });
}

/**
 * Play a remote audio file to the end. Resolves on finish, rejects on load/playback error
 * or timeout. `handle.cancel()` stops playback and resolves.
 */
export function playUrlAsync(
  uri: string,
  opts: { volume: number; expectedMs?: number; handle?: CancelHandle },
): Promise<void> {
  const webAudio = getSharedWebAudio();
  if (webAudio) return playWebAudio(uri, opts, webAudio);
  return new Promise((resolve, reject) => {
    let settled = false;
    let started = false;
    const player = createAudioPlayer({ uri }, { updateInterval: 250, keepAudioSessionActive: true });
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(loadGuard);
      clearTimeout(endGuard);
      sub.remove();
      try {
        player.pause();
        player.remove();
      } catch {}
      if (err) reject(err);
      else resolve();
    };
    const sub = player.addListener('playbackStatusUpdate', (s: AudioStatus) => {
      if (s.error) return finish(new Error(s.error));
      if (s.isLoaded && !started) {
        started = true;
        player.volume = clamp01(opts.volume);
        player.play();
      }
      if (s.didJustFinish) finish();
    });
    // Not loaded in 20s -> treat as failure. Never runs longer than expected + 30s (or 10 min).
    const loadGuard = setTimeout(() => {
      if (!started) finish(new Error('audio load timeout'));
    }, 20000);
    const endGuard = setTimeout(
      () => finish(new Error('audio playback timeout')),
      opts.expectedMs ? opts.expectedMs + 30000 : 10 * 60 * 1000,
    );
    if (opts.handle) opts.handle.cancel = () => finish();
    player.volume = clamp01(opts.volume);
  });
}

export function stopAllSpeech() {
  Speech.stop().catch(() => {});
}

export const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1);
