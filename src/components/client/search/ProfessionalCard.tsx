import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { Avatar, Badge, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface SearchProfessional {
  id: string;
  name: string;
  profession: string;
  specialties: string[];
  rating: string;
  reviewCount: string;
  neighborhood: string;
  availability: string;
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
      <View style={styles.top}>
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
            {professional.profession}
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
      </View>

      <View style={styles.bottom}>
        <View style={styles.metaItem}>
          <MapPin color={colors.neutral[400]} size={14} />
          <Text variant="labelLg" color={colors.neutral[600]}>
            {professional.neighborhood}
          </Text>
        </View>
        <Text variant="labelLg" color={colors.primary.default}>
          {professional.availability}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  pressed: {
    backgroundColor: colors.neutral[100],
  },
  top: {
    flexDirection: 'row',
    gap: spacing[3],
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
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
