import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { OnlinePill, VolumeSlider } from '@/components/family';
import { Card, GlossyButton, Icon, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
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

          <Card style={{ gap: space.md }}>
            <TextField label="Grandparent’s name" value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="done" onSubmitEditing={() => changed && save()} />
            {changed && <GlossyButton title="Save name" size="md" accent="text" loading={saving} onPress={save} />}
          </Card>

          <Card style={{ gap: space.md }}>
            <View style={styles.volHead}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Icon name="volume" size={22} />
                <Txt variant="heading">Chair volume</Txt>
              </View>
              <Txt variant="title" tone="primary" style={{ fontVariant: ['tabular-nums'] }}>{pct}%</Txt>
            </View>
            <VolumeSlider value={volume} onChange={setVolume} onCommit={commitVolume} />
            <Txt variant="caption" tone="faint">How loud messages play on the chair.</Txt>
          </Card>

          <Card style={{ gap: 6 }}>
            <Txt variant="caption" tone="faint" upper>Family on this chair</Txt>
            <Txt variant="heading">{chair.memberUids.length} {chair.memberUids.length === 1 ? 'person' : 'people'}</Txt>
            <Txt variant="caption" tone="muted">Linked since {new Date(chair.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</Txt>
          </Card>

          <GlossyButton title="Unlink this chair" accent="danger" size="md" loading={unlinking} onPress={unlink} />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.lg },
  volHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
