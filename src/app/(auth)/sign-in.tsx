import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { GlossyButton, PressableScale, ScreenBackground, ScreenHeader, TextField, Txt } from '@/components/ui';
import { signIn } from '@/lib/api';
import { friendlyError } from '@/hooks/errors';

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pwRef = useRef<TextInput>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
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
          <ScreenHeader title="Welcome back" subtitle="Sign in" />
          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.form}>
            <TextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()} />
            <TextField ref={pwRef} label="Password" placeholder="Your password" value={password} onChangeText={setPassword}
              secureTextEntry autoComplete="current-password" returnKeyType="go" onSubmitEditing={submit} error={error} />
          </Animated.View>
          <View style={{ flex: 1 }} />
          <View style={styles.form}>
            <GlossyButton title="Sign in" accent="voice" loading={busy} onPress={submit} />
            <PressableScale onPress={() => router.replace('/sign-up')} style={styles.link} hapticStyle="select">
              <Txt variant="body" tone="muted">New here? </Txt>
              <Txt variant="body" tone="primary" style={{ fontWeight: '800' }}>Create an account</Txt>
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
