import { useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform, TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { FormFieldContext } from '@/components/forms/field-context';

interface InputProps extends TextInputProps {
  error?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ error, leftIcon, rightIcon, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const field = useContext(FormFieldContext);
  const isMultiline = !!props.multiline;

  return (
    <View
      style={[
        styles.container,
        isMultiline && styles.containerMultiline,
        focused && styles.focused,
        error && styles.error,
      ]}
    >
      {leftIcon}
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? field?.label}
        accessibilityHint={[props.accessibilityHint, field?.error].filter(Boolean).join('. ') || undefined}
        aria-invalid={error || !!field?.error || undefined}
        {...(Platform.OS === 'web' && field?.error ? { 'aria-describedby': field.errorId } : {})}
        style={[styles.input, isMultiline && styles.inputMultiline, style]}
        placeholderTextColor={colors.neutral[400]}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
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
    minHeight: 52,
    backgroundColor: colors.neutral[50],
    gap: spacing[3],
  },
  containerMultiline: {
    minHeight: 52,
    height: 'auto',
    alignItems: 'flex-start',
    paddingVertical: spacing[3],
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
    paddingVertical: spacing[3],
  },
  inputMultiline: {
    minHeight: 52,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },
});
