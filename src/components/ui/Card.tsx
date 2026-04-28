import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { shadows } from '@/theme/shadows';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined';
}

export function Card({ children, onPress, style, variant = 'outlined' }: CardProps) {
  const cardStyle = variant === 'elevated' ? styles.elevated : styles.outlined;

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.base, cardStyle, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    padding: spacing[4],
    gap: spacing[3],
  },
  outlined: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  elevated: {
    backgroundColor: colors.neutral[50],
    ...shadows.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
