import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '@/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.primary.light, text: colors.primary.dark },
  success: { bg: '#DCFCE7', text: '#16A34A' },
  warning: { bg: '#FEF3C7', text: '#D97706' },
  error: { bg: '#FEE2E2', text: '#DC2626' },
  info: { bg: '#DBEAFE', text: '#2563EB' },
  muted: { bg: colors.neutral[200], text: colors.neutral[600] },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const config = VARIANT_STYLES[variant];
  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text variant="labelSm" color={config.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
});
