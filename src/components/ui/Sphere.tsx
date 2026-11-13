import { useId, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Polyline, RadialGradient, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { brand, colors } from '@/theme/tokens';

const cleanId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '');

export interface SphereProps {
  /** Sphere diameter (the well adds `ring` on each side). */
  size: number;
  /** Thickness of the black well around the sphere. Default size * 0.07. */
  ring?: number;
  /** Hollow / dim look (no chair, loading). */
  dim?: boolean;
  /** 0..1 progress arc drawn inside the well. */
  progress?: number;
  progressColor?: string;
  /** Drawn on top of the sphere face, centered (e.g. the extruded check). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The hero object: a glossy white/grey sphere sitting in a thick black well.
 * Pure visuals — wrap it in your own gesture/animation container.
 */
export function Sphere({ size, ring = Math.round(size * 0.07), dim, progress = 0, progressColor = colors.primary, children, style }: SphereProps) {
  const id = cleanId(useId());
  const outer = size + ring * 2;
  const c = outer / 2;
  const r = size / 2;
  const arcR = r + ring / 2;
  const arcW = Math.max(3, ring * 0.42);
  const circ = 2 * Math.PI * arcR;
  const p = Math.min(1, Math.max(0, progress));

  return (
    <View style={[{ width: outer, height: outer }, style]} pointerEvents="none">
      <Svg width={outer} height={outer} viewBox={`0 0 ${outer} ${outer}`}>
        <Defs>
          {/* Body: mid-grey core that brightens toward the rim. */}
          <RadialGradient id={`body${id}`} cx="44%" cy="56%" r="58%" fx="40%" fy="60%">
            <Stop offset="0" stopColor="#A2A2A2" />
            <Stop offset="0.5" stopColor="#B6B6B6" />
            <Stop offset="0.82" stopColor="#DADADA" />
            <Stop offset="1" stopColor="#F2F2F2" />
          </RadialGradient>
          {/* Key light from the top-right. */}
          <RadialGradient id={`key${id}`} cx="80%" cy="28%" r="52%" fx="86%" fy="22%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.75" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
          {/* Soft occlusion low-left so it reads as a ball, not a disc. */}
          <RadialGradient id={`occ${id}`} cx="30%" cy="78%" r="50%">
            <Stop offset="0" stopColor="#6E6E6E" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#6E6E6E" stopOpacity="0" />
          </RadialGradient>
          {/* Well: almost black, a whisper of lift on the lower-right lip. */}
          <SvgLinearGradient id={`well${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#070707" />
            <Stop offset="0.7" stopColor={brand.well} />
            <Stop offset="1" stopColor="#1A1A1A" />
          </SvgLinearGradient>
        </Defs>

        <Circle cx={c} cy={c} r={c} fill={`url(#well${id})`} />

        {p > 0 && (
          <G transform={`rotate(-90 ${c} ${c})`}>
            <Circle
              cx={c} cy={c} r={arcR} fill="none" stroke={progressColor} strokeWidth={arcW}
              strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - p)} strokeLinecap="round"
            />
          </G>
        )}

        {dim ? (
          <>
            <Circle cx={c} cy={c} r={r} fill={`url(#body${id})`} opacity={0.1} />
            <Circle cx={c} cy={c} r={r - 0.75} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
          </>
        ) : (
          <>
            {/* Contact shadow of the ball inside the well. */}
            <Circle cx={c - r * 0.02} cy={c + r * 0.03} r={r + 1} fill="#000" opacity={0.6} />
            <Circle cx={c} cy={c} r={r} fill={`url(#body${id})`} />
            <Circle cx={c} cy={c} r={r} fill={`url(#occ${id})`} />
            <Circle cx={c} cy={c} r={r} fill={`url(#key${id})`} />
          </>
        )}
      </Svg>
      {children ? (
        <View style={{ position: 'absolute', left: ring, top: ring, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Bold, extruded checkmark (dark top face with a stacked shadow body) — the
 * "completed" mark that lands on the sphere.
 */
export function ExtrudedCheck({ size, depth = Math.round(size * 0.09) }: { size: number; depth?: number }) {
  const id = cleanId(useId());
  const w = size * 0.2; // arm thickness
  const pts = `${size * 0.2},${size * 0.52} ${size * 0.42},${size * 0.72} ${size * 0.82},${size * 0.26}`;
  const layers = Array.from({ length: depth }, (_, i) => depth - i);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <SvgLinearGradient id={`face${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4A4A4A" />
          <Stop offset="0.55" stopColor="#2E2E2E" />
          <Stop offset="1" stopColor="#1E1E1E" />
        </SvgLinearGradient>
      </Defs>
      {/* Soft cast shadow on the sphere. */}
      <Polyline points={pts} fill="none" stroke="#000" strokeOpacity={0.1} strokeWidth={w * 1.1}
        strokeLinejoin="miter" strokeLinecap="butt" transform={`translate(${-depth * 1.1}, ${depth * 1.5})`} />
      {layers.map((i) => (
        <Polyline key={i} points={pts} fill="none" stroke={i === depth ? '#050505' : '#0E0E0E'} strokeWidth={w}
          strokeLinejoin="miter" strokeLinecap="butt" transform={`translate(${-i * 0.7}, ${i})`} />
      ))}
      <Polyline points={pts} fill="none" stroke={`url(#face${id})`} strokeWidth={w} strokeLinejoin="miter" strokeLinecap="butt" />
    </Svg>
  );
}
