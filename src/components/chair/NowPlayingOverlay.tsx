import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { NowPlaying } from '@/hooks/chair/usePlaybackQueue';
import { colors, fonts, space } from '@/theme/tokens';
import { Grain } from '@/components/ui';
import { ChairSphere } from './ChairSphere';

/** Full-screen calm moment: the sphere breathes, "FROM SANTI" in large mono, notes shown in serif. */
export function NowPlayingOverlay({ nowPlaying, compact }: { nowPlaying: NowPlaying; compact?: boolean }) {
  const { msg, phase } = nowPlaying;
  const { width, height } = useWindowDimensions();
  const label =
    msg.type === 'photo' ? 'New photo' : phase === 'announce' ? 'New message' : nowPlaying.replay ? 'Playing again' : 'Now playing';
  const showText = msg.type === 'text' && phase === 'playing' && !!msg.text;
  const sphere = Math.round(Math.min(width * (compact ? 0.42 : 0.24), height * (showText ? 0.2 : 0.3)));

  return (
    <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(700)} style={styles.scrim} pointerEvents="none">
      <Grain />
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <ChairSphere size={sphere} active />
      <Text style={styles.from} numberOfLines={2} adjustsFontSizeToFit>FROM {(msg.senderName || 'family').toUpperCase()}</Text>
      <View style={styles.rule} />
      {showText ? (
        <Text style={styles.body} numberOfLines={5} adjustsFontSizeToFit>“{msg.text}”</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28,28,28,0.99)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  label: { fontFamily: fonts.monoMedium, fontSize: 26, letterSpacing: 6, color: colors.textMuted },
  from: { fontFamily: fonts.monoMedium, fontSize: 64, letterSpacing: 6, color: colors.text, textAlign: 'center' },
  rule: { width: 48, height: 3, backgroundColor: colors.primary, marginTop: space.md },
  body: { fontFamily: fonts.serif, fontSize: 52, lineHeight: 62, color: colors.text, textAlign: 'center', marginTop: space.xl, maxWidth: 1000 },
});
