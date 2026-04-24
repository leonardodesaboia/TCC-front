import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text variant="labelLg" color={colors.secondary.default}>{label}</Text>
      {children}
      {error && <Text variant="labelLg" color={colors.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[1] },
});
