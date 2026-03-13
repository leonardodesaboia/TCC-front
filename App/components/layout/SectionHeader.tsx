import { Text, View } from 'react-native';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <View className="gap-2">
      {eyebrow ? <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">{eyebrow}</Text> : null}
      <Text className="text-title-lg font-extrabold text-brown">{title}</Text>
      {description ? <Text className="text-body-lg text-brown-light">{description}</Text> : null}
    </View>
  );
}
