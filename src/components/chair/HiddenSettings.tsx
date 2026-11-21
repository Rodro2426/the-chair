import { Modal, StyleSheet, Text, View } from 'react-native';
import { brand, colors, fonts, radius, space } from '@/theme/tokens';
import { ChairButton } from './ChairButton';

/** Chair settings: opened from the Settings button (or a 3s long-press on the clock). */
export function HiddenSettings({
  visible,
  chairName,
  onShowPairing,
  onReset,
  onLogout,
  onClose,
}: {
  visible: boolean;
  chairName?: string;
  onShowPairing: () => void;
  onReset: () => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <Text style={styles.title}>CHAIR SETTINGS</Text>
          {chairName ? <Text style={styles.sub}>{chairName}’s chair</Text> : null}
          <ChairButton label="Show pairing code" onPress={onShowPairing} style={styles.btn} />
          <ChairButton label="Log out" icon="signout" variant="quiet" onPress={onLogout} style={styles.btn} />
          <ChairButton label="Reset this chair" variant="danger" onPress={onReset} style={styles.btn} />
          <ChairButton label="Close" variant="quiet" onPress={onClose} style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(47,33,22,0.45)', alignItems: 'center', justifyContent: 'center', padding: space.lg },
  sheet: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: brand.black,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: space.xl,
    gap: space.md,
  },
  title: { fontFamily: fonts.monoMedium, fontSize: 28, letterSpacing: 4, color: colors.text },
  sub: { fontFamily: fonts.mono, fontSize: 22, color: colors.textMuted, marginBottom: space.sm },
  btn: { minHeight: 88 },
});
