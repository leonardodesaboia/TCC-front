import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'solid' | 'outline' | 'inverse' | 'outline-light';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'solid', fullWidth = false, disabled = false, loading = false }: ButtonProps) {
  const isDisabled = disabled || loading;
  const containerClassName = [
    'items-center justify-center rounded-2xl px-5 py-4',
    isDisabled ? 'opacity-60' : '',
    fullWidth ? 'w-full' : '',
    variant === 'solid' ? 'bg-primary' : '',
    variant === 'outline' ? 'border border-primary bg-transparent' : '',
    variant === 'inverse' ? 'bg-white' : '',
    variant === 'outline-light' ? 'border border-white bg-transparent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const textClassName = [
    'text-body-lg font-bold',
    variant === 'solid' ? 'text-white' : '',
    variant === 'outline' ? 'text-primary' : '',
    variant === 'inverse' ? 'text-primary-dark' : '',
    variant === 'outline-light' ? 'text-white' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerColor = variant === 'solid' ? '#FFFFFF' : '#D77219';

  return (
    <Pressable className={containerClassName} disabled={isDisabled} onPress={onPress}>
      {loading ? <ActivityIndicator color={spinnerColor} /> : <Text className={textClassName}>{label}</Text>}
    </Pressable>
  );
}
