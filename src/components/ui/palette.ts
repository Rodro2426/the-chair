import { brand, colors, colorsUi } from '@/theme/tokens';

export type Accent = 'voice' | 'photo' | 'text' | 'neutral' | 'danger';

/**
 * Monochrome accent map. Every "accent" is white-on-graphite now; the names are
 * kept so older call sites keep compiling. `solid` = fill, `label` = text on fill.
 */
export const accentPalette: Record<Accent, {
  face: readonly [string, string, ...string[]];
  depth: string;
  label: string;
  solid: string;
  outline: boolean;
}> = {
  voice: { face: ['#FFFFFF', '#E6E6E6'], depth: brand.black, label: colorsUi.onAccent, solid: brand.white, outline: false },
  photo: { face: ['#FFFFFF', '#E6E6E6'], depth: brand.black, label: colorsUi.onAccent, solid: brand.white, outline: false },
  text: { face: ['#FFFFFF', '#E6E6E6'], depth: brand.black, label: colorsUi.onAccent, solid: brand.white, outline: false },
  neutral: { face: ['transparent', 'transparent'], depth: brand.black, label: colors.text, solid: 'transparent', outline: true },
  danger: { face: ['transparent', 'transparent'], depth: brand.black, label: colors.danger, solid: 'transparent', outline: true },
};
