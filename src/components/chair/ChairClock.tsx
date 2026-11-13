import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useClock } from '@/hooks/chair/useClock';
import { colors, type } from '@/theme/tokens';

/** Clock + date. Long-press for 3 seconds opens hidden settings (for family members only). */
export function ChairClock({ onSecretLongPress, align = 'left' }: { onSecretLongPress?: () => void; align?: 'left' | 'center' }) {
  const now = useClock();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <Pressable onLongPress={onSecretLongPress} delayLongPress={3000} accessibilityRole="text" hitSlop={20}>
      <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  time: { ...type.chairHuge, fontSize: 72, color: colors.text, fontVariant: ['tabular-nums'] },
  date: { ...type.chairBody, color: colors.textMuted },
});
