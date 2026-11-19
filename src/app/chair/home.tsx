import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChairBackground,
  ChairButton,
  HiddenSettings,
  KenBurnsPhoto,
  NowPlayingOverlay,
} from '@/components/chair';
import { useChairDevice } from '@/hooks/chair/useChairDevice';
import { greetingFor, useClock } from '@/hooks/chair/useClock';
import { useHeartbeat } from '@/hooks/chair/useHeartbeat';
import { ensureChairAudioMode } from '@/hooks/chair/playback';
import { usePlaybackQueue } from '@/hooks/chair/usePlaybackQueue';
import { sendVoice, signOut, subscribeLatestPhoto } from '@/lib/api';
import { TalkSphere } from '@/components/family/TalkSphere';
import { shortName } from '@/components/family/format';
import { confirmAsync } from '@/hooks/confirm';
import type { RecordingResult } from '@/hooks/useVoiceRecorder';
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

  const resetDevice = async () => {
    const ok = await confirmAsync('Reset this chair?', 'The family will need to link it again with a new code.', 'Reset', true);
    if (!ok) return;
    setSettingsOpen(false);
    try {
      await signOut(); // drops the anonymous device identity; setup creates a new chair
    } catch (e) {
      console.warn('[chair] reset failed', e);
    }
    router.replace('/chair/setup');
  };

  const onReply = useCallback(async (rec: RecordingResult) => {
    if (!chairId) throw new Error('No chair');
    await sendVoice(chairId, rec.uri, rec.durationMs);
  }, [chairId]);

  const photoUri = photo?.mediaUrl;
  const firstName = shortName(chair?.name ?? '');
  const greeting = `${greetingFor(now)}, ${firstName}`;
  const [hm, ampm] = splitTime(now);
  const dateLine = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  // Everything is sized from the screen so it stays centred and symmetrical on a phone or a tablet.
  const usableW = width - insets.left - insets.right - space.xl * 2;
  const usableH = height - insets.top - insets.bottom;
  const timeSize = Math.round(Math.min(usableW * (landscape ? 0.16 : 0.3), usableH * (landscape ? 0.2 : 0.11), 150));
  const greetingSize = Math.round(Math.min(usableW / Math.max(10, greeting.length * 0.5), usableH * 0.06, 64));
  const sphereSize = Math.round(landscape
    ? Math.min(usableH * 0.42, width * 0.26, 340)
    : Math.min(usableW * 0.55, usableH * 0.25, 300));

  const header = (
    <Pressable onLongPress={() => setSettingsOpen(true)} delayLongPress={3000} hitSlop={20} accessibilityRole="text">
      <View style={styles.header}>
        <Text style={[styles.date, photoUri && textShadow]} numberOfLines={1}>{dateLine}</Text>
        <View style={styles.timeRow}>
          <Text style={[styles.time, { fontSize: timeSize, lineHeight: Math.round(timeSize * 1.1) }, photoUri && textShadow]}>{hm}</Text>
          {ampm ? <Text style={[styles.ampm, { fontSize: Math.round(timeSize * 0.3) }, photoUri && textShadow]}>{ampm}</Text> : null}
        </View>
        {photoUri ? (
          <Text style={[styles.photoFrom, textShadow]} numberOfLines={1}>PHOTO FROM {photo!.senderName.toUpperCase()}</Text>
        ) : (
          <Text style={[styles.greeting, { fontSize: greetingSize, lineHeight: Math.round(greetingSize * 1.15) }]} numberOfLines={1}>
            {greeting}
          </Text>
        )}
      </View>
    </Pressable>
  );

  const sphere = (
    <TalkSphere
      chairName="family"
      onSend={onReply}
      size={sphereSize}
      idleLabel="Hold to reply"
      big
    />
  );

  const replay = (
    <ChairButton
      label="Replay"
      icon="replay"
      variant="quiet"
      onPress={replayLast}
      disabled={!lastPlayed || !!nowPlaying}
      style={styles.replay}
    />
  );

  return (
    <ChairBackground>
      {photoUri ? (
        <Animated.View key={photo!.id} entering={FadeIn.duration(1500)} exiting={FadeOut.duration(1500)} style={StyleSheet.absoluteFill}>
          <KenBurnsPhoto uri={photoUri} />
        </Animated.View>
      ) : null}

      <View
        style={[
          styles.layout,
          {
            paddingTop: insets.top + space.lg,
            paddingBottom: insets.bottom + space.lg,
            paddingLeft: insets.left + space.xl,
            paddingRight: insets.right + space.xl,
          },
        ]}
      >
        {landscape ? (
          <View style={styles.landscape}>
            <View style={styles.half}>
              {header}
              {photoUri && photo!.text ? <Text style={[styles.caption, textShadow]} numberOfLines={3}>{photo!.text}</Text> : null}
              <View style={styles.replayWrap}>{replay}</View>
            </View>
            <View style={styles.half}>{sphere}</View>
          </View>
        ) : (
          <>
            {header}
            <View style={styles.center}>{sphere}</View>
            {photoUri && photo!.text ? <Text style={[styles.caption, textShadow]} numberOfLines={2}>{photo!.text}</Text> : null}
            <View style={styles.replayWrap}>{replay}</View>
          </>
        )}
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

/** "3:08 PM" → ["3:08", "PM"]; 24-hour locales → ["15:08", ""]. */
function splitTime(d: Date): [string, string] {
  const t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const m = t.match(/^([\d:.]+)\s*(.*)$/);
  return m ? [m[1], m[2].toUpperCase()] : [t, ''];
}

const textShadow = { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 } } as const;

const styles = StyleSheet.create({
  layout: { flex: 1 },
  landscape: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  half: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  header: { alignItems: 'center', alignSelf: 'stretch', gap: space.xs },
  date: { fontFamily: fonts.monoMedium, fontSize: 18, letterSpacing: 3, color: colors.textMuted, textAlign: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  time: { fontFamily: fonts.monoMedium, color: colors.text, letterSpacing: 1, fontVariant: ['tabular-nums'] },
  ampm: { fontFamily: fonts.monoMedium, color: colors.textMuted, letterSpacing: 2, marginLeft: 8, marginTop: 10 },
  greeting: { fontFamily: fonts.serif, color: colors.text, textAlign: 'center', marginTop: space.sm },
  photoFrom: { fontFamily: fonts.monoMedium, fontSize: 20, letterSpacing: 4, color: colors.text, textAlign: 'center', marginTop: space.sm },
  caption: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 36, color: colors.text, textAlign: 'center', marginBottom: space.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  replayWrap: { alignSelf: 'stretch', alignItems: 'center' },
  replay: { alignSelf: 'stretch', minHeight: 84, maxWidth: 560, width: '100%' },
});
