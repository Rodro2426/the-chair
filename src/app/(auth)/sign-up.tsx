import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, type TextInputInstance, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
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
  const emailRef = useRef<TextInputInstance>(null);
  const pwRef = useRef<TextInputInstance>(null);

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
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.xl }]}>
          <ScreenHeader title="Create account" />
          <Txt variant="display" style={styles.headline}>Join the{'\n'}family.</Txt>
          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.form}>
            <TextField label="Your name (what they call you)" placeholder="e.g. Santi" value={name} onChangeText={setName}
              autoCapitalize="words" autoComplete="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />
            <Txt variant="caption" tone="faint" style={{ letterSpacing: 0.4, marginTop: -space.sm }}>The chair will say “Message from {name.trim() || 'Santi'}”.</Txt>
            <TextField ref={emailRef} label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()} />
            <TextField ref={pwRef} label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword}
              secureTextEntry autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit} error={error} />
          </Animated.View>
          <View style={{ flex: 1 }} />
          <View style={styles.form}>
            <GlossyButton title="Create account" accent="voice" loading={busy} onPress={submit} />
            <PressableScale onPress={() => router.replace('/sign-in')} style={styles.link} hapticStyle="select">
              <Txt variant="label" tone="faint" style={styles.small}>Have an account?</Txt>
              <View>
                <Txt variant="label" style={styles.small}>Sign in</Txt>
                <View style={styles.underline} />
              </View>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 560, width: '100%', alignSelf: 'center' },
  form: { paddingHorizontal: space.lg, gap: space.lg },
  headline: { fontSize: 56, lineHeight: 60, paddingHorizontal: space.lg, marginTop: space.lg, marginBottom: space.xl },
  small: { fontSize: 13, letterSpacing: 1.6 },
  underline: { height: 2, width: 20, backgroundColor: colors.primary, marginTop: 4 },
  link: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: space.sm, paddingVertical: space.md },
});
