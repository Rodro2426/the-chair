import { View } from 'react-native';
import { brand } from '@/theme/tokens';
import { Txt } from './Txt';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Black circle with white mono initials — same object as the day circles. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: brand.black,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    }}>
      <Txt variant="number" style={{ fontSize: size * 0.34, lineHeight: size * 0.44 }}>{initials(name)}</Txt>
    </View>
  );
}
