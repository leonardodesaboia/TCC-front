import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Star } from 'lucide-react-native';
import { Avatar, Badge, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface SearchProfessional {
  id: string;
  name: string;
  area: string;
  specialties: string[];
  rating: string;
  reviewCount: string;
  badge?: string;
  accentColor?: string;
}

interface ProfessionalCardProps {
  professional: SearchProfessional;
  onPress?: () => void;
}

export function ProfessionalCard({ professional, onPress }: ProfessionalCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar
        name={professional.name}
        size="lg"
        backgroundColor={professional.accentColor ?? colors.primary.default}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text variant="titleSm" style={styles.name}>{professional.name}</Text>
          {professional.badge ? <Badge label={professional.badge} /> : null}
        </View>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {professional.area}
        </Text>
        <View style={styles.ratingRow}>
          <Star color={colors.warning} fill={colors.warning} size={14} />
          <Text variant="labelLg" color={colors.neutral[800]}>
            {professional.rating}
          </Text>
          <Text variant="labelSm" color={colors.neutral[500]}>
            ({professional.reviewCount})
          </Text>
        </View>
      </View>
      <ChevronRight color={colors.neutral[300]} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  pressed: {
    backgroundColor: colors.neutral[100],
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    flexShrink: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
});
