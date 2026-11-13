import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { GlossyButton, PressableScale, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
import { signUp } from '@/lib/api';
import { friendlyError } from '@/hooks/errors';

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('Tell us what Grandma calls you.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('That email doesn’t look right.');
    if (password.length < 6) return setError('Pick a password with at least 6 characters.');
    setBusy(true);
    try {
      await signUp(email.trim(), password, name.trim());
      toast.show(`Welcome, ${name.trim()}!`, 'success');
      router.replace('/home');
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground glow="text">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.xl }]}>
          <ScreenHeader title="Join the family" subtitle="Create your account" />
          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.form}>
            <TextField label="Your name (what they call you)" placeholder="e.g. Santi" value={name} onChangeText={setName}
              autoCapitalize="words" autoComplete="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />
            <Txt variant="caption" tone="faint">The chair will say “Message from {name.trim() || 'Santi'}”.</Txt>
            <TextField ref={emailRef} label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()} />
            <TextField ref={pwRef} label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword}
              secureTextEntry autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit} error={error} />
          </Animated.View>
          <View style={{ flex: 1 }} />
          <View style={styles.form}>
            <GlossyButton title="Create account" accent="text" loading={busy} onPress={submit} />
            <PressableScale onPress={() => router.replace('/sign-in')} style={styles.link} hapticStyle="select">
              <Txt variant="body" tone="muted">Have an account? </Txt>
              <Txt variant="body" tone="tertiary" style={{ fontWeight: '800' }}>Sign in</Txt>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 560, width: '100%', alignSelf: 'center' },
  form: { paddingHorizontal: space.lg, gap: space.md },
  link: { flexDirection: 'row', justifyContent: 'center', paddingVertical: space.sm },
});
