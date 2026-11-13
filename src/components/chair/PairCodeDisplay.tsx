import { StyleSheet, Text, View } from 'react-native';
import { brand, colors, fonts, space } from '@/theme/tokens';

/** The 6-digit pairing code as six big black circles with off-white mono digits. */
export function PairCodeDisplay({ code, size = 120 }: { code: string | null; size?: number }) {
  const digits = (code ?? '').padEnd(6, ' ').slice(0, 6).split('');
  return (
    <View style={styles.row} accessibilityLabel={code ? `Pairing code ${digits.join(' ')}` : 'Loading pairing code'}>
      {digits.map((d, i) => (
        <View key={i} style={[styles.cell, { width: size, height: size, borderRadius: size / 2 }, i === 3 && { marginLeft: space.lg }]}>
          {d.trim() ? (
            <Text style={[styles.digit, { fontSize: size * 0.5, lineHeight: size * 0.62 }]}>{d}</Text>
          ) : (
            <View style={styles.dot} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, justifyContent: 'center' },
  cell: { backgroundColor: brand.black, alignItems: 'center', justifyContent: 'center' },
  digit: { fontFamily: fonts.monoMedium, color: colors.text, fontVariant: ['tabular-nums'] },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)' },
});
