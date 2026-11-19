import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { Grain } from '@/components/ui';

/** Graphite with film grain behind every chair screen. */
export function ChairBackground({ children }: { children?: ReactNode }) {
  return (
    <View style={styles.root}>
      <Grain />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
});
