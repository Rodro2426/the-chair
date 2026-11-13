import { View } from 'react-native';
import { colors } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import type { Accent } from './palette';

/** Bare white line icon with a generous hit area (no chrome). */
export function IconButton({ name, onPress, size = 56, label, color = colors.text }: {
  name: IconName; onPress?: () => void; accent?: Accent; size?: number; label: string; color?: string;
}) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={10} pressedScale={0.88}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View>
        <Icon name={name} size={Math.round(Math.min(26, size * 0.46))} color={color} strokeWidth={2.4} />
      </View>
    </PressableScale>
  );
}
