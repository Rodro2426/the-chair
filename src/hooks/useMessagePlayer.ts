import { useCallback, useEffect, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import type { ChairMessage } from '@/types';

/**
 * One shared expo-audio player for a whole conversation list: only one voice
 * message plays at a time, and every bubble can read the progress of the active one.
 */
export function useMessagePlayer() {
  const player = useAudioPlayer(null, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      player.seekTo(0).catch(() => {});
    }
  }, [status.didJustFinish, player]);

  const toggle = useCallback(async (msg: ChairMessage) => {
    if (!msg.mediaUrl) return;
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
    if (activeId === msg.id) {
      if (status.playing) player.pause();
      else {
        if (status.duration > 0 && status.currentTime >= status.duration - 0.05) await player.seekTo(0).catch(() => {});
        player.play();
      }
      return;
    }
    player.replace({ uri: msg.mediaUrl });
    setActiveId(msg.id);
    player.play();
  }, [activeId, player, status.playing, status.currentTime, status.duration]);

  return {
    activeId,
    playing: status.playing,
    currentTime: status.currentTime,
    duration: status.duration,
    buffering: status.isBuffering,
    toggle,
  };
}

export type MessagePlayer = ReturnType<typeof useMessagePlayer>;
