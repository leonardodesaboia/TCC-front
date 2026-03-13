import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import type { CardTone, IconName } from '../../constants/home';

type FeatureCardProps = {
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
        icon: 'bg-gray-1',
        iconColor: '#FFFFFF',
      };
  }
}

export function FeatureCard({ title, description, icon, tone }: FeatureCardProps) {
  const toneClasses = getToneClasses(tone);

  return (
    <View className={`rounded-card border p-4 ${toneClasses.card}`}>
      <View className={`mb-4 h-12 w-12 items-center justify-center rounded-2xl ${toneClasses.icon}`}>
        <Ionicons color={toneClasses.iconColor} name={icon} size={22} />
      </View>
      <Text className="mb-2 text-body-lg font-bold text-brown">{title}</Text>
      <Text className="text-body-sm text-brown-light">{description}</Text>
    </View>
  );
}
