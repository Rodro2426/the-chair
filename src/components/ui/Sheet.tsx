import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, radius, space } from '@/theme/tokens';
import { Grain } from './Grain';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

/** Minimal bottom sheet: graphite slab with grain, a grab bar, your rows. Tap outside to close. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(180)} style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View entering={SlideInDown.springify().damping(20).stiffness(220)} style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
          <Grain />
          <View style={styles.grab} />
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/** One big mono option row inside a Sheet. */
export function SheetOption({ label, hint, icon, onPress, active }: {
  label: string; hint?: string; icon?: IconName; onPress: () => void; active?: boolean;
}) {
  return (
    <PressableScale onPress={onPress} pressedScale={0.98} hapticStyle="select" accessibilityRole="button" accessibilityLabel={label} style={styles.option}>
      {icon ? <Icon name={icon} size={22} strokeWidth={2} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="label" style={{ fontSize: 17, lineHeight: 24, letterSpacing: 2.4 }}>{label}</Txt>
        {hint ? <Txt variant="caption" tone="faint" upper>{hint}</Txt> : null}
      </View>
      {active ? <View style={styles.activeDot} /> : <Icon name="chevron" size={18} color={colors.textFaint} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#202020', borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, overflow: 'hidden',
    paddingTop: space.sm, paddingHorizontal: space.lg, width: '100%', maxWidth: 640, alignSelf: 'center',
    borderWidth: 1, borderBottomWidth: 0, borderColor: brand.divider,
  },
  grab: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: space.md },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)',
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
