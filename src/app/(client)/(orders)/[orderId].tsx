import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DollarSign, MapPin } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { OrderStatusBadge } from '@/components/client/orders/OrderStatusBadge';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { useOrderDispute } from '@/lib/hooks/useDisputes';
import { useCancelOrder, useChooseOrderProposal, useConfirmOrder, useOrder, useOrderProposals } from '@/lib/hooks/useOrders';
import { useOrderReviews } from '@/lib/hooks/useReviews';
import { colors, radius, spacing } from '@/theme';
import { OrderStatus } from '@/types/order';

interface TimelineStep {
  label: string;
  completed: boolean;
  active: boolean;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Ainda não definido';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function buildTimeline(status: OrderStatus): TimelineStep[] {
  return [
    { label: 'Pedido criado', completed: true, active: false },
    { label: 'Buscando profissionais', completed: status !== OrderStatus.PENDING, active: status === OrderStatus.PENDING },
    { label: 'Proposta aceita', completed: status !== OrderStatus.PENDING, active: status === OrderStatus.ACCEPTED },
    { label: 'Serviço realizado', completed: status === OrderStatus.COMPLETED_BY_PRO || status === OrderStatus.COMPLETED, active: status === OrderStatus.COMPLETED_BY_PRO },
    { label: 'Confirmado pelo cliente', completed: status === OrderStatus.COMPLETED, active: status === OrderStatus.DISPUTED },
  ];
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <View style={styles.infoText}>
        <Text variant="labelLg" color={colors.neutral[500]}>{label}</Text>
        <Text variant="bodySm">{value}</Text>
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderQuery = useOrder(orderId);
  const proposalsQuery = useOrderProposals(orderId);
  const chooseProposal = useChooseOrderProposal(orderId);
  const cancelOrder = useCancelOrder(orderId);
  const confirmOrder = useConfirmOrder(orderId);
  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();
  const reviewsQuery = useOrderReviews(orderId);
  const disputeQuery = useOrderDispute(orderId);

  if (orderQuery.isLoading || areasQuery.isLoading || categoriesQuery.isLoading || reviewsQuery.isLoading) {
    return <LoadingScreen message="Carregando pedido..." />;
  }

  if (orderQuery.isError || areasQuery.isError || categoriesQuery.isError || reviewsQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar esse pedido."
        onRetry={() => {
          void orderQuery.refetch();
          void proposalsQuery.refetch();
          void areasQuery.refetch();
          void categoriesQuery.refetch();
          void reviewsQuery.refetch();
        }}
      />
    );
  }

  const order = orderQuery.data;
  if (!order) {
    return <ErrorState message="Pedido não encontrado." />;
  }

  const areaName = areasQuery.data?.find((area) => area.id === order.areaId)?.name ?? 'Área';
  const categoryName = categoriesQuery.data?.find((category) => category.id === order.categoryId)?.name ?? 'Serviço';
  const timeline = buildTimeline(order.status);
  const proposals = proposalsQuery.data ?? [];
  const hasReview = (reviewsQuery.data ?? []).some((review) => !!review.comment);
  const hasDispute = !!disputeQuery.data;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Detalhes do pedido" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <OrderStatusBadge status={order.status} />
          <Text variant="titleLg">{categoryName}</Text>
          <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{order.description}</Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSm">Acompanhamento</Text>
          <View style={styles.timeline}>
            {timeline.map((step, index) => (
              <View key={step.label} style={styles.timelineStep}>
                <View style={styles.timelineDotCol}>
                  <View style={[
                    styles.timelineDot,
                    step.completed && styles.timelineDotCompleted,
                    step.active && styles.timelineDotActive,
                  ]} />
                  {index < timeline.length - 1 ? (
                    <View style={[styles.timelineLine, step.completed && styles.timelineLineCompleted]} />
                  ) : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    variant={step.active ? 'titleSm' : 'bodySm'}
                    color={step.completed || step.active ? colors.neutral[900] : colors.neutral[400]}
                  >
                    {step.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {order.status === OrderStatus.PENDING ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleSm">Propostas recebidas</Text>
              <Badge label={`${proposals.length}`} variant="default" />
            </View>
            {proposals.length > 0 ? (
              <View style={styles.proposalList}>
                {proposals.map((proposal) => (
                  <View key={proposal.professionalId} style={styles.proposalCard}>
                    <View style={styles.proposalTop}>
                      <View style={styles.proposalInfo}>
                        <Text variant="titleSm">Profissional {proposal.queuePosition ?? ''}</Text>
                        <Text variant="labelLg" color={colors.neutral[500]}>
                          ID: {proposal.professionalId}
                        </Text>
                      </View>
                      <View style={styles.proposalPrice}>
                        <Text variant="titleSm" color={colors.primary.default}>{formatMoney(proposal.proposedAmount)}</Text>
                        <Text variant="labelSm" color={colors.neutral[400]}>{formatDateTime(proposal.respondedAt)}</Text>
                      </View>
                    </View>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => chooseProposal.mutate(proposal.professionalId)}
                      loading={chooseProposal.isPending}
                    >
                      Aceitar proposta
                    </Button>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.waitingCard}>
                <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                  Aguardando propostas de profissionais próximos...
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleSm">Detalhes</Text>
          <InfoRow
            icon={<MapPin color={colors.neutral[400]} size={18} />}
            label="Endereço"
            value={order.addressSnapshot
              ? `${order.addressSnapshot.street}, ${order.addressSnapshot.number}${order.addressSnapshot.complement ? `, ${order.addressSnapshot.complement}` : ''} - ${order.addressSnapshot.district}, ${order.addressSnapshot.city} - ${order.addressSnapshot.state}`
              : 'Endereço indisponível'}
          />
          <InfoRow
            icon={<DollarSign color={colors.neutral[400]} size={18} />}
            label="Criado em"
            value={formatDateTime(order.createdAt)}
          />
        </View>

        {(order.totalAmount > 0 || order.platformFee > 0 || order.baseAmount > 0) ? (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="titleSm">Pagamento</Text>
              <View style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Valor base</Text>
                  <Text variant="bodySm">{formatMoney(order.baseAmount)}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Taxa da plataforma</Text>
                  <Text variant="bodySm">{formatMoney(order.platformFee)}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Urgência</Text>
                  <Text variant="bodySm">{formatMoney(order.urgencyFee)}</Text>
                </View>
                <Divider />
                <View style={styles.paymentRow}>
                  <Text variant="titleSm">Total</Text>
                  <Text variant="titleSm" color={colors.primary.default}>{formatMoney(order.totalAmount)}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        <Divider />

        <View style={styles.section}>
          <Text variant="titleSm">Ações</Text>
          <View style={styles.actions}>
            {order.status === OrderStatus.ACCEPTED ? (
              <Button
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => router.push({ pathname: '/(client)/conversations', params: { orderId } } as never)}
              >
                Abrir conversa
              </Button>
            ) : null}
            {order.status === OrderStatus.COMPLETED_BY_PRO ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                  onPress={() => confirmOrder.mutate()}
                  loading={confirmOrder.isPending}
                >
                  Confirmar serviço
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  onPress={() => router.push(`/(client)/(orders)/dispute/${orderId}` as never)}
                >
                  {hasDispute ? 'Ver disputa' : 'Abrir disputa'}
                </Button>
              </>
            ) : null}
            {order.status === OrderStatus.COMPLETED ? (
              <Button
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => router.push(`/(client)/(orders)/review/${orderId}` as never)}
              >
                {hasReview ? 'Ver avaliação' : 'Avaliar pedido'}
              </Button>
            ) : null}
          </View>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="secondary"
          size="lg"
          onPress={() => cancelOrder.mutate('Cancelado pelo cliente no app')}
          loading={cancelOrder.isPending}
          disabled={order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED}
        >
          Cancelar pedido
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  statusSection: { alignItems: 'center', gap: spacing[2], paddingTop: spacing[2] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  centered: { textAlign: 'center' },
  timeline: { gap: 0 },
  timelineStep: { flexDirection: 'row', minHeight: 44 },
  timelineDotCol: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  timelineDotCompleted: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  timelineDotActive: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.light,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.neutral[200],
    marginVertical: 2,
  },
  timelineLineCompleted: { backgroundColor: colors.primary.default },
  timelineContent: { flex: 1, paddingLeft: spacing[2], paddingBottom: spacing[3] },
  waitingCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[6],
  },
  proposalList: { gap: spacing[3] },
  proposalCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  proposalTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  proposalInfo: { flex: 1, gap: 2 },
  proposalPrice: { alignItems: 'flex-end', gap: 2 },
  infoRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  infoText: { flex: 1, gap: 2 },
  paymentCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
