import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Avatar, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface FeaturedProfessional {
  id: string;
  name: string;
  profession: string;
  highlight: string;
  rating: string;
  badge: string;
  accentColor?: string;
}

interface FeaturedProfessionalsProps {
  professionals: FeaturedProfessional[];
  onPressProfessional?: (professionalId: string) => void;
}

export function FeaturedProfessionals({ professionals, onPressProfessional }: FeaturedProfessionalsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {professionals.map((p) => (
        <Pressable key={p.id} onPress={() => onPressProfessional?.(p.id)} style={styles.card}>
          <Avatar name={p.name} size="lg" backgroundColor={p.accentColor} />
          <Text variant="titleSm">{p.name}</Text>
          <Text variant="labelLg" color={colors.neutral[500]}>{p.profession}</Text>
          <View style={styles.ratingRow}>
            <Star color={colors.warning} fill={colors.warning} size={14} />
            <Text variant="labelLg">{p.rating}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing[3] },
  card: {
    width: 140,
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[3],
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
});
