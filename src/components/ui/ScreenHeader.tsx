import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { space } from '@/theme/tokens';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

/** Minimal top bar: back/close icon left, small mono uppercase title centered, optional right slot. */
export function ScreenHeader({ title, subtitle, right, close, onBack }: {
  title?: string; subtitle?: string; right?: ReactNode; close?: boolean; onBack?: () => void;
}) {
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        <IconButton name={close ? 'close' : 'back'} label={close ? 'Close' : 'Back'} onPress={back} />
      </View>
      <View style={styles.center}>
        {title ? <Txt variant="label" numberOfLines={1} align="center">{title}</Txt> : null}
        {subtitle ? <Txt variant="caption" tone="faint" upper numberOfLines={1} align="center" style={{ marginTop: 2 }}>{subtitle}</Txt> : null}
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.md, minHeight: 60 },
  side: { width: 88, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
});
