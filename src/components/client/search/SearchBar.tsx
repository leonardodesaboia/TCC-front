import type { Dispatch, SetStateAction } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Input, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  onClear: () => void;
}

export function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por serviço ou profissional"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon={<Search color={colors.neutral[500]} size={18} />}
        rightIcon={
          value ? (
            <Pressable hitSlop={10} onPress={onClear}>
              <X color={colors.neutral[500]} size={18} />
            </Pressable>
          ) : undefined
        }
      />
      <Pressable style={styles.filterButton}>
        <SlidersHorizontal color={colors.primary.default} size={18} />
        <Text variant="labelLg" color={colors.primary.default}>
          Filtros
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[3],
  },
  filterButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.full,
    backgroundColor: '#FFF1E5',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
});
