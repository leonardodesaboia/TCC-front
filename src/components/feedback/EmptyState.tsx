import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface EmptyStateProps {
  icon: ComponentType<{ color?: string; size?: number }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon color={colors.neutral[400]} size={32} />
      </View>
      <Text variant="titleSm" style={styles.centered}>{title}</Text>
      <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button variant="secondary" size="sm" onPress={onAction} fullWidth={false}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
    marginBottom: spacing[2],
  },
  centered: { textAlign: 'center' },
});
