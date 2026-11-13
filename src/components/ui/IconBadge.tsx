import { View } from 'react-native';
import { brand } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import type { Accent } from './palette';

/** Black circle holding a white line icon. `accent` is ignored (monochrome). */
export function IconBadge({ name, size = 56 }: { name: IconName; accent?: Accent; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: brand.black,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={name} size={size * 0.42} />
    </View>
  );
}
