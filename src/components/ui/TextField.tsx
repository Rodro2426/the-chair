import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, type TextInputInstance, View, type TextInputProps } from 'react-native';
import { colors, fonts, space } from '@/theme/tokens';
import { Txt } from './Txt';

export interface TextFieldProps extends TextInputProps { label?: string; error?: string | null }

/** Underline input: mono label above, large mono text, a hairline that turns white on focus. */
export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField({ label, error, style, onFocus, onBlur, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.xs }}>
      {label && <Txt variant="caption" tone="faint" upper>{label}</Txt>}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.primary}
        {...rest}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[
          styles.input,
          focused && { borderColor: colors.text },
          !!error && { borderColor: colors.danger },
          style,
        ]}
      />
      {!!error && <Txt variant="caption" tone="danger" style={{ letterSpacing: 0.4 }}>{error}</Txt>}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    fontFamily: fonts.mono,
    fontSize: 19,
    color: colors.text,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: space.sm + 4,
    paddingHorizontal: 0,
    outlineStyle: 'none',
  } as object,
});
