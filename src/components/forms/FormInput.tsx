import type { ReactNode } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { TextInputProps } from 'react-native';
import { Input } from '@/components/ui';
import { FormField } from './FormField';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  mask?: (value: string) => string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  leftIcon,
  rightIcon,
  mask,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormField label={label} error={error?.message}>
          <Input
            value={value}
            onChangeText={(text) => onChange(mask ? mask(text) : text)}
            onBlur={onBlur}
            error={!!error}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            {...inputProps}
          />
        </FormField>
      )}
    />
  );
}
