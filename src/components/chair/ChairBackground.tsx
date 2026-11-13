import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, gradients } from '@/theme/tokens';

/** Warm full-screen gradient used behind every chair screen. */
export function ChairBackground({ children }: { children?: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[gradients.voice[2], gradients.background[0], gradients.background[1]]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
