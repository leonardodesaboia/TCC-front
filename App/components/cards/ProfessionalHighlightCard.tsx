import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

type ProfessionalHighlightCardProps = {
  name: string;
  role: string;
  rating: string;
  price: string;
  availability: string;
  tags: string[];
};

export function ProfessionalHighlightCard({
  name,
  role,
  rating,
  price,
  availability,
  tags,
}: ProfessionalHighlightCardProps) {
  return (
    <View className="rounded-card border border-gray-2 bg-white p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
          <Ionicons color="#D77219" name="person-outline" size={28} />
        </View>
        <View className="flex-row items-center gap-2 rounded-full bg-surface-alt px-3 py-2">
          <Ionicons color="#D77219" name="star" size={16} />
          <Text className="text-body-sm font-bold text-brown">{rating}</Text>
        </View>
      </View>

      <Text className="text-body-lg font-bold text-brown">{name}</Text>
      <Text className="mt-1 text-body-sm text-brown-light">{role}</Text>

      <View className="mt-4 gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons color="#AF5D1F" name="cash-outline" size={16} />
          <Text className="text-body-sm text-brown">{price}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons color="#AF5D1F" name="time-outline" size={16} />
          <Text className="text-body-sm text-brown">{availability}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {tags.map((tag) => (
          <View className="rounded-full bg-primary/10 px-3 py-2" key={tag}>
            <Text className="text-xs font-bold text-primary-dark">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
