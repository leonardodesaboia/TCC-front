import { useId, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';
import { FormFieldContext } from './field-context';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  const errorId = `field-error-${useId()}`;
  return (
    <FormFieldContext.Provider value={{ label, error, errorId }}>
      <View style={styles.container}>
        <Text variant="labelLg" color={colors.neutral[700]}>{label}</Text>
        {children}
        {error ? <Text nativeID={errorId} accessibilityRole="alert" accessibilityLiveRegion="polite" variant="labelSm" color={colors.error}>{error}</Text> : null}
      </View>
    </FormFieldContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[1.5] },
});
