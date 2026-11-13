import { colors, colorsUi, gradients, gradientsUi } from '@/theme/tokens';

export type Accent = 'voice' | 'photo' | 'text' | 'neutral' | 'danger';

/** Maps an accent to its gradient face, "underside" depth color and label color. */
export const accentPalette: Record<Accent, {
  face: readonly [string, string, ...string[]];
  depth: string;
  label: string;
  solid: string;
}> = {
  voice: { face: gradients.voice, depth: colors.primaryDeep, label: colorsUi.onAccent, solid: colors.primary },
  photo: { face: gradients.photo, depth: colors.secondaryDeep, label: colorsUi.onAccentLight, solid: colors.secondary },
  text: { face: gradients.text, depth: colors.tertiaryDeep, label: colorsUi.onAccent, solid: colors.tertiary },
  neutral: { face: gradientsUi.neutral, depth: colorsUi.depthNeutral, label: colors.text, solid: colors.card },
  danger: { face: gradientsUi.danger, depth: colorsUi.dangerDeep, label: colorsUi.onAccentLight, solid: colors.danger },
};
