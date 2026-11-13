import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, type TextInputInstance, View, type TextInputProps } from 'react-native';
import { colors, colorsUi, radius, space, type as typeScale } from '@/theme/tokens';
import { Txt } from './Txt';

export interface TextFieldProps extends TextInputProps { label?: string; error?: string | null }

/** Big, soft, glowing-on-focus input. */
export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField({ label, error, style, onFocus, onBlur, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.sm }}>
      {label && <Txt variant="caption" tone="muted" upper>{label}</Txt>}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.primary}
        {...rest}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[
          styles.input,
          focused && { borderColor: colors.primary },
          !!error && { borderColor: colors.danger },
          style,
        ]}
      />
      {!!error && <Txt variant="caption" tone="danger">{error}</Txt>}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    ...typeScale.heading,
    color: colors.text,
    backgroundColor: colorsUi.inputBg,
    borderWidth: 1.5,
    borderColor: colorsUi.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
  },
});
