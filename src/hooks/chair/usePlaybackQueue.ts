import { useCallback, useEffect, useRef, useState } from 'react';
import { markPlayed, subscribeUnplayed } from '@/lib/api';
import type { ChairMessage } from '@/types';
import {
  type CancelHandle,
  clamp01,
  ensureChairAudioMode,
  playUrlAsync,
  speakAsync,
  stopAllSpeech,
} from './playback';

export type PlaybackPhase = 'announce' | 'playing' | 'photo';
export interface NowPlaying {
  msg: ChairMessage;
  phase: PlaybackPhase;
  replay: boolean;
}

const GAP_BETWEEN_MS = 1500;
const RETRY_DELAY_MS = 2000;
const PHOTO_HOLD_MS = 6000;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function announcementFor(msg: ChairMessage): string {
  const who = msg.senderName?.trim() || 'your family';
  return msg.type === 'photo' ? `New photo from ${who}` : `Message from ${who}`;
}

/**
 * Plays unplayed messages oldest-first, one at a time, then calls markPlayed.
 * - Never plays the same message twice concurrently (in-flight + done id sets).
 * - On failure: retry once, then markPlayed anyway so a broken message can't loop forever.
 */
export function usePlaybackQueue(chairId: string | null | undefined, volume: number) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [lastPlayed, setLastPlayed] = useState<ChairMessage | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  const pendingRef = useRef<ChairMessage[]>([]);
  const doneIds = useRef(new Set<string>());
  const inFlight = useRef(new Set<string>());
  const busy = useRef(false);
  const alive = useRef(true);
  const volumeRef = useRef(clamp01(volume));
  const cancelRef = useRef<CancelHandle | null>(null);
  const lastPlayedRef = useRef<ChairMessage | null>(null);

  volumeRef.current = clamp01(volume);

  const playOne = useCallback(async (msg: ChairMessage, replay: boolean) => {
    const vol = volumeRef.current;
    setNowPlaying({ msg, phase: msg.type === 'photo' ? 'photo' : 'announce', replay });
    await speakAsync(announcementFor(msg), { volume: vol });
    if (!alive.current) return;

    if (msg.type === 'voice') {
      if (!msg.mediaUrl) throw new Error('voice message without mediaUrl');
      setNowPlaying({ msg, phase: 'playing', replay });
      const handle: CancelHandle = { cancel: () => {} };
      cancelRef.current = handle;
      try {
        await playUrlAsync(msg.mediaUrl, { volume: vol, expectedMs: msg.durationMs, handle });
      } finally {
        cancelRef.current = null;
      }
    } else if (msg.type === 'text') {
      const text = msg.text?.trim();
      if (text) {
        setNowPlaying({ msg, phase: 'playing', replay });
        await speakAsync(text, { volume: vol });
      }
    } else {
      // photo: the ambient screen shows it via subscribeLatestPhoto; read the caption and hold.
      if (msg.text?.trim()) await speakAsync(msg.text.trim(), { volume: vol });
      await sleep(PHOTO_HOLD_MS);
    }
  }, []);

  const playWithRetry = useCallback(
    async (msg: ChairMessage, replay: boolean) => {
      try {
        await playOne(msg, replay);
      } catch (e) {
        console.warn('[chair] playback failed, retrying once', msg.id, e);
        if (!alive.current) return;
        await sleep(RETRY_DELAY_MS);
        try {
          await playOne(msg, replay);
        } catch (e2) {
          console.warn('[chair] playback failed twice, skipping', msg.id, e2);
        }
      }
    },
    [playOne],
  );

  const pump = useCallback(async () => {
    if (busy.current || !alive.current || !chairId) return;
    const next = pendingRef.current.find((m) => !doneIds.current.has(m.id) && !inFlight.current.has(m.id));
    if (!next) return;

    busy.current = true;
    inFlight.current.add(next.id);
    try {
      await ensureChairAudioMode();
      await playWithRetry(next, false);
    } finally {
      // Mark as done locally first so a slow/failed markPlayed never causes a replay.
      doneIds.current.add(next.id);
      inFlight.current.delete(next.id);
      markPlayed(chairId, next.id).catch((e) => console.warn('[chair] markPlayed failed', next.id, e));
      lastPlayedRef.current = next;
      if (alive.current) {
        setLastPlayed(next);
        setNowPlaying(null);
        setQueueLength(pendingRef.current.filter((m) => !doneIds.current.has(m.id)).length);
      }
      busy.current = false;
    }
    if (!alive.current) return;
    await sleep(GAP_BETWEEN_MS);
    pump();
  }, [chairId, playWithRetry]);

  useEffect(() => {
    if (!chairId) return;
    alive.current = true;
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeUnplayed(chairId, (msgs) => {
        pendingRef.current = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
        setQueueLength(pendingRef.current.filter((m) => !doneIds.current.has(m.id)).length);
        pump();
      });
    } catch (e) {
      console.warn('[chair] subscribeUnplayed failed', e);
    }
    return () => {
      alive.current = false;
      unsub?.();
      cancelRef.current?.cancel();
      stopAllSpeech();
    };
  }, [chairId, pump]);

  /** Replays the most recent message (does not touch playedAt). Ignored while something plays. */
  const replayLast = useCallback(async () => {
    const msg = lastPlayedRef.current;
    if (!msg || busy.current) return;
    busy.current = true;
    try {
      await ensureChairAudioMode();
      await playWithRetry(msg, true);
    } finally {
      busy.current = false;
      if (alive.current) setNowPlaying(null);
    }
    pump();
  }, [playWithRetry, pump]);

  return { nowPlaying, lastPlayed, queueLength, replayLast, isBusy: nowPlaying !== null };
}
