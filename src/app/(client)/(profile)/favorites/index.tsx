import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Text } from '@/components/ui';
import { useFavoriteProfessionals } from '@/lib/hooks/useFavorites';
import { colors, radius, spacing } from '@/theme';
import type { ProfessionalSummary } from '@/types/professional';

function FavoriteProfessionalCard({
  professional,
  onPress,
}: {
  professional: ProfessionalSummary;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Avatar
        name={professional.name}
        size="lg"
        backgroundColor={colors.primary.default}
      />
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text variant="titleSm" style={styles.cardName}>{professional.name}</Text>
          {professional.badgeLabel ? <Badge label={professional.badgeLabel} /> : null}
        </View>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {professional.areas[0]?.name ?? professional.profession}
        </Text>
        <Text variant="labelSm" color={colors.neutral[500]}>
          ★ {professional.rating.toFixed(1)} ({professional.reviewCount} avaliações)
        </Text>
      </View>
    </Pressable>
  );
}

export default function FavoriteProfessionalsScreen() {
  const router = useRouter();
  const { data: professionals, isLoading, isError, refetch } = useFavoriteProfessionals();

  if (isLoading) {
    return <LoadingScreen message="Carregando favoritos..." />;
  }

  if (isError) {
    return <ErrorState message="Não foi possível carregar os favoritos." onRetry={() => void refetch()} />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Profissionais salvos" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {professionals && professionals.length > 0 ? (
          professionals.map((professional) => (
            <FavoriteProfessionalCard
              key={professional.id}
              professional={professional}
              onPress={() =>
                router.push({
                  pathname: '/(client)/(search)/professionals/[id]',
                  params: { id: professional.id },
                })
              }
            />
          ))
        ) : (
          <EmptyState
            icon={Heart}
            title="Nenhum favorito ainda"
            description="Toque no coração no perfil de um profissional para salvá-lo aqui."
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  list: { gap: spacing[2], padding: spacing[4] },
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
  cardPressed: { backgroundColor: colors.neutral[100] },
  cardInfo: { flex: 1, gap: spacing[1] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  cardName: { flexShrink: 1 },
});
