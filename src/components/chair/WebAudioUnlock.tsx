import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { colors, colorsUi } from '@/theme/tokens';

/**
 * Browsers block sound until the page is tapped once. On web, the chair shows a
 * full-screen "TAP TO START" layer; the tap unlocks audio + speech and (where
 * allowed) enters full screen. Native apps skip this entirely.
 */
export function WebAudioUnlock() {
  const [unlocked, setUnlocked] = useState(Platform.OS !== 'web');
  if (unlocked) return null;

  const unlock = () => {
    try {
      const w = window as any;
      const Ctx = w.AudioContext || w.webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        ctx.resume?.();
      }
      // A silent <audio> play also unlocks HTMLAudioElement playback on iOS Safari.
      const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
      a.play().catch(() => {});
      if (w.speechSynthesis) {
        const u = new w.SpeechSynthesisUtterance(' ');
        u.volume = 0;
        w.speechSynthesis.speak(u);
      }
      document.documentElement.requestFullscreen?.().catch(() => {});
    } catch {}
    setUnlocked(true);
  };

  return (
    <Pressable onPress={unlock} style={styles.layer} accessibilityRole="button" accessibilityLabel="Tap to start the chair">
      <View style={styles.box}>
        <Txt variant="display" align="center">Tap to start</Txt>
        <Txt variant="label" tone="muted" align="center" style={{ marginTop: 16 }}>
          TAP ANYWHERE ONCE SO THE CHAIR CAN PLAY SOUND
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  box: { padding: 32, borderWidth: 1, borderColor: colorsUi.inputBorder, maxWidth: 560 },
});
