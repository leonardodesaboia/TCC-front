import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography, type TextVariant, colors } from '@/theme';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({
  variant = 'bodySm',
  color = colors.neutral[900],
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color }, style]}
      {...props}
    />
  );
}
