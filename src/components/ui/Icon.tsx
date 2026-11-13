import { Text, type StyleProp, type TextStyle } from 'react-native';
import { colors } from '@/theme/tokens';

// Glyph-based icons (no icon library is installed). Branding can replace this
// component with an icon font / SVG set without touching any screen.
const glyphs = {
  mic: '🎙️',
  photo: '🌅',
  camera: '📷',
  gallery: '🖼️',
  text: '💬',
  chair: '🪑',
  link: '🔗',
  settings: '⚙️',
  history: '🕰️',
  check: '✓',
  back: '‹',
  close: '✕',
  plus: '+',
  play: '▶',
  pause: '❚❚',
  send: '↑',
  trash: '🗑️',
  edit: '✏️',
  volume: '🔊',
  heart: '❤️',
  wave: '👋',
  signout: '🚪',
  family: '👨‍👩‍👧',
  chevron: '›',
  lock: '🔒',
} as const;

export type IconName = keyof typeof glyphs;

const monochrome = new Set<IconName>(['check', 'back', 'close', 'plus', 'play', 'pause', 'send', 'chevron']);

export function Icon({ name, size = 22, color = colors.text, style }: {
  name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle>;
}) {
  const mono = monochrome.has(name);
  return (
    <Text
      allowFontScaling={false}
      style={[
        { fontSize: size, lineHeight: size * 1.2, textAlign: 'center' },
        mono && { color, fontWeight: '800' },
        style,
      ]}
    >
      {glyphs[name]}
    </Text>
  );
}
