import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputInstance, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { brand, colors, space } from '@/theme/tokens';
import { haptic, Txt } from '@/components/ui';

export interface CodeInputHandle { shake: () => void; clear: () => void; focus: () => void }

/** Six black circles (echoing the day row) driven by one hidden number-pad TextInput. */
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
            <View key={i} style={styles.boxOuter}>
              <View
                style={[
                  styles.box,
                  d && styles.filled,
                  active && styles.active,
                  error && styles.error,
                ]}
              >
                {d ? <Txt variant="number" style={{ fontSize: 24, lineHeight: 30 }}>{d}</Txt> : <View style={styles.dot} />}
              </View>
              <View style={[styles.underline, active && { opacity: 1 }]} />
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
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.sm + 2 },
  boxOuter: { flex: 1, maxWidth: 52, alignItems: 'center' },
  box: {
    width: '100%', aspectRatio: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: brand.black, borderWidth: 1.5, borderColor: 'transparent',
  },
  filled: { borderColor: 'rgba(255,255,255,0.12)' },
  active: { borderColor: 'rgba(255,255,255,0.55)' },
  error: { borderColor: colors.danger },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  underline: { width: 18, height: 2, borderRadius: 1, backgroundColor: colors.primary, marginTop: 8, opacity: 0 },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
