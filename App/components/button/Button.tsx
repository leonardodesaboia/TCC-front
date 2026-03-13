import { Pressable, Text } from 'react-native';

type ButtonVariant = 'solid' | 'outline' | 'inverse' | 'outline-light';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function Button({ label, onPress, variant = 'solid', fullWidth = false }: ButtonProps) {
  const containerClassName = [
    'items-center justify-center rounded-2xl px-5 py-4',
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

  return (
    <Pressable className={containerClassName} onPress={onPress}>
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
}
