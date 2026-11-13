import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, colorsUi, radius, space } from '@/theme/tokens';
import type { Chair } from '@/types';
import { PressableScale, Txt } from '@/components/ui';

/** Horizontal chip row to switch between chairs when a family member has several. */
export function ChairSwitcher({ chairs, selectedId, onSelect }: { chairs: Chair[]; selectedId?: string; onSelect: (id: string) => void }) {
  if (chairs.length < 2) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chairs.map((c) => {
        const on = c.id === selectedId;
        return (
          <PressableScale key={c.id} hapticStyle="select" onPress={() => onSelect(c.id)}
            style={[styles.chip, on && styles.chipOn]}>
            <Txt variant="caption" color={on ? colorsUi.onAccent : colors.textMuted}>{c.name}</Txt>
          </PressableScale>
        );
      })}
      <View style={{ width: space.md }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, paddingHorizontal: space.lg },
  chip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, backgroundColor: colorsUi.inputBg, borderWidth: 1, borderColor: colors.cardBorder },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
