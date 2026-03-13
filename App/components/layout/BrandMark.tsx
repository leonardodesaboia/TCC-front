import { Text, View } from 'react-native';

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View className="flex-row items-end gap-1">
      <View className={`items-center justify-center rounded-2xl bg-primary px-3 py-2 ${compact ? 'h-11 w-11' : 'h-14 w-14'}`}>
        <Text className={`font-extrabold text-white ${compact ? 'text-base' : 'text-lg'}`}>AS</Text>
      </View>
      <Text className={`font-extrabold tracking-tight text-black-1 ${compact ? 'text-2xl' : 'text-3xl'}`}>
        <Text className="text-black-1">All</Text>
        <Text className="text-primary">Set</Text>
      </Text>
    </View>
  );
}
