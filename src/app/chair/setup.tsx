import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { ChairBackground, ChairButton } from '@/components/chair';
import { registerChairDevice } from '@/lib/api';
import { colors, fonts, space } from '@/theme/tokens';

/** First run — done by the family member installing the chair. */
export default function ChairSetup() {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();

  const submit = async () => {
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await registerChairDevice(trimmed);
      router.replace('/chair/pair');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <ChairBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>SET UP THIS CHAIR</Text>
          <Text style={styles.title}>Who will sit in this chair?</Text>
          <Text style={styles.help}>Type the name the family uses, like “Grandma Rosa”. It appears on the chair’s greeting.</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Grandma Rosa"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
            maxLength={40}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ChairButton label="Continue" onPress={submit} disabled={!trimmed} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ChairBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: space.xl, gap: space.lg, maxWidth: 820, width: '100%', alignSelf: 'center' },
  kicker: { fontFamily: fonts.monoMedium, fontSize: 20, letterSpacing: 5, color: colors.textMuted },
  title: { fontFamily: fonts.serif, fontSize: 64, lineHeight: 70, color: colors.text },
  help: { fontFamily: fonts.mono, fontSize: 20, lineHeight: 30, color: colors.textMuted },
  input: {
    fontFamily: fonts.mono,
    fontSize: 34,
    color: colors.text,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: space.md,
    marginVertical: space.lg,
    outlineStyle: 'none',
  } as object,
  error: { fontFamily: fonts.mono, fontSize: 20, color: colors.danger },
});
