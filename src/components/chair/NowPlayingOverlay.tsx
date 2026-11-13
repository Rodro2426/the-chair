import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { NowPlaying } from '@/hooks/chair/usePlaybackQueue';
import { colors, gradients, radius, space, type } from '@/theme/tokens';
import { Waveform } from './Waveform';

const gradientFor = (t: NowPlaying['msg']['type']) =>
  t === 'voice' ? gradients.voice : t === 'photo' ? gradients.photo : gradients.text;
const accentFor = (t: NowPlaying['msg']['type']) =>
  t === 'voice' ? colors.primary : t === 'photo' ? colors.secondary : colors.tertiary;

/** Large "Now playing — from Santi" card with an animated waveform. */
export function NowPlayingOverlay({ nowPlaying, compact }: { nowPlaying: NowPlaying; compact?: boolean }) {
  const { msg, phase } = nowPlaying;
  const label =
    msg.type === 'photo' ? 'New photo' : phase === 'announce' ? 'New message' : nowPlaying.replay ? 'Playing again' : 'Now playing';
  const showText = msg.type === 'text' && phase === 'playing' && !!msg.text;

  return (
    <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(600)} style={styles.scrim} pointerEvents="none">
      <View style={[styles.card, compact && styles.cardCompact]}>
        <LinearGradient colors={gradientFor(msg.type)} style={styles.stripe} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.from} numberOfLines={2} adjustsFontSizeToFit>
          from {msg.senderName}
        </Text>
        {showText ? (
          <Text style={styles.body} numberOfLines={6} adjustsFontSizeToFit>
            “{msg.text}”
          </Text>
        ) : null}
        <View style={styles.wave}>
          <Waveform active color={accentFor(msg.type)} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: space.xxl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardCompact: { padding: space.xl },
  stripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 10 },
  label: { ...type.chairBody, color: colors.textMuted, textAlign: 'center' },
  from: { ...type.chairHuge, color: colors.text, textAlign: 'center', marginTop: space.sm },
  body: { ...type.chairBody, color: colors.text, textAlign: 'center', marginTop: space.lg },
  wave: { marginTop: space.xl },
});
