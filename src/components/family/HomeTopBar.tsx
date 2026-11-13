import { StyleSheet, View } from 'react-native';
import { colors, space } from '@/theme/tokens';
import { Icon, PressableScale, Txt, type IconName } from '@/components/ui';

function BarButton({ icon, label, a11y, onPress }: { icon: IconName; label: string; a11y: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} pressedScale={0.9} hitSlop={6} style={styles.btn}>
      <Icon name={icon} size={26} strokeWidth={2.4} />
      <Txt variant="label" tone="faint" style={styles.btnLabel}>{label}</Txt>
    </PressableScale>
  );
}

/** "+ SEND" · NAME ● · "SETTINGS" — the only chrome on the home screen. */
export function HomeTopBar({ title, online, onPlus, onTitle, onSettings }: {
  title: string; online?: boolean | null; onPlus?: () => void; onTitle?: () => void; onSettings: () => void;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {onPlus ? <BarButton icon="plus" label="Send" a11y="Send a photo or a note" onPress={onPlus} /> : null}
      </View>
      <PressableScale onPress={onTitle} disabled={!onTitle} dimWhenDisabled={false} hapticStyle="select" pressedScale={0.97}
        accessibilityRole={onTitle ? 'button' : 'text'} style={styles.center}>
        <View style={styles.titleRow}>
          <Txt variant="label" numberOfLines={1} style={{ fontSize: 15, letterSpacing: 2.4 }}>{title}</Txt>
          {online !== null && online !== undefined ? (
            <View style={[styles.dot, { backgroundColor: online ? colors.primary : 'rgba(255,255,255,0.3)' }]} />
          ) : null}
        </View>
        {online !== null && online !== undefined ? (
          <Txt variant="caption" tone="faint" upper style={{ fontSize: 12, letterSpacing: 1.6, marginTop: 4 }}>{online ? 'In the chair' : 'Not in the chair'}</Txt>
        ) : null}
      </PressableScale>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        <BarButton icon="sliders" label="Settings" a11y="Settings" onPress={onSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, minHeight: 76 },
  side: { width: 84 },
  btn: { minWidth: 64, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnLabel: { fontSize: 11, letterSpacing: 1.4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
