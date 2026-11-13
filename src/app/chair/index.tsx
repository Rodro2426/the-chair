import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ChairBackground, ChairButton } from '@/components/chair';
import { getMyChairDevice } from '@/lib/api';
import { colors, space, type } from '@/theme/tokens';
import type { Chair } from '@/types';

/** Boot: decide between first-run setup, pairing (no family linked yet) and the ambient screen. */
export default function ChairBoot() {
  const [state, setState] = useState<{ chair: Chair | null; done: boolean; error: string | null }>({
    chair: null,
    done: false,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    getMyChairDevice()
      .then((chair) => alive && setState({ chair, done: true, error: null }))
      .catch((e) => alive && setState({ chair: null, done: false, error: String(e?.message ?? e) }));
    return () => {
      alive = false;
    };
  }, [attempt]);

  if (state.done) {
    if (!state.chair) return <Redirect href="/chair/setup" />;
    if (state.chair.memberUids.length === 0) return <Redirect href="/chair/pair" />;
    return <Redirect href="/chair/home" />;
  }

  return (
    <ChairBackground>
      <View style={styles.center}>
        {state.error ? (
          <>
            <Text style={styles.text}>Can’t reach the internet right now.</Text>
            <Text style={styles.muted}>{state.error}</Text>
            <ChairButton label="Try again" onPress={() => setAttempt((a) => a + 1)} />
          </>
        ) : (
          <ActivityIndicator size="large" color={colors.text} />
        )}
      </View>
    </ChairBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.lg },
  text: { ...type.chairBody, color: colors.text, textAlign: 'center' },
  muted: { ...type.body, color: colors.textMuted, textAlign: 'center' },
});
