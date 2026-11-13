import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts, type as typeScale } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'caption' | 'label' | 'number';
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

const extra: Record<'label' | 'number', TextStyle> = {
  // Small mono uppercase label — nav titles, day names, hints.
  label: { fontFamily: fonts.monoMedium, fontSize: 14, lineHeight: 20, letterSpacing: 2, textTransform: 'uppercase' },
  // Tabular mono numbers — timers, day numbers, codes.
  number: { fontFamily: fonts.monoMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0.5, fontVariant: ['tabular-nums'] },
};

export interface TxtProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  color?: string;
  align?: TextStyle['textAlign'];
  upper?: boolean;
}

/** All app text goes through here: mono for UI, a refined serif for rare big moments. */
export function Txt({ variant = 'body', tone = 'default', color, align, upper, style, ...rest }: TxtProps) {
  const base = variant === 'label' || variant === 'number' ? extra[variant] : typeScale[variant];
  return (
    <Text
      {...rest}
      style={[
        base,
        { color: color ?? toneColor[tone], textAlign: align },
        upper && { textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}
