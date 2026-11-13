import { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { brand, colors, space } from '@/theme/tokens';
import { Icon, PressableScale, Txt } from '@/components/ui';
import { dayKey } from './format';

const DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Last six days + TODAY as black circles. A day is complete (white ring + check)
 * when anything — voice, photo or note — was sent. Tap → the conversation.
 */
export function WeekRow({ sentAt, now = Date.now(), onPress, dim }: {
  /** createdAt of messages (any order). */
  sentAt: number[]; now?: number; onPress?: () => void; dim?: boolean;
}) {
  const { width } = useWindowDimensions();
  const done = useMemo(() => new Set(sentAt.map(dayKey)), [sentAt]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { date: d.getDate(), name: i === 6 ? 'TODAY' : DAY[d.getDay()], complete: done.has(dayKey(d)), today: i === 6 };
  }), [now, done]);

  const avail = Math.min(width, 560) - space.lg * 2 - 22;
  const col = Math.max(36, Math.min(50, Math.floor(avail / 7)));
  const circle = Math.min(42, col - 6);

  return (
    <PressableScale onPress={onPress} disabled={!onPress} dimWhenDisabled={false} pressedScale={0.98} hapticStyle="select"
      accessibilityRole="button" accessibilityLabel="Open conversation history" style={[styles.row, dim && { opacity: 0.45 }]}>
      {days.map((d) => (
        <View key={d.name + d.date} style={[styles.col, { width: col }]}>
          <View style={[styles.circle, { width: circle, height: circle, borderRadius: circle / 2 }, d.complete && styles.complete]}>
            {d.complete
              ? <Icon name="check" size={circle * 0.5} strokeWidth={2.6} />
              : <Txt variant="number" style={{ fontSize: 14 }}>{d.date}</Txt>}
          </View>
          <Txt variant="label" tone={d.today ? 'default' : 'muted'} style={styles.name} numberOfLines={1}>{d.name}</Txt>
          <View style={[styles.underline, !d.today && { opacity: 0 }]} />
        </View>
      ))}
      <View style={styles.more}><Icon name="dots" size={18} /></View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', alignSelf: 'center' },
  col: { alignItems: 'center' },
  circle: { backgroundColor: brand.black, alignItems: 'center', justifyContent: 'center' },
  complete: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.text },
  name: { fontSize: 12, letterSpacing: 0.8, marginTop: space.sm + 2 },
  underline: { width: 24, height: 2, borderRadius: 1, backgroundColor: colors.primary, marginTop: 5 },
  more: { width: 22, height: 42, alignItems: 'center', justifyContent: 'center' },
});
