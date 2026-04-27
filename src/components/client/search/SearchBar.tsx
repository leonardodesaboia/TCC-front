import type { Dispatch, SetStateAction } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Input } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  onClear: () => void;
}

export function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder="Buscar serviço ou profissional..."
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
      leftIcon={<Search color={colors.neutral[400]} size={20} />}
      rightIcon={
        value ? (
          <Pressable hitSlop={10} onPress={onClear}>
            <X color={colors.neutral[400]} size={18} />
          </Pressable>
        ) : undefined
      }
    />
  );
}
