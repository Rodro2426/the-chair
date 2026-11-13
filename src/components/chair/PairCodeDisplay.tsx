import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '@/theme/tokens';

/** The 6-digit pairing code rendered huge, as two groups of three digits. */
export function PairCodeDisplay({ code, size = 120 }: { code: string | null; size?: number }) {
  const digits = (code ?? '······').padEnd(6, '·').slice(0, 6).split('');
  return (
    <View style={styles.row} accessibilityLabel={code ? `Pairing code ${digits.join(' ')}` : 'Loading pairing code'}>
      {digits.map((d, i) => (
        <View key={i} style={[styles.cell, { width: size * 0.78, height: size * 1.15 }, i === 3 && { marginLeft: space.lg }]}>
          <Text style={[styles.digit, { fontSize: size, lineHeight: size * 1.1 }]}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, justifyContent: 'center' },
  cell: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { ...type.chairHuge, color: colors.text, fontVariant: ['tabular-nums'], letterSpacing: 0 },
});
