import type { ReactNode } from 'react';
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle, type PressableProps } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: PressableProps['onPress'];
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary.default;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon}
          <Text variant={size === 'sm' ? 'labelLg' : 'bodySm'} color={textColor} style={styles.label}>
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, gap: spacing[2] },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { fontWeight: '600' },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary.default },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary.default },
  danger: { backgroundColor: colors.error },
  ghost: { backgroundColor: 'transparent' },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 36, paddingHorizontal: spacing[3] },
  md: { height: 48, paddingHorizontal: spacing[4] },
  lg: { height: 56, paddingHorizontal: spacing[6] },
};
