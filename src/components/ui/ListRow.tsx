import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, space } from '@/theme/tokens';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

/** Section label + hairline-divided rows. */
export function ListSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View>
      {title ? <Txt variant="caption" tone="faint" upper style={styles.section}>{title}</Txt> : null}
      <View style={styles.group}>{children}</View>
    </View>
  );
}

/** One mono row: label (+ optional hint) on the left, value / chevron on the right. */
export function ListRow({ label, hint, value, right, onPress, danger, chevron = !!onPress }: {
  label: string; hint?: ReactNode; value?: string; right?: ReactNode; onPress?: () => void; danger?: boolean; chevron?: boolean;
}) {
  const body = (
    <>
      <View style={{ flex: 1, gap: 4 }}>
        <Txt variant="label" color={danger ? colors.danger : colors.text} style={{ fontSize: 15 }} numberOfLines={1}>{label}</Txt>
        {typeof hint === 'string' ? <Txt variant="body" tone="faint" style={{ fontSize: 15 }}>{hint}</Txt> : hint}
      </View>
      {value ? <Txt variant="number" tone="muted">{value}</Txt> : null}
      {right}
      {chevron ? <Icon name="chevron" size={18} color={colors.textFaint} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <PressableScale onPress={onPress} pressedScale={0.985} hapticStyle="select" accessibilityRole="button" accessibilityLabel={label} style={styles.row}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: space.sm },
  group: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.16)' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 68, paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.16)',
  },
});
