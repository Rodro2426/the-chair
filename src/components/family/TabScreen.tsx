import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import { ScreenBackground, Txt } from '@/components/ui';
import { TabBar } from './TabBar';

/** Page frame for the family tabs: small mono kicker, big serif title, scrolling body, tab bar. */
export function TabScreen({ kicker, title, right, children }: { kicker?: string; title: string; right?: ReactNode; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + space.lg }]} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <View style={{ flex: 1, gap: space.xs }}>
            {kicker ? <Txt variant="label" tone="faint">{kicker}</Txt> : null}
            <Txt variant="title">{title}</Txt>
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
      <TabBar />
    </ScreenBackground>
  );
}

/** A titled block on a tab screen. */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Txt variant="label" tone="faint" style={{ flex: 1 }}>{title}</Txt>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.xl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  section: { gap: space.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.cardBorder, paddingBottom: space.sm },
});
