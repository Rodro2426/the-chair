import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChairBackground,
  ChairButton,
  ChairClock,
  ChairSphere,
  HiddenSettings,
  KenBurnsPhoto,
  NowPlayingOverlay,
} from '@/components/chair';
import { useChairDevice } from '@/hooks/chair/useChairDevice';
import { greetingFor, useClock } from '@/hooks/chair/useClock';
import { useHeartbeat } from '@/hooks/chair/useHeartbeat';
import { ensureChairAudioMode } from '@/hooks/chair/playback';
import { usePlaybackQueue } from '@/hooks/chair/usePlaybackQueue';
import { signOut, subscribeLatestPhoto } from '@/lib/api';
import { colors, fonts, space } from '@/theme/tokens';
import type { ChairMessage } from '@/types';

/** Ambient receiver screen: photo of the day, clock, auto-playing messages, one Replay button. */
export default function ChairHome() {
  const { chair, loading } = useChairDevice();
  const chairId = chair?.id ?? null;
  const [photo, setPhoto] = useState<ChairMessage | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const now = useClock();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;

  useHeartbeat(chairId);
  const { nowPlaying, lastPlayed, replayLast } = usePlaybackQueue(chairId, chair?.volume ?? 1);

  useEffect(() => {
    ensureChairAudioMode();
  }, []);

  useEffect(() => {
    if (!loading && !chair) router.replace('/chair');
  }, [loading, chair]);

  useEffect(() => {
    if (!chairId) return;
    try {
      return subscribeLatestPhoto(chairId, setPhoto);
    } catch (e) {
      console.warn('[chair] subscribeLatestPhoto failed', e);
    }
  }, [chairId]);

  const resetDevice = () => {
    Alert.alert('Reset this chair?', 'The family will need to link it again with a new code.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          setSettingsOpen(false);
          try {
            await signOut(); // drops the anonymous device identity; setup creates a new chair
          } catch (e) {
            console.warn('[chair] reset failed', e);
          }
          router.replace('/chair/setup');
        },
      },
    ]);
  };

  const pad = {
    paddingTop: insets.top + space.xl,
    paddingBottom: insets.bottom + space.xl,
    paddingLeft: insets.left + space.xl,
    paddingRight: insets.right + space.xl,
  };
  const photoUri = photo?.mediaUrl;
  const sphereSize = Math.round(Math.min(width * (landscape ? 0.2 : 0.42), height * (landscape ? 0.3 : 0.24)));
  const firstName = (chair?.name ?? '').trim().split(/\s+/).slice(-1)[0] ?? '';

  return (
    <ChairBackground>
      {photoUri ? (
        <Animated.View key={photo!.id} entering={FadeIn.duration(1500)} exiting={FadeOut.duration(1500)} style={StyleSheet.absoluteFill}>
          <KenBurnsPhoto uri={photoUri} />
        </Animated.View>
      ) : null}

      <View style={[styles.layout, pad]}>
        <ChairClock onSecretLongPress={() => setSettingsOpen(true)} />

        {photoUri ? <View style={styles.spacer} /> : null}

        {photoUri ? (
          <View style={styles.meta}>
            <Text style={styles.photoFrom} numberOfLines={1} adjustsFontSizeToFit>
              PHOTO FROM {photo!.senderName.toUpperCase()}
            </Text>
            {photo!.text ? (
              <Text style={styles.caption} numberOfLines={3}>
                {photo!.text}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.center} pointerEvents="none">
            <ChairSphere size={sphereSize} active={false} />
            <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
              {greetingFor(now)}, {firstName}
            </Text>
          </View>
        )}

        <View style={[styles.bottom, !landscape && styles.bottomPortrait]}>
          <ChairButton
            label="Replay"
            icon="replay"
            onPress={replayLast}
            disabled={!lastPlayed || !!nowPlaying}
            style={[styles.replay, !landscape && styles.replayPortrait]}
          />
        </View>
      </View>

      {nowPlaying ? <NowPlayingOverlay nowPlaying={nowPlaying} compact={!landscape} /> : null}

      <HiddenSettings
        visible={settingsOpen}
        chairName={chair?.name}
        onClose={() => setSettingsOpen(false)}
        onShowPairing={() => {
          setSettingsOpen(false);
          router.push({ pathname: '/chair/pair', params: { from: 'settings' } });
        }}
        onReset={resetDevice}
      />
    </ChairBackground>
  );
}

const textShadow = { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 } };

const styles = StyleSheet.create({
  layout: { flex: 1 },
  spacer: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  meta: { marginBottom: space.lg, maxWidth: 1100 },
  photoFrom: { fontFamily: fonts.monoMedium, fontSize: 44, letterSpacing: 5, color: colors.text, ...textShadow },
  caption: { fontFamily: fonts.serif, fontSize: 48, lineHeight: 56, color: colors.text, marginTop: space.sm, ...textShadow },
  greeting: { fontFamily: fonts.serif, fontSize: 64, lineHeight: 72, color: colors.text, textAlign: 'center', marginTop: -space.lg },
  bottom: { flexDirection: 'row', justifyContent: 'flex-end' },
  bottomPortrait: { justifyContent: 'center' },
  replay: { minWidth: 380, minHeight: 120 },
  replayPortrait: { alignSelf: 'stretch', flex: 1 },
});
