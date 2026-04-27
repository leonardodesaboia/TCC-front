import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { colors } from '@/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  backgroundColor?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = { sm: 36, md: 44, lg: 56, xl: 80 };
const FONT_MAP: Record<AvatarSize, 'labelLg' | 'titleSm' | 'titleLg' | 'displaySm'> = {
  sm: 'labelLg', md: 'titleSm', lg: 'titleLg', xl: 'displaySm',
};

export function Avatar({ uri, name, size = 'md', backgroundColor }: AvatarProps) {
  const dim = SIZE_MAP[size];
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  const bg = backgroundColor ?? colors.primary.default;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: dim, height: dim, borderRadius: dim / 2, backgroundColor: colors.neutral[200] }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View style={{ width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant={FONT_MAP[size]} color="#FFFFFF">{initial}</Text>
    </View>
  );
}
