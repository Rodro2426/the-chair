import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

// Thin-bold geometric line icons on a 24x24 grid. Round caps, one stroke weight.
type Draw = (c: string, w: number) => ReactNode;

const icons = {
  plus: (c, w) => <Path d="M12 4v16M4 12h16" stroke={c} strokeWidth={w * 1.25} strokeLinecap="round" />,
  close: (c, w) => <Path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth={w} strokeLinecap="round" />,
  back: (c, w) => <Polyline points="15,5 8,12 15,19" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />,
  chevron: (c, w) => <Polyline points="9,5 16,12 9,19" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />,
  check: (c, w) => <Polyline points="5,12.5 10,17.5 19,7" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />,
  sliders: (c, w) => (
    <>
      <Line x1="3" y1="8" x2="21" y2="8" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Line x1="3" y1="16" x2="21" y2="16" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Circle cx="9" cy="8" r="2.6" fill={c} />
      <Circle cx="16" cy="16" r="2.6" fill={c} />
    </>
  ),
  settings: (c, w) => (
    <>
      <Line x1="3" y1="8" x2="21" y2="8" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Line x1="3" y1="16" x2="21" y2="16" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Circle cx="9" cy="8" r="2.6" fill={c} />
      <Circle cx="16" cy="16" r="2.6" fill={c} />
    </>
  ),
  dots: (c) => (
    <>
      <Circle cx="12" cy="5" r="1.7" fill={c} />
      <Circle cx="12" cy="12" r="1.7" fill={c} opacity={0.7} />
      <Circle cx="12" cy="19" r="1.7" fill={c} opacity={0.45} />
    </>
  ),
  mic: (c, w) => (
    <>
      <Rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke={c} strokeWidth={w} />
      <Path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </>
  ),
  photo: (c, w) => (
    <>
      <Rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke={c} strokeWidth={w} />
      <Circle cx="15.5" cy="9.5" r="1.6" fill={c} />
      <Polyline points="3,17 9,11 14,16" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />
    </>
  ),
  gallery: (c, w) => (
    <>
      <Rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke={c} strokeWidth={w} />
      <Circle cx="15.5" cy="9.5" r="1.6" fill={c} />
      <Polyline points="3,17 9,11 14,16" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />
    </>
  ),
  camera: (c, w) => (
    <>
      <Path d="M3 8h4l2-3h6l2 3h4v11H3z" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="3.5" fill="none" stroke={c} strokeWidth={w} />
    </>
  ),
  text: (c, w) => <Path d="M5 6h14M5 11h14M5 16h8" stroke={c} strokeWidth={w} strokeLinecap="round" />,
  chair: (c, w) => (
    <>
      <Path d="M7 3v10h10V3M5 13h14M7 13v8M17 13v8" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  link: (c, w) => (
    <>
      <Path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </>
  ),
  history: (c, w) => (
    <>
      <Circle cx="12" cy="12" r="8.5" fill="none" stroke={c} strokeWidth={w} />
      <Polyline points="12,7 12,12 15.5,14" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  play: (c) => <Path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" fill={c} />,
  pause: (c) => (
    <>
      <Rect x="6.5" y="5" width="4" height="14" rx="1" fill={c} />
      <Rect x="13.5" y="5" width="4" height="14" rx="1" fill={c} />
    </>
  ),
  send: (c, w) => <Path d="M12 20V5M6 11l6-6 6 6" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />,
  trash: (c, w) => <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />,
  edit: (c, w) => <Path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />,
  volume: (c, w) => (
    <>
      <Path d="M4 9.5h4L13 5v14l-5-4.5H4z" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />
      <Path d="M16.5 9a4 4 0 010 6M19 6.5a7.5 7.5 0 010 11" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </>
  ),
  heart: (c, w) => <Path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.4 4.3 4.3 0 0119.5 10C19.5 15.4 12 20 12 20z" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />,
  wave: (c, w) => <Path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" stroke={c} strokeWidth={w} strokeLinecap="round" />,
  signout: (c, w) => <Path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />,
  family: (c, w) => (
    <>
      <Circle cx="8" cy="8" r="3" fill="none" stroke={c} strokeWidth={w} />
      <Circle cx="16.5" cy="9.5" r="2.3" fill="none" stroke={c} strokeWidth={w} />
      <Path d="M3 20a5 5 0 0110 0M13.5 20a3.5 3.5 0 017 0" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </>
  ),
  lock: (c, w) => (
    <>
      <Rect x="5" y="11" width="14" height="9" rx="1.5" fill="none" stroke={c} strokeWidth={w} />
      <Path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke={c} strokeWidth={w} />
    </>
  ),
  replay: (c, w) => (
    <>
      <Path d="M5 12a7 7 0 107-7H8" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Polyline points="10.5,2 7.5,5 10.5,8" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
} satisfies Record<string, Draw>;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 22, color = colors.text, strokeWidth = 2.2, style }: {
  name: IconName; size?: number; color?: string; strokeWidth?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {(icons[name] as Draw)(color, strokeWidth)}
      </Svg>
    </View>
  );
}
