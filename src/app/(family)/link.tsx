import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import type { Chair } from '@/types';
import { CodeInput, type CodeInputHandle } from '@/components/family';
import { ExtrudedCheck, GlossyButton, ScreenBackground, ScreenHeader, Sphere, Txt, haptic, useToast } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { linkChairWithCode } from '@/lib/api';
import { useChairs } from '@/hooks/useChairs';
import { friendlyError } from '@/hooks/errors';

export default function LinkChair() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { select } = useChairs();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linked, setLinked] = useState<Chair | null>(null);
  const input = useRef<CodeInputHandle>(null);

  const submit = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const chair = await linkChairWithCode(value);
      select(chair.id);
      haptic.success();
      setLinked(chair);
      setTimeout(() => router.replace('/home'), 1600);
    } catch (e) {
      const msg = friendlyError(e, 'That code didn’t work. Codes expire after 10 minutes — check the chair’s screen.');
      setError(msg);
      input.current?.shake();
      setCode('');
      toast.show(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (linked) {
    return (
      <ScreenBackground>
        <View style={styles.success}>
          <Animated.View entering={ZoomIn.springify().damping(10)}>
            <Sphere size={150} ring={11}><ExtrudedCheck size={84} /></Sphere>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(150).springify()} style={{ gap: space.sm, alignItems: 'center' }}>
            <Txt variant="display" align="center">Linked</Txt>
            <View style={{ width: 24, height: 2, backgroundColor: colors.primary }} />
            <Txt variant="label" align="center" style={{ marginTop: space.md }}>{linked.name}</Txt>
            <Txt variant="label" tone="faint" align="center" style={{ fontSize: 13 }}>is ready to hear from you</Txt>
          </Animated.View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
          <ScreenHeader close title="Link a chair" />
          <View style={styles.body}>
            <Txt variant="display" style={{ fontSize: 54, lineHeight: 58, marginTop: space.md }}>Enter the{'\n'}code.</Txt>
            <Txt variant="body" tone="muted">
              Six digits, shown on the chair’s screen. No code? Long-press the chair’s clock and tap “Show pairing code”.
            </Txt>
            <View style={{ height: space.md }} />
            <CodeInput ref={input} value={code} onChange={(v) => { setCode(v); setError(null); }} onComplete={(v) => submit(v)} error={!!error} disabled={busy} />
            {!!error && <Txt variant="caption" tone="danger" align="center">{error}</Txt>}
          </View>
          <View style={{ flex: 1, minHeight: space.xl }} />
          <View style={styles.body}>
            <GlossyButton title="Link chair" accent="voice" loading={busy} disabled={code.length !== 6} onPress={() => submit()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 560, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.lg },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl, padding: space.lg },
});
