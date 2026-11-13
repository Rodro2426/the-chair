import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colorsUi, gradientsUi, radius, shadow, space } from '@/theme/tokens';
import { haptic } from './haptics';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';
import { accentPalette, type Accent } from './palette';

export interface GlossyButtonProps {
  title: string;
  onPress?: () => void;
  accent?: Accent;
  size?: 'md' | 'lg';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DEPTH = { md: 5, lg: 7 };
const HEIGHT = { md: 54, lg: 66 };
const spring = { damping: 14, stiffness: 380, mass: 0.5 };

/**
 * Chunky 3D button: a dark "underside" slab, a gradient face that physically
 * presses down onto it, a glossy top highlight and a deep drop shadow.
 */
export function GlossyButton({
  title, onPress, accent = 'voice', size = 'lg', icon, loading, disabled, style, testID,
}: GlossyButtonProps) {
  const p = accentPalette[accent];
  const depth = DEPTH[size];
  const height = HEIGHT[size];
  const pressed = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * (depth - 1) }, { scale: 1 - pressed.value * 0.01 }],
  }));
  const inactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => { pressed.value = withSpring(1, spring); haptic.press(); }}
      onPressOut={() => { pressed.value = withSpring(0, spring); }}
      style={[{ height: height + depth, opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View style={[styles.base, { top: depth, height, backgroundColor: p.depth, borderRadius: radius.md }, shadow.button]} />
      <Animated.View style={[{ height, borderRadius: radius.md, overflow: 'hidden' }, faceStyle]}>
        <LinearGradient colors={p.face} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
        <View style={[styles.edge, { borderRadius: radius.md }]} />
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={p.label} />
          ) : (
            <>
              {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} color={p.label} />}
              <Txt variant="heading" color={p.label} style={size === 'md' && { fontSize: 17 }}>{title}</Txt>
            </>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { position: 'absolute', left: 0, right: 0 },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '55%' },
  edge: { ...StyleSheet.absoluteFill, borderTopWidth: 1.5, borderColor: colorsUi.highlightEdge },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.lg },
});
