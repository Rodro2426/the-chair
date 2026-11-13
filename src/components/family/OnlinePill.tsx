import { StyleSheet, View } from 'react-native';
import { colors, space } from '@/theme/tokens';
import type { Chair } from '@/types';
import { Txt } from '@/components/ui';
import { useNow } from '@/hooks/useNow';
import { isChairOnline, lastSeenLabel } from './format';

/** Small status: yellow dot = in the chair, grey = offline, plus a plain-English label. */
export function OnlinePill({ chair }: { chair: Chair }) {
  const now = useNow(15_000);
  const online = isChairOnline(chair, now);
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: online ? colors.primary : 'rgba(255,255,255,0.3)' }]} />
      <Txt variant="caption" tone={online ? 'default' : 'faint'} upper>{lastSeenLabel(chair, now)}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
