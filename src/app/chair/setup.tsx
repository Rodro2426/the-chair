import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { ChairBackground, ChairButton } from '@/components/chair';
import { registerChairDevice } from '@/lib/api';
import { colors, radius, space, type } from '@/theme/tokens';

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
          <Text style={styles.kicker}>Set up this chair</Text>
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
  kicker: { ...type.heading, color: colors.primary },
  title: { ...type.chairHuge, fontSize: 52, color: colors.text },
  help: { ...type.heading, color: colors.textMuted, fontWeight: '500' },
  input: {
    ...type.chairBody,
    color: colors.text,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  error: { ...type.heading, color: colors.danger },
});
