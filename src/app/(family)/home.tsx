import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { ScreenBackground, Sheet, SheetOption, Txt, useToast } from '@/components/ui';
import { HomeTopBar, TalkSphere, WeekRow, isChairOnline } from '@/components/family';
import { sendVoice } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { useMessages, usePhotoSentToday } from '@/hooks/useMessages';
import { useNow } from '@/hooks/useNow';
import { friendlyError } from '@/hooks/errors';
import type { RecordingResult } from '@/hooks/useVoiceRecorder';

/** Home: one sphere. Hold it to talk. Everything else is one tap away. */
export default function Home() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const toast = useToast();
  const now = useNow(15_000);
  const { user } = useAuth();
  const { chairs, loading, selected, select } = useChairs();
  const { messages } = useMessages(selected?.id, 200);
  const lastPhotoId = messages.find((m) => m.type === 'photo')?.id;
  const sentPhotoToday = usePhotoSentToday(selected?.id, lastPhotoId);
  const [sheet, setSheet] = useState<'add' | 'chairs' | null>(null);

  const sentAt = useMemo(() => messages.map((m) => m.createdAt), [messages]);
  const mine = messages.find((m) => m.senderUid === user?.uid);
  const heard = !!mine?.playedAt;

  const onSend = useCallback(async (rec: RecordingResult) => {
    if (!selected) throw new Error('No chair');
    try {
      await sendVoice(selected.id, rec.uri, rec.durationMs);
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t send that voice message. Please try again.'), 'error');
      throw e;
    }
  }, [selected, toast]);

  const go = (path: '/photo' | '/text') => { setSheet(null); router.push(path); };
  const sphereSize = Math.round(Math.min(width * 0.62, (height - insets.top - insets.bottom) * 0.34, 320));

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
        <HomeTopBar
          title={selected ? selected.name.toUpperCase() : 'THE CHAIR'}
          online={selected ? isChairOnline(selected, now) : null}
          onPlus={selected ? () => setSheet('add') : undefined}
          onTitle={chairs.length > 1 ? () => setSheet('chairs') : undefined}
          onSettings={() => router.push('/settings')}
        />

        <View style={styles.stage}>
          <TalkSphere
            key={selected?.id ?? 'none'}
            chairName={selected?.name}
            loading={loading}
            heard={heard}
            size={sphereSize}
            onSend={onSend}
            onDisabledPress={() => router.push('/link')}
          />
        </View>

        <WeekRow sentAt={sentAt} now={now} dim={!selected} onPress={selected ? () => router.push('/history') : undefined} />
      </View>

      <Sheet visible={sheet === 'add'} onClose={() => setSheet(null)}>
        <SheetOption label="Photo of the day" icon="photo"
          hint={sentPhotoToday ? 'Sent today · a new one replaces it' : 'Shown big on the chair'} onPress={() => go('/photo')} />
        <SheetOption label="Write a note" icon="text" hint="Read out loud" onPress={() => go('/text')} />
      </Sheet>

      <Sheet visible={sheet === 'chairs'} onClose={() => setSheet(null)}>
        <Txt variant="caption" tone="faint" upper style={{ marginBottom: space.sm }}>Send to</Txt>
        {chairs.map((c) => (
          <SheetOption key={c.id} label={c.name} active={c.id === selected?.id}
            hint={isChairOnline(c, now) ? 'In the chair' : 'Offline'} onPress={() => { select(c.id); setSheet(null); }} />
        ))}
      </Sheet>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  stage: { flex: 1, justifyContent: 'center' },
});
