import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputInstance, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, colorsUi, radius, shadow, space } from '@/theme/tokens';
import { haptic, Txt } from '@/components/ui';

export interface CodeInputHandle { shake: () => void; clear: () => void; focus: () => void }

/** Six chunky digit boxes driven by one hidden number-pad TextInput. */
export const CodeInput = forwardRef<CodeInputHandle, {
  value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; length?: number; error?: boolean; disabled?: boolean;
}>(function CodeInput({ value, onChange, onComplete, length = 6, error, disabled }, ref) {
  const input = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(true);
  const x = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  useImperativeHandle(ref, () => ({
    shake: () => {
      haptic.error();
      x.value = withSequence(
        withTiming(-14, { duration: 50 }), withTiming(14, { duration: 50 }),
        withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }),
        withSpring(0, { damping: 8, stiffness: 400 }),
      );
    },
    clear: () => onChange(''),
    focus: () => input.current?.focus(),
  }), [onChange, x]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => input.current?.focus()} accessibilityLabel="Pairing code">
      <Animated.View style={[styles.row, shakeStyle]}>
        {digits.map((d, i) => {
          const active = focused && !disabled && i === activeIndex && value.length < length + 1;
          return (
            <View key={i} style={[styles.boxOuter, shadow.card]}>
              <View
                style={[
                  styles.box,
                  d && styles.filled,
                  active && styles.active,
                  error && styles.error,
                ]}
              >
                <Txt variant="display" style={{ fontSize: 34 }} tone={d ? 'default' : 'faint'}>{d || '•'}</Txt>
              </View>
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={input}
        value={value}
        editable={!disabled}
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={(t) => {
          const clean = t.replace(/\D/g, '').slice(0, length);
          if (clean !== value) haptic.select();
          onChange(clean);
          if (clean.length === length) onComplete?.(clean);
        }}
        style={styles.hidden}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  boxOuter: { flex: 1, maxWidth: 58, borderRadius: radius.md },
  box: {
    aspectRatio: 0.8, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.card, borderWidth: 2, borderColor: colorsUi.inputBorder,
  },
  filled: { backgroundColor: colors.bgElevated, borderColor: colorsUi.highlightEdge },
  active: { borderColor: colors.primary },
  error: { borderColor: colors.danger },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
