import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { space } from '@/theme/tokens';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

/** Top bar with a round back/close button, optional big title and a right slot. */
export function ScreenHeader({ title, subtitle, right, close, onBack }: {
  title?: string; subtitle?: string; right?: ReactNode; close?: boolean; onBack?: () => void;
}) {
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')));
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <IconButton name={close ? 'close' : 'back'} label={close ? 'Close' : 'Back'} onPress={back} />
        <View style={{ flex: 1 }} />
        {right}
      </View>
      {title && (
        <View style={{ marginTop: space.lg }}>
          {subtitle && <Txt variant="caption" tone="muted" upper>{subtitle}</Txt>}
          <Txt variant="display">{title}</Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center' },
});
