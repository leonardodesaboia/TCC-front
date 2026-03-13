import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import type { CardTone, IconName } from '../../constants/home';

type ServiceCategoryCardProps = {
  title: string;
  description: string;
  icon: IconName;
  tone: CardTone;
};

function getToneClasses(tone: CardTone) {
  switch (tone) {
    case 'primary':
      return {
        card: 'bg-primary/10 border-primary/20',
        icon: 'bg-primary',
        iconColor: '#FFFFFF',
      };
    case 'warm':
      return {
        card: 'bg-surface-alt border-brown-light/15',
        icon: 'bg-brown-light',
        iconColor: '#FFFFFF',
      };
    default:
      return {
        card: 'bg-white border-gray-2',
        icon: 'bg-gray-4',
        iconColor: '#5C2F12',
      };
  }
}

export function ServiceCategoryCard({ title, description, icon, tone }: ServiceCategoryCardProps) {
  const toneClasses = getToneClasses(tone);

  return (
    <View className={`rounded-card border p-4 ${toneClasses.card}`}>
      <View className="flex-row items-start gap-4">
        <View className={`h-14 w-14 items-center justify-center rounded-2xl ${toneClasses.icon}`}>
          <Ionicons color={toneClasses.iconColor} name={icon} size={24} />
        </View>
        <View className="flex-1 gap-2">
          <Text className="text-body-lg font-bold text-brown">{title}</Text>
          <Text className="text-body-sm text-brown-light">{description}</Text>
        </View>
      </View>
    </View>
  );
}
