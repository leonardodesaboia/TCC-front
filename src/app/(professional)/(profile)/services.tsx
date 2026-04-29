import { Pressable, StyleSheet, View } from 'react-native';
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

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Header title="Meus servicos" showBack />

      {offerings.length > 0 ? (
        <View style={styles.list}>
          {offerings.map((offering) => (
            <View key={offering.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text variant="titleSm" style={styles.cardTitle}>{offering.title}</Text>
                <Pressable hitSlop={8}>
                  <Pencil size={18} color={colors.primary.default} />
                </Pressable>
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
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={Wrench}
          title="Nenhum servico cadastrado"
          description="Cadastre seus servicos para receber pedidos de clientes."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing[4] },
  list: { gap: spacing[3] },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[2],
  },
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
});
