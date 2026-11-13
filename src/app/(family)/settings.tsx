import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { OnlinePill } from '@/components/family';
import { GlossyButton, ListRow, ListSection, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
import { signOut, updateDisplayName } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { confirmAsync } from '@/hooks/confirm';
import { friendlyError } from '@/hooks/errors';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, patchUser } = useAuth();
  const { chairs, selected, select } = useChairs();
  const [name, setName] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => { setName(user?.displayName ?? ''); }, [user?.displayName]);
  const nameChanged = name.trim() && name.trim() !== user?.displayName;

  const saveName = async () => {
    const n = name.trim();
    if (!n) return;
    setSavingName(true);
    try {
      await updateDisplayName(n);
      patchUser({ displayName: n });
      toast.show('Name updated', 'success');
    } catch (e) {
      toast.show(friendlyError(e), 'error');
    } finally {
      setSavingName(false);
    }
  };

  const doSignOut = async () => {
    if (!(await confirmAsync('Sign out?', 'You can sign back in any time.', 'Sign out', true))) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/welcome');
    } catch (e) {
      toast.show(friendlyError(e), 'error');
      setSigningOut(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.xxl }]}>
        <ScreenHeader title="Settings" />
        <View style={styles.body}>
          <View style={{ gap: space.md }}>
            <TextField label="Your name" value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="done" onSubmitEditing={saveName} />
            <Txt variant="body" tone="faint" style={{ fontSize: 15 }}>The chair says “Message from {name.trim() || user?.displayName}”.</Txt>
            {nameChanged ? <GlossyButton title="Save name" size="md" loading={savingName} onPress={saveName} /> : null}
          </View>

          <ListSection title="Chairs">
            {chairs.length === 0 ? <ListRow label="No chair linked yet" /> : null}
            {chairs.map((c) => (
              <ListRow
                key={c.id}
                label={c.name}
                hint={<OnlinePill chair={c} />}
                right={c.id === selected?.id && chairs.length > 1 ? <View style={styles.activeDot} /> : null}
                onPress={() => router.push({ pathname: '/chairs/[id]', params: { id: c.id } })}
              />
            ))}
            {chairs.length > 1 && selected ? (
              chairs.filter((c) => c.id !== selected.id).map((c) => (
                <ListRow key={`use-${c.id}`} label={`Send to ${c.name}`} chevron={false}
                  onPress={() => { select(c.id); toast.show(`Now sending to ${c.name}`); }} />
              ))
            ) : null}
            <ListRow label={chairs.length ? 'Link another chair' : 'Link a chair'} hint="Enter the 6-digit code from the chair" onPress={() => router.push('/link')} />
          </ListSection>

          <ListSection title="Account">
            <ListRow label={signingOut ? 'Signing out…' : 'Sign out'} danger chevron={false} onPress={signingOut ? undefined : doSignOut} />
          </ListSection>

          <Txt variant="caption" tone="faint" upper align="center" style={{ letterSpacing: 4, marginTop: space.lg }}>The Chair</Txt>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.xxl, paddingTop: space.md },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFB52E' },
});
