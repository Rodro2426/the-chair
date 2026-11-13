import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChairBackground, ChairButton, PairCodeDisplay } from '@/components/chair';
import { useChairDevice } from '@/hooks/chair/useChairDevice';
import { startPairing, stopPairing } from '@/lib/api';
import { colors, fonts, space } from '@/theme/tokens';

const formatLeft = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Shows a 6-digit code family members type into their phone. Refreshes automatically on expiry. */
export default function ChairPair() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  // Live chair doc (subscribeChair) so the linked-family count updates instantly.
  const { chair, loading } = useChairDevice();
  const [code, setCode] = useState<{ code: string; expiresAt: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const fetching = useRef(false);
  const lastAttempt = useRef(0);
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const chairId = chair?.id;

  const newCode = useCallback(async () => {
    if (!chairId || fetching.current) return;
    fetching.current = true;
    lastAttempt.current = Date.now();
    try {
      setCode(await startPairing(chairId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      fetching.current = false;
    }
  }, [chairId]);

  useEffect(() => {
    newCode();
    // Leaving the screen: clear the code so it can't be used later.
    return () => {
      if (chairId) stopPairing(chairId).catch(() => {});
    };
  }, [newCode, chairId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-refresh once expired (or after an error), at most one attempt every 10s.
  const left = code ? code.expiresAt - now : 0;
  const needsCode = !!error || (code !== null && left <= 0);
  useEffect(() => {
    if (chairId && needsCode && now - lastAttempt.current >= 10_000) newCode();
  }, [chairId, needsCode, now, newCode]);

  useEffect(() => {
    if (!loading && !chair) router.replace('/chair');
  }, [loading, chair]);

  const members = chair?.memberUids.length ?? 0;
  const codeSize = Math.min(landscape ? height * 0.16 : width * 0.12, 150);

  return (
    <ChairBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{chair ? `${chair.name.toUpperCase()}’S CHAIR` : ' '}</Text>
        <Text style={styles.title}>Link a family phone</Text>
        <PairCodeDisplay code={code && left > 0 ? code.code : null} size={codeSize} />
        <Text style={styles.countdown}>
          {error ? 'Getting a new code…' : code && left > 0 ? `New code in ${formatLeft(left)}` : 'Getting a code…'}
        </Text>
        <View style={styles.steps}>
          <Text style={styles.step}>On your phone: The Chair → Settings → Link a chair</Text>
          <Text style={styles.stepMuted}>Then type the 6 numbers above.</Text>
        </View>
        <View style={styles.linked}>
          <Text style={[styles.linkedText, members > 0 && { color: colors.text }]}>
            {members === 0 ? 'No family linked yet' : `${members} family ${members === 1 ? 'member' : 'members'} linked`}
          </Text>
        </View>
        <ChairButton
          label={from === 'settings' ? 'Back' : members > 0 ? 'Start the chair' : 'Skip for now'}
          variant={members > 0 || from === 'settings' ? 'primary' : 'quiet'}
          onPress={() => {
            if (from === 'settings' && router.canGoBack()) router.back();
            else router.replace('/chair/home');
          }}
          style={styles.cta}
        />
      </ScrollView>
    </ChairBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.lg },
  kicker: { fontFamily: fonts.monoMedium, fontSize: 22, letterSpacing: 5, color: colors.textMuted },
  title: { fontFamily: fonts.serif, fontSize: 60, lineHeight: 68, color: colors.text, textAlign: 'center', marginBottom: space.md },
  countdown: { fontFamily: fonts.monoMedium, fontSize: 24, letterSpacing: 2, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  steps: { alignItems: 'center', gap: space.xs, maxWidth: 900 },
  step: { fontFamily: fonts.mono, fontSize: 26, color: colors.text, textAlign: 'center' },
  stepMuted: { fontFamily: fonts.mono, fontSize: 22, color: colors.textMuted, textAlign: 'center' },
  linked: { paddingVertical: space.sm },
  linkedText: { fontFamily: fonts.monoMedium, fontSize: 22, letterSpacing: 2, color: colors.textFaint },
  cta: { minWidth: 360 },
});
