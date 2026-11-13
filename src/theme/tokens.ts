// The Chair design tokens — graphite, grain, one glossy sphere, mono type.
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
  bg: '#1D1D1D', // graphite
  bgElevated: '#252525',
  card: '#232323',
  cardBorder: 'rgba(255,255,255,0.09)',
  text: '#F2EFEA', // warm off-white
  textMuted: 'rgba(242,239,234,0.72)',
  textFaint: 'rgba(242,239,234,0.46)',
  // Accent: one warm yellow, used sparingly (TODAY underline, progress, HEARD).
  primary: '#FFB52E',
  primaryDeep: '#C98612',
  // Rare celebration pops only.
  secondary: '#2F5BFF', // electric blue
  secondaryDeep: '#1B3BC4',
  tertiary: '#FF6F61', // coral
  tertiaryDeep: '#C9473B',
  danger: '#FF6F61',
  success: '#F2EFEA', // success is white — monochrome first
};

/** Brand-only extras. */
export const brand = {
  black: '#0B0B0B', // wells, day circles, code circles
  well: '#0E0E0E',
  white: '#FFFFFF',
  grey: '#8A8A8A',
  greyDark: '#3A3A3A',
  divider: 'rgba(255,255,255,0.08)',
  grainOpacity: 0.6,
};

export const gradients = {
  // Monochrome sphere-ish faces (kept for legacy accent consumers).
  voice: ['#FFFFFF', '#D9D9D9', '#A9A9A9'] as const,
  photo: ['#FFFFFF', '#D9D9D9', '#A9A9A9'] as const,
  text: ['#FFFFFF', '#D9D9D9', '#A9A9A9'] as const,
  background: ['#1F1F1F', '#1B1B1B'] as const,
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
  neutral: ['#2A2A2A', '#222222', '#1A1A1A'] as const,
  danger: ['#FF8A7E', '#FF6F61', '#C9473B'] as const,
  gloss: ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)'] as const,
  glossSoft: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] as const,
};

export const colorsUi = {
  depthNeutral: '#0B0B0B',
  dangerDeep: '#8E2E25',
  highlightEdge: 'rgba(255,255,255,0.18)',
  scrim: 'rgba(0,0,0,0.66)',
  inputBg: 'rgba(255,255,255,0.03)',
  inputBorder: 'rgba(255,255,255,0.14)',
  onAccent: '#0B0B0B', // text on white / yellow
  onAccentLight: '#FFFFFF',
};
