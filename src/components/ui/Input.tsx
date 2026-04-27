import { useState } from 'react';
import type { ReactNode } from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface InputProps extends TextInputProps {
  error?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ error, leftIcon, rightIcon, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused, error && styles.error]}>
      {leftIcon}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.neutral[400]}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    height: 52,
    backgroundColor: colors.neutral[50],
    gap: spacing[3],
  },
  focused: {
    borderColor: colors.primary.default,
    backgroundColor: colors.neutral[50],
  },
  error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.bodySm,
    color: colors.neutral[900],
  },
});
