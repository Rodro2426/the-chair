import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from './haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale when pressed (default 0.96). */
  pressedScale?: number;
  /** Haptic on press-in. */
  hapticStyle?: 'tap' | 'press' | 'heavy' | 'select' | 'none';
  /** Fade to 50% when disabled (default true). */
  dimWhenDisabled?: boolean;
}

const spring = { damping: 15, stiffness: 320, mass: 0.6 };

/** Base tactile press: springy scale-down + haptic. Used by every touchable in the app. */
export function PressableScale({
  style, pressedScale = 0.96, hapticStyle = 'tap', dimWhenDisabled = true, onPressIn, onPressOut, disabled, children, ...rest
}: PressableScaleProps) {
  const s = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        s.value = withSpring(pressedScale, spring);
        if (hapticStyle !== 'none') haptic[hapticStyle]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, spring);
        onPressOut?.(e);
      }}
      style={[style, aStyle, disabled && dimWhenDisabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  );
}
