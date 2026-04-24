import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight, MapPin, Star } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, radius, shadows, spacing } from '@/theme';

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
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: professional.accentColor ?? colors.primary.default }]}>
        <Text variant="titleLg" color={colors.neutral[50]}>
          {professional.name.slice(0, 1)}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="titleSm">{professional.name}</Text>
            <Text color={colors.neutral[500]}>{professional.profession}</Text>
          </View>
          {professional.badge ? (
            <View style={styles.badge}>
              <Text variant="labelLg" color={colors.primary.default}>
                {professional.badge}
              </Text>
            </View>
          ) : null}
        </View>

        <Text color={colors.secondary.light}>{professional.specialties.join(' • ')}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Star color={colors.primary.default} fill={colors.primary.default} size={15} />
            <Text variant="labelLg">{professional.rating}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>
              ({professional.reviewCount})
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin color={colors.neutral[500]} size={15} />
            <Text color={colors.neutral[500]} numberOfLines={1}>
              {professional.neighborhood}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="labelLg" color={colors.secondary.default}>
            {professional.availability}
          </Text>
          <View style={styles.link}>
            <Text variant="labelLg" color={colors.primary.default}>
              Ver perfil
            </Text>
            <ArrowRight color={colors.primary.default} size={16} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    borderRadius: radius.xl,
    backgroundColor: '#FFF9F4',
    borderWidth: 1,
    borderColor: '#F6D8BF',
    padding: spacing[4],
    ...shadows.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  headerText: {
    flex: 1,
    gap: spacing[1],
  },
  badge: {
    borderRadius: radius.full,
    backgroundColor: '#FFE5CF',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  metaRow: {
    gap: spacing[2],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
