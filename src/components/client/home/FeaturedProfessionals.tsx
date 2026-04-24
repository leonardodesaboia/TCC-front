import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowRight, Star } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, radius, shadows, spacing } from '@/theme';

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

export function FeaturedProfessionals({
  professionals,
  onPressProfessional,
}: FeaturedProfessionalsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {professionals.map((professional) => (
        <Pressable
          key={professional.id}
          onPress={() => onPressProfessional?.(professional.id)}
          style={styles.card}
        >
          <View style={[styles.hero, { backgroundColor: professional.accentColor ?? '#F6D8BF' }]}>
            <View style={styles.badge}>
              <Text variant="labelLg" color={colors.secondary.default}>
                {professional.badge}
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text variant="titleLg" color={colors.neutral[50]}>
                {professional.name.slice(0, 1)}
              </Text>
            </View>
          </View>

          <View style={styles.info}>
            <View style={styles.texts}>
              <Text variant="titleSm">{professional.name}</Text>
              <Text color={colors.neutral[500]}>{professional.profession}</Text>
            </View>

            <Text color={colors.secondary.light}>{professional.highlight}</Text>

            <View style={styles.footer}>
              <View style={styles.rating}>
                <Star color={colors.primary.default} fill={colors.primary.default} size={16} />
                <Text variant="labelLg" color={colors.secondary.default}>
                  {professional.rating}
                </Text>
              </View>

              <View style={styles.link}>
                <Text variant="labelLg" color={colors.primary.default}>
                  Conhecer
                </Text>
                <ArrowRight color={colors.primary.default} size={16} />
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
    paddingRight: spacing[4],
  },
  card: {
    width: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
    ...shadows.sm,
  },
  hero: {
    minHeight: 112,
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.default,
  },
  info: {
    gap: spacing[3],
    padding: spacing[4],
  },
  texts: {
    gap: spacing[1],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
