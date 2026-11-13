// PROVISIONAL design tokens. The BRANDING agent will replace the values (keep the
// key names stable so screens don't break). Direction: high-end, dark, glossy,
// tactile — big bold type, rich warm gradients, chunky pressable 3D buttons.
export const colors = {
  bg: '#0E0B09',
  bgElevated: '#1A1512',
  card: '#221B17',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#FFF6EC',
  textMuted: 'rgba(255,246,236,0.6)',
  textFaint: 'rgba(255,246,236,0.35)',
  primary: '#FF8A3D', // warm amber — voice
  primaryDeep: '#C2491A',
  secondary: '#7C6CFF', // violet — photo of the day
  secondaryDeep: '#4433C9',
  tertiary: '#3DD6A3', // mint — text / linked state
  tertiaryDeep: '#14936B',
  danger: '#FF5470',
  success: '#3DD6A3',
};

export const gradients = {
  voice: ['#FFB067', '#FF7A2F', '#C2491A'] as const,
  photo: ['#A99CFF', '#7C6CFF', '#4433C9'] as const,
  text: ['#7CF0C8', '#3DD6A3', '#14936B'] as const,
  background: ['#1B1410', '#0E0B09'] as const,
};

export const radius = { sm: 12, md: 20, lg: 28, xl: 40, pill: 999 };
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const type = {
  // Font families get swapped by branding (loaded via expo-font in the root layout).
  display: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.4 },
  // Chair (grandparent) screens: extra large for readability.
  chairHuge: { fontSize: 64, fontWeight: '800' as const, letterSpacing: -1.5 },
  chairBody: { fontSize: 32, fontWeight: '700' as const },
};

export const shadow = {
  // Deep, soft "3D object" shadow for chunky buttons/cards.
  button: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  card: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
};

// ---- Added by the family-app agent (UI primitives need these; branding may restyle values) ----
export const gradientsUi = {
  neutral: ['#3A2F28', '#2A221D', '#1C1714'] as const,
  danger: ['#FF8A9C', '#FF5470', '#B8233F'] as const,
  // Top-down gloss overlay used on buttons / cards / badges.
  gloss: ['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.04)'] as const,
  glossSoft: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)'] as const,
};

export const colorsUi = {
  depthNeutral: '#0F0C0A', // the "underside" of neutral 3D buttons
  dangerDeep: '#8E1B31',
  highlightEdge: 'rgba(255,255,255,0.28)', // 1px top inner-highlight edge
  scrim: 'rgba(0,0,0,0.6)',
  inputBg: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.10)',
  onAccent: '#1A0F08', // text drawn on bright accent gradients
  onAccentLight: '#FFFFFF',
};
