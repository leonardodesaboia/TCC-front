import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Shield } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Button, Divider, Text } from '@/components/ui';
import { useProfessional } from '@/lib/hooks/useProfessionals';
import { useProfessionalService, useService } from '@/lib/hooks/useServices';
import { colors, radius, spacing } from '@/theme';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDuration(minutes?: number) {
  if (!minutes) return 'Duração sob consulta';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}min` : `${hours}h`;
}

export default function ServiceDetailScreen() {
  const { id, professionalId } = useLocalSearchParams<{ id: string; professionalId?: string }>();
  const router = useRouter();

  const professionalQuery = useProfessional(professionalId ?? '');
  const professionalServiceQuery = useProfessionalService(professionalId ?? '', id);
  const fallbackServiceQuery = useService(id);

  const useProfessionalScopedService = !!professionalId;
  const serviceQuery = useProfessionalScopedService ? professionalServiceQuery : fallbackServiceQuery;

  if (serviceQuery.isLoading || (professionalId && professionalQuery.isLoading)) {
    return <LoadingScreen message="Carregando detalhes do serviço..." />;
  }

  if (serviceQuery.isError || (professionalId && professionalQuery.isError)) {
    return (
      <ErrorState
        message="Não foi possível carregar esse serviço."
        onRetry={() => {
          void serviceQuery.refetch();
          if (professionalId) void professionalQuery.refetch();
        }}
      />
    );
  }

  const service = serviceQuery.data;
  const professional = professionalId ? professionalQuery.data : null;

  if (!service) {
    return <ErrorState message="Serviço não encontrado." />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Detalhes do serviço" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          {professional?.areas[0]?.name ? <Badge label={professional.areas[0].name} /> : null}
          <Text variant="displaySm">{service.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock color={colors.neutral[400]} size={16} />
              <Text variant="bodySm" color={colors.neutral[500]}>{formatDuration(service.durationInMinutes)}</Text>
            </View>
          </View>
          <Text variant="displayMd" color={colors.primary.default}>{formatMoney(service.effectivePrice)}</Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text variant="titleSm">Descrição</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>{service.description}</Text>
        </View>

        {service.includedItems?.length ? (
          <View style={styles.section}>
            <Text variant="titleSm">O que inclui</Text>
            {service.includedItems.map((item) => (
              <View key={item} style={styles.listItem}>
                <View style={styles.bulletGreen} />
                <Text variant="bodySm" color={colors.neutral[700]}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {service.requirements?.length ? (
          <View style={styles.section}>
            <Text variant="titleSm">Requisitos</Text>
            {service.requirements.map((item) => (
              <View key={item} style={styles.listItem}>
                <View style={styles.bulletGray} />
                <Text variant="bodySm" color={colors.neutral[500]}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {professional ? (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="titleSm">Profissional</Text>
              <View style={styles.professionalCard}>
                <Avatar name={professional.name} size="lg" backgroundColor={colors.primary.default} />
                <View style={styles.professionalInfo}>
                  <View style={styles.professionalNameRow}>
                    <Text variant="titleSm">{professional.name}</Text>
                    {professional.badgeLabel ? <Badge label={professional.badgeLabel} /> : null}
                  </View>
                  <Text variant="bodySm" color={colors.neutral[500]}>{professional.profession}</Text>
                  <Text variant="labelLg" color={colors.neutral[500]}>
                    {professional.rating.toFixed(1)} ({professional.reviewCount} avaliações)
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={24} />
          <View style={styles.guaranteeText}>
            <Text variant="titleSm">Pagamento seguro</Text>
            <Text variant="labelLg" color={colors.neutral[500]}>
              Seu pagamento fica retido até a conclusão do serviço. Se houver qualquer problema, você pode abrir uma disputa.
            </Text>
          </View>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text variant="labelLg" color={colors.neutral[500]}>A partir de</Text>
          <Text variant="titleLg" color={colors.primary.default}>{formatMoney(service.effectivePrice)}</Text>
        </View>
        <View style={styles.ctaBtn}>
          {professionalId ? (
            <Button
              variant="primary"
              size="lg"
              onPress={() =>
                router.push({
                  pathname: '/(client)/(orders)/checkout/[serviceId]',
                  params: { serviceId: id, professionalId },
                })
              }
            >
              Agendar serviço
            </Button>
          ) : (
            <EmptyState
              icon={Clock}
              title="Origem do serviço ausente"
              description="Abra este serviço pela tela do profissional para continuar."
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  titleSection: { gap: spacing[2], paddingTop: spacing[2] },
  metaRow: { flexDirection: 'row', gap: spacing[4] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  section: { gap: spacing[3] },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  bulletGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  bulletGray: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neutral[300] },
  professionalCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
  },
  professionalInfo: { flex: 1, gap: spacing[1] },
  professionalNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  guaranteeCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  guaranteeText: { flex: 1, gap: spacing[1] },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  bottomPrice: { gap: 2 },
  ctaBtn: { flex: 1 },
});
