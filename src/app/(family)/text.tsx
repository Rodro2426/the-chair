import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/theme/tokens';
import { GlossyButton, PressableScale, ScreenBackground, ScreenHeader, Txt, useToast } from '@/components/ui';
import { sendText } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useChairs } from '@/hooks/useChairs';
import { friendlyError } from '@/hooks/errors';

const MAX = 280;
const IDEAS = ['Good morning!', 'I love you', 'Thinking of you today', 'See you on Sunday!', 'Did you sleep well?', 'Sending you a big hug'];

export default function ComposeText() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const { selected } = useChairs();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const trimmed = text.trim();

  const send = async () => {
    if (!selected || !trimmed) return;
    setBusy(true);
    try {
      await sendText(selected.id, trimmed);
      toast.show(`${selected.name} will hear it soon`, 'success');
      router.back();
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t send your note. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
          <ScreenHeader close title="Write a note" subtitle={selected ? `For ${selected.name}` : undefined} />
          <View style={styles.body}>
            <View>
              <TextInput
                value={text}
                onChangeText={(t) => setText(t.slice(0, MAX))}
                placeholder="Type something sweet…"
                placeholderTextColor={colors.textFaint}
                selectionColor={colors.primary}
                multiline
                autoFocus
                style={styles.input}
              />
              <View style={styles.counterRow}>
                <Txt variant="caption" tone="faint" upper>Read out loud</Txt>
                <Txt variant="number" tone={text.length > MAX - 20 ? 'danger' : 'faint'} style={{ fontSize: 13 }}>{text.length}/{MAX}</Txt>
              </View>
            </View>

            <View style={styles.ideas}>
              {IDEAS.map((idea) => (
                <PressableScale key={idea} hapticStyle="select" onPress={() => setText(idea)} style={styles.chip}>
                  <Txt variant="body" style={{ fontSize: 13 }}>{idea}</Txt>
                </PressableScale>
              ))}
            </View>

            {!!trimmed && (
              <View style={styles.preview}>
                <Txt variant="caption" tone="faint" upper>They’ll hear</Txt>
                <Txt variant="body" tone="muted">“Message from {user?.displayName ?? 'you'}. {trimmed}”</Txt>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.body}>
            <GlossyButton title="Send note" icon="send" accent="voice" loading={busy} disabled={!trimmed || !selected} onPress={send} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.lg },
  input: {
    fontFamily: fonts.mono, fontSize: 22, lineHeight: 32, color: colors.text, minHeight: 160, textAlignVertical: 'top',
    paddingVertical: space.sm, borderBottomWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)', outlineStyle: 'none',
  } as object,
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
  ideas: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  preview: { gap: 4 },
});
