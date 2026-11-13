import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import type { ChairMessage } from '@/types';
import { Card, Icon, IconBadge, IconButton, PressableScale, ScreenBackground, Txt, useToast, type Accent, type IconName } from '@/components/ui';
import { ActionTile, ChairSwitcher, EmptyChairState, OnlinePill, VoiceHoldButton, formatDuration, relativeTime } from '@/components/family';
import { sendVoice } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { useMessages, usePhotoSentToday } from '@/hooks/useMessages';
import { useNow } from '@/hooks/useNow';
import { friendlyError } from '@/hooks/errors';
import type { RecordingResult } from '@/hooks/useVoiceRecorder';

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

const kindMeta: Record<ChairMessage['type'], { icon: IconName; accent: Accent }> = {
  voice: { icon: 'mic', accent: 'voice' },
  photo: { icon: 'photo', accent: 'photo' },
  text: { icon: 'text', accent: 'text' },
};

function summary(m: ChairMessage) {
  if (m.type === 'voice') return `Voice message · ${formatDuration(m.durationMs ?? 0)}`;
  if (m.type === 'photo') return m.text ? `Photo · “${m.text}”` : 'Photo of the day';
  return `“${m.text ?? ''}”`;
}

function RecentRow({ m, now }: { m: ChairMessage; now: number }) {
  const k = kindMeta[m.type];
  return (
    <View style={styles.recentRow}>
      <IconBadge name={k.icon} accent={k.accent} size={40} />
      <View style={{ flex: 1 }}>
        <Txt variant="body" numberOfLines={1}>{summary(m)}</Txt>
        <Txt variant="caption" tone="faint">{m.senderName} · {relativeTime(m.createdAt, now)}</Txt>
      </View>
      {m.playedAt
        ? <Txt variant="caption" tone="success">{m.type === 'photo' ? 'Seen ✓' : 'Played ✓'}</Txt>
        : <Txt variant="caption" tone="faint">Waiting</Txt>}
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const now = useNow();
  const { user } = useAuth();
  const { chairs, loading, selected, select } = useChairs();
  const { messages } = useMessages(selected?.id, 30);
  const lastPhotoId = messages.find((m) => m.type === 'photo')?.id;
  const sentPhotoToday = usePhotoSentToday(selected?.id, lastPhotoId);
  const [recording, setRecording] = useState(false);

  const onSendVoice = useCallback(async (rec: RecordingResult) => {
    if (!selected) return;
    try {
      await sendVoice(selected.id, rec.uri, rec.durationMs);
      toast.show(`Sent to ${selected.name} 🎉`, 'success');
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t send that voice message. Please try again.'), 'error');
    }
  }, [selected, toast]);

  const header = (
    <View style={styles.topBar}>
      <Txt variant="caption" tone="muted" upper>{greeting(now)}, {user?.displayName ?? 'there'}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {selected && <IconButton name="history" label="Conversation" onPress={() => router.push('/history')} />}
        <IconButton name="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top }}>{header}</View>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </ScreenBackground>
    );
  }

  if (!selected) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top, flex: 1 }}>
          {header}
          <EmptyChairState name={user?.displayName} />
        </View>
      </ScreenBackground>
    );
  }

  const recent = messages.slice(0, 3);

  return (
    <ScreenBackground>
      <ScrollView
        scrollEnabled={!recording}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + space.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {header}

          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.hero}>
            <Txt variant="caption" tone="faint" upper>Sending to</Txt>
            <Txt variant="display" style={styles.name} numberOfLines={2} adjustsFontSizeToFit>{selected.name}</Txt>
            <OnlinePill chair={selected} />
          </Animated.View>
        </View>

        <View style={{ marginBottom: space.lg }}>
          <ChairSwitcher chairs={chairs} selectedId={selected.id} onSelect={select} />
        </View>

        <View style={styles.inner}>
          <Animated.View entering={FadeInDown.delay(60).springify().damping(15)} style={{ paddingHorizontal: space.lg }}>
            <VoiceHoldButton chairName={selected.name} onSend={onSendVoice} onActiveChange={setRecording} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).springify().damping(15)} style={styles.tiles}>
            <ActionTile
              title="Photo of the day"
              subtitle={sentPhotoToday ? 'Change today’s photo' : 'Brighten their day'}
              icon="photo" accent="photo" done={!!sentPhotoToday}
              onPress={() => router.push('/photo')}
            />
            <ActionTile
              title="Write a note"
              subtitle="Read out loud for them"
              icon="text" accent="text"
              onPress={() => router.push('/text')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify().damping(15)} style={{ paddingHorizontal: space.lg }}>
            <PressableScale onPress={() => router.push('/history')} pressedScale={0.98} accessibilityRole="button" accessibilityLabel="Open conversation">
              <Card style={{ gap: space.md }}>
                <View style={styles.recentHead}>
                  <Txt variant="heading">Recent</Txt>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Txt variant="caption" tone="muted">See all</Txt>
                    <Icon name="chevron" size={20} color={colors.textMuted} />
                  </View>
                </View>
                {recent.length === 0 ? (
                  <Txt variant="body" tone="muted">Nothing sent yet. Hold the big button and say hello 👋</Txt>
                ) : (
                  recent.map((m) => <RecentRow key={m.id} m={m} now={now} />)
                )}
              </Card>
            </PressableScale>
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.sm },
  hero: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md, gap: space.sm },
  name: { fontSize: 52, lineHeight: 56, letterSpacing: -1.5 },
  tiles: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, marginTop: space.lg, marginBottom: space.lg },
  recentHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
