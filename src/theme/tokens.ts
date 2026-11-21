// The Chair design tokens — warm cream and caramel brown, one glossy sphere, mono type.
// See docs/BRAND.md. Key names are stable (screens import them); values are the brand.

/** Font family names, loaded in src/app/_layout.tsx with useFonts. */
export const fonts = {
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  display: 'InstrumentSerif_400Regular',
};

export const colors = {
  bg: '#EFE5DA', // warm cream — the whole app is this one solid colour
  bgElevated: '#FAF5EC', // card cream
  card: '#FAF5EC',
  cardBorder: '#E2D5C0',
  text: '#2F2116', // deep brown ink
  textMuted: 'rgba(47,33,22,0.72)',
  textFaint: 'rgba(47,33,22,0.48)',
  // Accent: caramel brown (the chair), used for primary buttons, underlines, progress.
  primary: '#804905',
  primaryDeep: '#5E3503',
  secondary: '#454764', // slate blue (from the illustration)
  secondaryDeep: '#2F3048',
  tertiary: '#C57F6B', // terracotta
  tertiaryDeep: '#9E5A47',
  danger: '#B4432F',
  success: '#804905',
};

/** Brand-only extras. */
export const brand = {
  black: '#FAF5EC', // "surface": day circles, code cells, toasts, icons on dark fills (name kept for call sites)
  well: '#83540B', // caramel well around the sphere — the chair
  white: '#FFFFFF',
  grey: '#8E7F6E',
  greyDark: '#D9CCBA', // tracks, off switches
  divider: 'rgba(47,33,22,0.12)',
  lavender: '#B6B4BC',
  grainOpacity: 0, // solid colour: no texture
};

export const gradients = {
  // Monochrome sphere-ish faces (kept for legacy accent consumers).
  voice: ['#FFFFFF', '#D9D9D9', '#A9A9A9'] as const,
  photo: ['#FFFFFF', '#D9D9D9', '#A9A9A9'] as const,
  text: ['#FFFFFF', '#D9D9D9', '#A9A9A9'] as const,
  background: ['#EFE5DA', '#EFE5DA'] as const,
};

// Sharp edges: rectangles, not pills. Real circles (sphere, day dots, code dots, play) use size/2.
export const radius = { sm: 2, md: 4, lg: 6, xl: 8, pill: 4 };
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const type = {
  // Refined serif — big, rare headlines only.
  display: { fontFamily: fonts.display, fontSize: 60, lineHeight: 62, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.3 },
  // Everything else is mono. Generous sizes: the family app is used by older people too.
  heading: { fontFamily: fonts.monoMedium, fontSize: 19, lineHeight: 26, letterSpacing: 0.3 },
  body: { fontFamily: fonts.mono, fontSize: 17, lineHeight: 26, letterSpacing: 0 },
  caption: { fontFamily: fonts.monoMedium, fontSize: 13, lineHeight: 18, letterSpacing: 1.4 },
  // Chair (grandparent) screens: extra large, calm.
  chairHuge: { fontFamily: fonts.monoMedium, fontSize: 64, letterSpacing: 2 },
  chairBody: { fontFamily: fonts.monoMedium, fontSize: 30, letterSpacing: 1.2 },
};

export const shadow = {
  button: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  card: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
};

export const gradientsUi = {
  neutral: ['#FAF5EC', '#F3EADF', '#EFE5DA'] as const,
  danger: ['#C9604B', '#B4432F', '#8E2E1F'] as const,
  gloss: ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)'] as const,
  glossSoft: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] as const,
};

export const colorsUi = {
  depthNeutral: '#E2D5C0',
  dangerDeep: '#8E2E1F',
  highlightEdge: 'rgba(47,33,22,0.18)',
  scrim: 'rgba(47,33,22,0.45)',
  inputBg: 'rgba(47,33,22,0.03)',
  inputBorder: 'rgba(47,33,22,0.18)',
  onAccent: '#FAF5EC', // text on caramel / dark-brown fills
  onAccentLight: '#FFFFFF',
};
