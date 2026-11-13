import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { OnlinePill, VolumeSlider } from '@/components/family';
import { GlossyButton, ListRow, ListSection, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
import { renameChair, setChairVolume, unlinkChair } from '@/lib/api';
import { useChair } from '@/hooks/useChairs';
import { confirmAsync } from '@/hooks/confirm';
import { friendlyError } from '@/hooks/errors';

export default function ChairSettings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chair = useChair(id);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [name, setName] = useState(chair?.name ?? '');
  const [volume, setVolume] = useState(chair?.volume ?? 0.8);
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const leaving = useRef(false);

  useEffect(() => { if (chair) setName(chair.name); }, [chair?.name]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (chair) setVolume(chair.volume); }, [chair?.volume]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!chair) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top, flex: 1 }}>
          <ScreenHeader title="Chair not found" />
          {!leaving.current && <Txt variant="body" tone="muted" style={{ paddingHorizontal: space.lg }}>It may have been unlinked.</Txt>}
        </View>
      </ScreenBackground>
    );
  }

  const changed = name.trim() && name.trim() !== chair.name;

  const save = async () => {
    setSaving(true);
    try {
      await renameChair(chair.id, name.trim());
      toast.show('Renamed', 'success');
    } catch (e) {
      toast.show(friendlyError(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const commitVolume = async (v: number) => {
    try {
      await setChairVolume(chair.id, Math.round(v * 100) / 100);
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t change the volume.'), 'error');
      setVolume(chair.volume);
    }
  };

  const unlink = async () => {
    const ok = await confirmAsync(`Unlink ${chair.name}?`, 'You’ll stop being able to send messages to this chair until you pair again.', 'Unlink', true);
    if (!ok) return;
    setUnlinking(true);
    try {
      leaving.current = true;
      await unlinkChair(chair.id);
      toast.show(`Unlinked ${chair.name}`);
      router.replace('/home');
    } catch (e) {
      leaving.current = false;
      toast.show(friendlyError(e), 'error');
      setUnlinking(false);
    }
  };

  const pct = Math.round(volume * 100);

  return (
    <ScreenBackground>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.xxl }]}>
        <ScreenHeader title={chair.name} subtitle="Chair settings" />
        <View style={styles.body}>
          <OnlinePill chair={chair} />

          <View style={{ gap: space.md }}>
            <TextField label="Grandparent’s name" value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="done" onSubmitEditing={() => changed && save()} />
            {changed ? <GlossyButton title="Save name" size="md" loading={saving} onPress={save} /> : null}
          </View>

          <View style={{ gap: space.xs }}>
            <View style={styles.volHead}>
              <Txt variant="caption" tone="faint" upper>Volume</Txt>
              <Txt variant="number" style={{ fontSize: 22, lineHeight: 28 }}>{pct}%</Txt>
            </View>
            <VolumeSlider value={volume} onChange={setVolume} onCommit={commitVolume} />
            <Txt variant="body" tone="faint" style={{ fontSize: 15 }}>How loud messages play on the chair.</Txt>
          </View>

          <ListSection title="Family">
            <ListRow label="People on this chair" value={String(chair.memberUids.length)} />
            <ListRow label="Linked since" value={new Date(chair.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()} />
            <ListRow label={unlinking ? 'Unlinking…' : 'Unlink this chair'} danger chevron={false} onPress={unlinking ? undefined : unlink} />
          </ListSection>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.xxl, paddingTop: space.md },
  volHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
});
