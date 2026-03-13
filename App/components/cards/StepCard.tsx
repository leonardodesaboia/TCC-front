import { Text, View } from 'react-native';

type StepCardProps = {
  step: string;
  title: string;
  description: string;
};

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <View className="rounded-card border border-gray-2 bg-white p-4">
      <View className="mb-4 h-11 w-11 items-center justify-center rounded-full bg-primary">
        <Text className="text-body-lg font-extrabold text-white">{step}</Text>
      </View>
      <Text className="mb-2 text-body-lg font-bold text-brown">{title}</Text>
      <Text className="text-body-sm text-brown-light">{description}</Text>
    </View>
  );
}
