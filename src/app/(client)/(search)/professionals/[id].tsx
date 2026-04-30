import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, Phone, Star } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Button, Divider, Text } from '@/components/ui';
import { useProfessional } from '@/lib/hooks/useProfessionals';
import { useProfessionalReviews } from '@/lib/hooks/useReviews';
import { useProfessionalServices } from '@/lib/hooks/useServices';
import type { ServiceSummary } from '@/types/service';
import { colors, radius, spacing } from '@/theme';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDuration(minutes?: number) {
  if (!minutes) return 'Sob consulta';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}min` : `${hours}h`;
}

function formatRelativeDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function isCategoryService(service: ServiceSummary, categoryId?: string, categoryName?: string) {
  const normalizedCategoryId = normalize(categoryId);
  const normalizedCategoryName = normalize(categoryName);

  if (normalizedCategoryId && normalize(service.professionId) === normalizedCategoryId) {
    return true;
  }

  if (!normalizedCategoryName) {
    return false;
  }

  return (
    normalize(service.name).includes(normalizedCategoryName) ||
    normalize(service.description).includes(normalizedCategoryName)
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          color={colors.warning}
          fill={i <= Math.round(rating) ? colors.warning : 'transparent'}
          size={14}
        />
      ))}
    </View>
  );
}

export default function ProfessionalProfileScreen() {
  const { id, categoryId, categoryName } = useLocalSearchParams<{
    id: string;
    categoryId?: string;
    categoryName?: string;
  }>();
  const router = useRouter();

  const professionalQuery = useProfessional(id);
  const servicesQuery = useProfessionalServices(id);
  const reviewsQuery = useProfessionalReviews(id);

  if (professionalQuery.isLoading || servicesQuery.isLoading || reviewsQuery.isLoading) {
    return <LoadingScreen message="Carregando profissional..." />;
  }

  if (professionalQuery.isError || servicesQuery.isError || reviewsQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar esse profissional."
        onRetry={() => {
          void professionalQuery.refetch();
          void servicesQuery.refetch();
          void reviewsQuery.refetch();
        }}
      />
    );
  }

  const professional = professionalQuery.data;
  const services = servicesQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const prioritizedServices = [...services].sort((left, right) => {
    const leftMatches = isCategoryService(left, categoryId, categoryName);
    const rightMatches = isCategoryService(right, categoryId, categoryName);
    return Number(rightMatches) - Number(leftMatches);
  });
  const primaryService = prioritizedServices[0];

  if (!professional) {
    return <ErrorState message="Profissional não encontrado." />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Profissional" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Avatar name={professional.name} size="xl" backgroundColor={colors.primary.default} />
          <Text variant="titleLg">{professional.name}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{professional.profession}</Text>
          <View style={styles.ratingRow}>
            <Star color={colors.warning} fill={colors.warning} size={16} />
            <Text variant="titleSm">{professional.rating.toFixed(1)}</Text>
            <Text variant="bodySm" color={colors.neutral[500]}>({professional.reviewCount} avaliações)</Text>
          </View>
          {professional.badgeLabel ? <Badge label={professional.badgeLabel} /> : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text variant="titleLg">{services.length}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>Serviços</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text variant="titleLg">{professional.rating.toFixed(1)}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>Avaliação</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text variant="titleLg">{professional.yearsOfExperience ?? '-'}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>Anos exp.</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin color={colors.neutral[400]} size={16} />
            <Text variant="bodySm" color={colors.neutral[600]}>
              {[professional.neighborhood, professional.city].filter(Boolean).join(', ') || 'Localização não informada'}
            </Text>
          </View>
          {professional.availabilityLabel ? (
            <View style={styles.infoItem}>
              <Clock color={colors.primary.default} size={16} />
              <Text variant="bodySm" color={colors.primary.default}>{professional.availabilityLabel}</Text>
            </View>
          ) : null}
        </View>

        {professional.bio ? (
          <View style={styles.section}>
            <Text variant="titleSm">Sobre</Text>
            <Text variant="bodySm" color={colors.neutral[600]}>{professional.bio}</Text>
          </View>
        ) : null}

        <Divider />

        <View style={styles.section}>
          <Text variant="titleSm">Serviços</Text>
          {prioritizedServices.length > 0 ? (
            <View style={styles.servicesList}>
              {prioritizedServices.map((service) => {
                const selectedCategoryMatch = isCategoryService(service, categoryId, categoryName);

                return (
                  <View key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceTitleRow}>
                        <Text variant="titleSm" style={styles.serviceTitle}>{service.name}</Text>
                        {selectedCategoryMatch ? (
                          <Badge label="Categoria selecionada" variant="info" />
                        ) : null}
                      </View>
                      <Text variant="labelLg" color={colors.neutral[500]}>{service.description}</Text>
                      <View style={styles.serviceMeta}>
                        <Clock color={colors.neutral[400]} size={12} />
                        <Text variant="labelSm" color={colors.neutral[500]}>{formatDuration(service.durationInMinutes)}</Text>
                      </View>
                    </View>
                    <View style={styles.serviceRight}>
                      <Text variant="titleSm" color={colors.primary.default}>{formatMoney(service.effectivePrice)}</Text>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth={false}
                        onPress={() =>
                          router.push({
                            pathname: '/(client)/(search)/services/[id]',
                            params: {
                              id: service.id,
                              professionalId: professional.id,
                              categoryId,
                              categoryName,
                            },
                          })
                        }
                      >
                        Ver detalhes
                      </Button>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon={Clock}
              title="Sem serviços publicados"
              description="Esse profissional ainda não publicou serviços."
            />
          )}
        </View>

        <Divider />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleSm">Avaliações</Text>
          </View>
          {reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Avatar name={review.reviewerId} size="sm" />
                    <View style={styles.reviewInfo}>
                      <Text variant="titleSm">Cliente</Text>
                      <StarRating rating={review.rating} />
                    </View>
                    <Text variant="labelSm" color={colors.neutral[400]}>{formatRelativeDate(review.publishedAt ?? review.submittedAt)}</Text>
                  </View>
                  <Text variant="bodySm" color={colors.neutral[600]}>
                    {review.comment ?? 'Avaliação enviada sem comentário.'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={Star}
              title="Sem avaliações públicas"
              description="As avaliações podem levar um tempo para serem publicadas."
            />
          )}
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.ctaMain}>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Phone color="#FFFFFF" size={20} />}
            onPress={() => {
              if (!primaryService) return;
              router.push({
                pathname: '/(client)/(search)/services/[id]',
                params: {
                  id: primaryService.id,
                  professionalId: professional.id,
                  categoryId,
                  categoryName,
                },
              });
            }}
            disabled={!primaryService}
          >
            Contratar
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  profileHeader: { alignItems: 'center', gap: spacing[2], paddingTop: spacing[2] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingVertical: spacing[4],
  },
  stat: { alignItems: 'center', gap: spacing[1] },
  statDivider: { width: 1, height: 32, backgroundColor: colors.neutral[200] },
  infoRow: { flexDirection: 'row', gap: spacing[4], justifyContent: 'center', flexWrap: 'wrap' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  servicesList: { gap: spacing[2] },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
    gap: spacing[3],
  },
  serviceInfo: { flex: 1, gap: spacing[1] },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  serviceTitle: {
    flex: 1,
  },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: spacing[1] },
  serviceRight: { alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing[2] },
  reviewsList: { gap: spacing[3] },
  reviewCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
    gap: spacing[2],
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  reviewInfo: { flex: 1, gap: 2 },
  starRow: { flexDirection: 'row', gap: 2 },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  ctaMain: { flex: 1 },
});
