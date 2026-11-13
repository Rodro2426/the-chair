import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import { OnlinePill } from '@/components/family';
import { Avatar, Card, GlossyButton, Icon, IconBadge, PressableScale, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
import { signOut, updateDisplayName } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { confirmAsync } from '@/hooks/confirm';
import { friendlyError } from '@/hooks/errors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <Txt variant="caption" tone="faint" upper style={{ paddingHorizontal: space.xs }}>{title}</Txt>
      {children}
    </View>
  );
}

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
    <ScreenBackground glow="photo">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.xxl }]}>
        <ScreenHeader title="Settings" />
        <View style={styles.body}>
          <Section title="You">
            <Card style={{ gap: space.lg }}>
              <View style={styles.row}>
                <Avatar name={user?.displayName ?? '?'} size={56} />
                <View style={{ flex: 1 }}>
                  <Txt variant="heading">{user?.displayName}</Txt>
                  <Txt variant="caption" tone="muted">Shown as “Message from {user?.displayName}”</Txt>
                </View>
              </View>
              <TextField label="Display name" value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="done" onSubmitEditing={saveName} />
              {nameChanged && <GlossyButton title="Save name" size="md" accent="text" loading={savingName} onPress={saveName} />}
            </Card>
          </Section>

          <Section title="Chairs">
            {chairs.length === 0 && (
              <Card><Txt variant="body" tone="muted">No chair linked yet.</Txt></Card>
            )}
            {chairs.map((c) => (
              <PressableScale key={c.id} pressedScale={0.98} onPress={() => router.push({ pathname: '/chairs/[id]', params: { id: c.id } })}
                accessibilityRole="button" accessibilityLabel={`${c.name} settings`}>
                <Card style={styles.chairRow}>
                  <IconBadge name="chair" accent={c.id === selected?.id ? 'voice' : 'neutral'} size={52} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Txt variant="heading" numberOfLines={1}>{c.name}</Txt>
                    <OnlinePill chair={c} />
                  </View>
                  {c.id !== selected?.id && chairs.length > 1 ? (
                    <PressableScale onPress={() => { select(c.id); toast.show(`Now sending to ${c.name}`); }} hapticStyle="select" hitSlop={8}>
                      <Txt variant="caption" tone="primary">Use</Txt>
                    </PressableScale>
                  ) : null}
                  <Icon name="chevron" size={28} color={colors.textMuted} />
                </Card>
              </PressableScale>
            ))}
            <GlossyButton title={chairs.length ? 'Link another chair' : 'Link a chair'} icon="link" accent="neutral" size="md" onPress={() => router.push('/link')} />
          </Section>

          <Section title="Account">
            <GlossyButton title="Sign out" accent="danger" size="md" loading={signingOut} onPress={doSignOut} />
          </Section>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  chairRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
});
