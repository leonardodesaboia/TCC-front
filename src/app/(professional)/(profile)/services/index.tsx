import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pencil, Plus, Wrench } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Text } from '@/components/ui';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useProfessionalOfferings } from '@/lib/hooks/useProfessionalManagement';
import { colors, radius, spacing } from '@/theme';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function ProfessionalServicesScreen() {
  const router = useRouter();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const offeringsQuery = useProfessionalOfferings(profile?.id ?? '');

  if (profileQuery.isLoading || offeringsQuery.isLoading) {
    return <LoadingScreen message="Carregando servicos..." />;
  }

  if (profileQuery.isError || offeringsQuery.isError) {
    return (
      <ErrorState
        message="Erro ao carregar servicos."
        onRetry={() => {
          void profileQuery.refetch();
          void offeringsQuery.refetch();
        }}
      />
    );
  }

  const offerings = offeringsQuery.data ?? [];
  const isRefreshing = offeringsQuery.isFetching && !offeringsQuery.isLoading;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Meus servicos" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => offeringsQuery.refetch()} />
        }
      >
        {offerings.length > 0 ? (
          <View style={styles.list}>
            {offerings.map((offering) => (
              <Pressable
                key={offering.id}
                onPress={() => router.push(`/(professional)/(profile)/services/${offering.id}` as any)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.cardHeader}>
                  <Text variant="titleSm" style={styles.cardTitle}>{offering.title}</Text>
                  <Pencil size={18} color={colors.primary.default} />
                </View>
                {offering.description ? (
                  <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={2}>
                    {offering.description}
                  </Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <Text variant="titleSm" color={colors.primary.default}>
                    {formatMoney(offering.effectivePrice)}
                    {offering.pricingType === 'hourly' ? '/h' : ''}
                  </Text>
                  <Badge
                    label={offering.active ? 'Ativo' : 'Inativo'}
                    variant={offering.active ? 'success' : 'muted'}
                  />
                </View>
                {offering.estimatedDurationMinutes > 0 ? (
                  <Text variant="labelLg" color={colors.neutral[400]}>
                    Duracao estimada: {offering.estimatedDurationMinutes} min
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={Wrench}
            title="Nenhum servico cadastrado"
            description="Cadastre seus servicos para receber pedidos de clientes."
          />
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Plus color="#FFFFFF" size={18} />}
          onPress={() => router.push('/(professional)/(profile)/services/new' as any)}
        >
          Novo servico
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[4] },
  list: { gap: spacing[3] },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[2],
  },
  pressed: { opacity: 0.7 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
