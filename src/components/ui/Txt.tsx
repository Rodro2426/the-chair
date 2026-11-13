import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, type as typeScale } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'caption';
type Tone = 'default' | 'muted' | 'faint' | 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';

const toneColor: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  faint: colors.textFaint,
  primary: colors.primary,
  secondary: colors.secondary,
  tertiary: colors.tertiary,
  danger: colors.danger,
  success: colors.success,
};

export interface TxtProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  color?: string;
  align?: TextStyle['textAlign'];
  upper?: boolean;
}

/** All app text goes through here so branding can swap font families in one place. */
export function Txt({ variant = 'body', tone = 'default', color, align, upper, style, ...rest }: TxtProps) {
  return (
    <Text
      {...rest}
      style={[
        typeScale[variant],
        { color: color ?? toneColor[tone], textAlign: align },
        upper && { textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}
