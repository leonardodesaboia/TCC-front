import type { ReactNode } from 'react';
import { Alert, Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Camera, ChevronRight, Clock, MapPin, MessageCircle, Star, Users } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Button, Divider, Text } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { OrderStatusBadge } from '@/components/client/orders/OrderStatusBadge';
import { ExpandableImage } from '@/components/ui/ExpandableImage';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { useCancelOrder, useChooseOrderProposal, useConfirmOrder, useOrder, useOrderProposals, useRespondNewPrice, useRespondServiceChange } from '@/lib/hooks/useOrders';
import { useProfessional } from '@/lib/hooks/useProfessionals';
import { useProfessionalService } from '@/lib/hooks/useServices';
import { useOrderReviews } from '@/lib/hooks/useReviews';
import { useAuth } from '@/providers/AuthProvider';
import { useNow } from '@/lib/hooks/useNow';
import { formatMoney, formatDateTime, formatRemaining, formatReviewCount } from '@/lib/utils/formatters';
import { colors, radius, spacing } from '@/theme';
import { OrderMode, OrderStatus } from '@/types/order';

interface TimelineStep {
  label: string;
  completed: boolean;
  active: boolean;
}

function buildTimeline(status: OrderStatus, mode?: OrderMode): TimelineStep[] {
  const isOnDemand = mode === OrderMode.ON_DEMAND;
  const progressedPastPending = [
    OrderStatus.ACCEPTED,
    OrderStatus.COMPLETED_BY_PRO,
    OrderStatus.COMPLETED,
    OrderStatus.DISPUTED,
  ].includes(status);
  const progressedPastAccepted = [
    OrderStatus.COMPLETED_BY_PRO,
    OrderStatus.COMPLETED,
    OrderStatus.DISPUTED,
  ].includes(status);

  return [
    { label: 'Pedido criado', completed: true, active: false },
    {
      label: isOnDemand ? 'Aguardando profissional' : 'Buscando profissionais',
      completed: progressedPastPending,
      active: status === OrderStatus.PENDING,
    },
    {
      label: isOnDemand ? 'Pedido aceito' : 'Proposta aceita',
      completed: progressedPastPending,
      active: status === OrderStatus.ACCEPTED,
    },
    {
      label: 'Serviço realizado',
      completed: progressedPastAccepted,
      active: status === OrderStatus.COMPLETED_BY_PRO,
    },
    {
      label: 'Serviço confirmado por você',
      completed: status === OrderStatus.COMPLETED,
      active: false,
    },
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

function ProposalCard({ professionalId, proposedAmount, respondedAt, onAccept, isAccepting }: {
  professionalId: string;
  proposedAmount: number;
  respondedAt?: string | null;
  onAccept: () => void;
  isAccepting: boolean;
}) {
  const proQuery = useProfessional(professionalId);
  const pro = proQuery.data;

  return (
    <View style={styles.proposalCard}>
      <View style={styles.proposalTop}>
        <Avatar uri={pro?.avatarUrl} name={pro?.name ?? 'P'} size="md" backgroundColor={colors.primary.default} />
        <View style={styles.proposalInfo}>
          <Text variant="titleSm">{pro?.name ?? 'Carregando...'}</Text>
          {pro ? (
            <View style={styles.proposalRating}>
              <Star color={colors.warning} fill={colors.warning} size={12} />
              <Text variant="labelLg" color={colors.neutral[500]}>
                {pro.reviewCount > 0 ? `${pro.rating.toFixed(1)} (${pro.reviewCount})` : 'Novo, sem avaliações'}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.proposalPrice}>
          <Text variant="titleSm" color={colors.primary.default}>{formatMoney(proposedAmount)}</Text>
          <Text variant="labelSm" color={colors.neutral[400]}>{formatDateTime(respondedAt)}</Text>
        </View>
      </View>
      <Button
        variant="primary"
        size="sm"
        onPress={onAccept}
        loading={isAccepting}
      >
        Aceitar proposta
      </Button>
    </View>
  );
}

function AcceptedProfessionalCard({ professionalId, orderId, professionalName }: { professionalId: string; orderId: string; professionalName?: string }) {
  const router = useRouter();
  const proQuery = useProfessional(professionalId);
  const pro = proQuery.data;
  const displayName = professionalName ?? pro?.name ?? 'Profissional';

  return (
    <View style={styles.section}>
      <Text variant="titleSm">Profissional</Text>
      <Pressable
        style={styles.professionalCard}
        onPress={() => router.push({ pathname: '/(client)/(search)/professionals/[id]', params: { id: professionalId } } as never)}
      >
        <Avatar uri={pro?.avatarUrl} name={displayName} size="lg" backgroundColor={colors.primary.default} />
        <View style={styles.professionalInfo}>
          <Text variant="titleSm">{displayName}</Text>
          {pro ? (
            <>
              <Text variant="bodySm" color={colors.neutral[500]}>{pro.areas.map(a => a.name).join(', ') || pro.profession}</Text>
              <View style={styles.proposalRating}>
                <Star color={colors.warning} fill={colors.warning} size={12} />
                <Text variant="labelLg" color={colors.neutral[500]}>
                  {pro.reviewCount > 0 ? `${pro.rating.toFixed(1)} (${formatReviewCount(pro.reviewCount)})` : 'Novo, sem avaliações'}
                </Text>
              </View>
            </>
          ) : null}
        </View>
        <ChevronRight color={colors.neutral[400]} size={20} />
      </Pressable>
      <View style={styles.professionalActions}>
        <Button
          variant="secondary"
          size="sm"
          fullWidth={false}
          leftIcon={<MessageCircle color={colors.primary.default} size={16} />}
          onPress={() =>
            router.push({
              pathname: '/(client)/conversations',
              params: { orderId, from: 'order' },
            } as never)
          }
        >
          Conversar
        </Button>
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderQuery = useOrder(orderId);
  const pullToRefresh = usePullToRefresh(orderQuery);
  const shouldLoadProposals =
    orderQuery.data !== undefined &&
    orderQuery.data.mode === OrderMode.EXPRESS &&
    orderQuery.data.status === OrderStatus.PENDING;
  const proposalsQuery = useOrderProposals(orderId, shouldLoadProposals);
  const chooseProposal = useChooseOrderProposal(orderId);
  const cancelOrder = useCancelOrder(orderId);
  const confirmOrder = useConfirmOrder(orderId);
  const respondNewPrice = useRespondNewPrice(orderId);
  const respondServiceChange = useRespondServiceChange(orderId);
  const pendingServiceQuery = useProfessionalService(
    orderQuery.data?.professionalId ?? '',
    orderQuery.data?.pendingServiceId ?? '',
  );
  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();
  const reviewsQuery = useOrderReviews(orderId);
  const { user } = useAuth();
  const now = useNow(1000, orderQuery.data?.status === OrderStatus.PENDING);

  if (orderQuery.isLoading) {
    return <LoadingScreen message="Carregando pedido..." />;
  }

  if (orderQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar esse pedido."
        onRetry={() => {
          void orderQuery.refetch();
          if (shouldLoadProposals) {
            void proposalsQuery.refetch();
          }
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

  const categoryName = categoriesQuery.data?.find((category) => category.id === order.categoryId)?.name ?? 'Serviço';
  const areaName = order.areaId
    ? areasQuery.data?.find((area) => area.id === order.areaId)?.name
    : undefined;
  const isOnDemand = order.mode === OrderMode.ON_DEMAND;
  const timeline = buildTimeline(order.status, order.mode);
  const proposals = isOnDemand ? [] : (proposalsQuery.data ?? []);
  // O comentário é opcional: a avaliação do cliente é a que ele mesmo enviou.
  const hasReview = (reviewsQuery.data ?? []).some((review) => review.reviewerId === user?.id);
  const requestPhotos = order.photos.filter((photo) => photo.type === 'request');
  const completionPhotos = order.photos.filter((photo) => photo.type === 'completion_proof');
  const proposalDeadlineMs = order.proposalDeadline ? new Date(order.proposalDeadline).getTime() : null;
  const expiresAtMs = order.expiresAt ? new Date(order.expiresAt).getTime() : null;
  const inProposalPhase = proposalDeadlineMs !== null && now < proposalDeadlineMs;
  const inChoicePhase = !inProposalPhase && expiresAtMs !== null && now < expiresAtMs;
  const notified = order.notifiedProfessionals;

  const hasActions =
    order.status === OrderStatus.COMPLETED_BY_PRO ||
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.DISPUTED ||
    (order.status === OrderStatus.CANCELLED && order.mode === OrderMode.EXPRESS && !!areaName);

  function handleCancel() {
    const confirmCancel = () => cancelOrder.mutate('Cancelado pelo cliente no app');

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja cancelar este pedido? Essa ação não pode ser desfeita.')) {
        confirmCancel();
      }
      return;
    }

    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido? Essa ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: confirmCancel },
      ],
    );
  }

  function handleRejectNewPrice() {
    const confirmReject = () => respondNewPrice.mutate(false);

    if (Platform.OS === 'web') {
      if (window.confirm('Recusar cancela o pedido, sem custo para você. Confirmar?')) {
        confirmReject();
      }
      return;
    }

    Alert.alert(
      'Recusar novo preço',
      'Recusar cancela o pedido, sem custo para você. Confirmar?',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Recusar e cancelar', style: 'destructive', onPress: confirmReject },
      ],
    );
  }

  function handleRejectServiceChange() {
    const confirmReject = () => respondServiceChange.mutate(false);

    if (Platform.OS === 'web') {
      if (window.confirm('Recusar cancela o pedido, sem custo para você. Confirmar?')) {
        confirmReject();
      }
      return;
    }

    Alert.alert(
      'Recusar troca de serviço',
      'Recusar cancela o pedido, sem custo para você. Confirmar?',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Recusar e cancelar', style: 'destructive', onPress: confirmReject },
      ],
    );
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Detalhes do pedido" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={pullToRefresh.refreshing} onRefresh={pullToRefresh.onRefresh} />}>
        <View style={styles.statusSection}>
          <View style={styles.badgesRow}>
            <OrderStatusBadge status={order.status} mode={order.mode} />
            <Badge label={isOnDemand ? 'Sob demanda' : 'Express'} variant={isOnDemand ? 'info' : 'warning'} />
          </View>
          <Text variant="titleLg">{categoryName}</Text>
          {areaName ? <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text> : null}
          {order.professionalName && order.status !== OrderStatus.PENDING ? (
            <Text variant="labelLg" color={colors.neutral[600]}>
              {isOnDemand ? 'Para' : 'Profissional'}: {order.professionalName}
            </Text>
          ) : null}
          {isOnDemand && order.professionalName && order.status === OrderStatus.PENDING ? (
            <Text variant="labelLg" color={colors.neutral[600]}>Para: {order.professionalName}</Text>
          ) : null}
          <Text variant="bodySm" color={colors.neutral[500]}>{order.description}</Text>
          {order.scheduledAt ? (
            <Text variant="labelLg" color={colors.neutral[600]}>
              Agendado para: {formatDateTime(order.scheduledAt)}
            </Text>
          ) : null}
          {order.status === OrderStatus.CANCELLED && order.scopeMismatch ? (
            <View style={styles.scopeMismatchCard}>
              <Text variant="labelLg" color={colors.warning}>Cancelado sem custo — escopo divergente</Text>
              {order.cancelReason ? (
                <Text variant="bodySm" color={colors.neutral[700]} style={styles.centered}>
                  {order.cancelReason}
                </Text>
              ) : null}
            </View>
          ) : order.status === OrderStatus.CANCELLED && order.cancelReason ? (
            <View style={styles.cancelCard}>
              <Text variant="labelLg" color={colors.error}>Motivo do cancelamento</Text>
              <Text variant="bodySm" color={colors.neutral[700]} style={styles.centered}>
                {order.cancelReason}
              </Text>
            </View>
          ) : null}
        </View>

        {requestPhotos.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderStart}>
              <Camera color={colors.neutral[700]} size={18} />
              <Text variant="titleSm">Foto do pedido</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
              {requestPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoThumb}>
                  {photo.downloadUrl ? (
                    <ExpandableImage uri={photo.downloadUrl} style={styles.photoImage} containerStyle={styles.photoImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Camera color={colors.neutral[400]} size={24} />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

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

        {order.status === OrderStatus.PENDING && !isOnDemand ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleSm">Propostas recebidas</Text>
              <Badge label={`${proposals.length}`} variant="default" />
            </View>
            <View style={styles.windowCard}>
              {notified != null ? (
                <View style={styles.windowRow}>
                  <Users color={colors.neutral[500]} size={16} />
                  <Text variant="labelLg" color={colors.neutral[700]}>
                    {notified === 1
                      ? '1 profissional próximo foi avisado.'
                      : `${notified} profissionais próximos foram avisados.`}
                  </Text>
                </View>
              ) : null}
              {inProposalPhase && proposalDeadlineMs !== null ? (
                <View style={styles.windowRow}>
                  <Clock color={colors.warning} size={16} />
                  <Text variant="labelLg" color={colors.neutral[700]}>
                    Recebendo propostas por mais {formatRemaining(proposalDeadlineMs - now)}. Você já pode escolher uma.
                  </Text>
                </View>
              ) : null}
              {inChoicePhase && expiresAtMs !== null ? (
                <View style={styles.windowRow}>
                  <Clock color={colors.error} size={16} />
                  <Text variant="labelLg" color={colors.neutral[700]}>
                    {proposals.length > 0
                      ? `Não chegam mais propostas. Escolha uma em até ${formatRemaining(expiresAtMs - now)}, senão o pedido é cancelado.`
                      : 'O prazo para propostas terminou sem respostas. O pedido será cancelado.'}
                  </Text>
                </View>
              ) : null}
            </View>
            {proposals.length > 0 ? (
              <View style={styles.proposalList}>
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.professionalId}
                    professionalId={proposal.professionalId}
                    proposedAmount={proposal.proposedAmount}
                    respondedAt={proposal.respondedAt}
                    onAccept={() => chooseProposal.mutate(proposal.professionalId)}
                    isAccepting={chooseProposal.isPending}
                  />
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

        {order.status === OrderStatus.PENDING && isOnDemand ? (
          <View style={styles.section}>
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                {order.professionalName
                  ? `Aguardando resposta de ${order.professionalName}...`
                  : 'Aguardando resposta do profissional...'}
              </Text>
            </View>
          </View>
        ) : null}

        {order.professionalId && (isOnDemand || order.status !== OrderStatus.PENDING) ? (
          <>
            <AcceptedProfessionalCard professionalId={order.professionalId} orderId={orderId} professionalName={order.professionalName ?? undefined} />
            <Divider />
          </>
        ) : null}

        {order.status === OrderStatus.ACCEPTED && order.pendingPriceAmount != null ? (
          <>
            <View style={styles.section}>
              <Text variant="titleSm">Novo preço proposto</Text>
              <View style={styles.newPriceCard}>
                <Text variant="bodySm" color={colors.neutral[600]}>
                  O profissional encontrou um escopo diferente do combinado e propôs um novo
                  valor para o serviço:
                </Text>
                {order.pendingPriceReason ? (
                  <Text variant="bodySm" color={colors.neutral[700]}>
                    "{order.pendingPriceReason}"
                  </Text>
                ) : null}
                <Text variant="titleLg" color={colors.primary.default}>
                  {formatMoney(order.pendingPriceAmount)}
                </Text>
                <View style={styles.actionsRow}>
                  <Button
                    variant="dangerOutline"
                    size="sm"
                    fullWidth={false}
                    onPress={handleRejectNewPrice}
                    loading={respondNewPrice.isPending}
                  >
                    Recusar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => respondNewPrice.mutate(true)}
                    loading={respondNewPrice.isPending}
                  >
                    Aceitar novo preço
                  </Button>
                </View>
              </View>
            </View>
            <Divider />
          </>
        ) : null}

        {order.status === OrderStatus.ACCEPTED && order.pendingServiceId != null ? (
          <>
            <View style={styles.section}>
              <Text variant="titleSm">Troca de serviço proposta</Text>
              <View style={styles.newPriceCard}>
                <Text variant="bodySm" color={colors.neutral[600]}>
                  O profissional encontrou um escopo diferente do combinado e propôs trocar
                  para outro serviço:
                </Text>
                {order.pendingServiceReason ? (
                  <Text variant="bodySm" color={colors.neutral[700]}>
                    "{order.pendingServiceReason}"
                  </Text>
                ) : null}
                {pendingServiceQuery.data ? (
                  <>
                    <Text variant="titleSm">{pendingServiceQuery.data.name}</Text>
                    <Text variant="titleLg" color={colors.primary.default}>
                      {formatMoney(pendingServiceQuery.data.effectivePrice)}
                      {pendingServiceQuery.data.pricingType === 'hourly' ? '/h' : ''}
                    </Text>
                  </>
                ) : null}
                <View style={styles.actionsRow}>
                  <Button
                    variant="dangerOutline"
                    size="sm"
                    fullWidth={false}
                    onPress={handleRejectServiceChange}
                    loading={respondServiceChange.isPending}
                  >
                    Recusar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => respondServiceChange.mutate(true)}
                    loading={respondServiceChange.isPending}
                  >
                    Aceitar troca
                  </Button>
                </View>
              </View>
            </View>
            <Divider />
          </>
        ) : null}

        {completionPhotos.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderStart}>
              <Camera color={colors.neutral[700]} size={18} />
              <Text variant="titleSm">Fotos de conclusão</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
              {completionPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoThumb}>
                  {photo.downloadUrl ? (
                    <ExpandableImage uri={photo.downloadUrl} style={styles.photoImage} containerStyle={styles.photoImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Camera color={colors.neutral[400]} size={24} />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
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
            icon={<CalendarDays color={colors.neutral[400]} size={18} />}
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

        {hasActions ? (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="titleSm">Ações</Text>
              <View style={styles.actions}>
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
                      Abrir disputa
                    </Button>
                  </>
                ) : null}
                {order.status === OrderStatus.DISPUTED ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => router.push(`/(client)/(orders)/dispute/${orderId}` as never)}
                  >
                    Ver disputa
                  </Button>
                ) : null}
                {order.status === OrderStatus.COMPLETED ? (
                  <Button
                    variant={hasReview ? 'secondary' : 'primary'}
                    size="sm"
                    fullWidth={false}
                    onPress={() => router.push(`/(client)/(orders)/review/${orderId}` as never)}
                  >
                    {hasReview ? 'Ver avaliação' : 'Avaliar o profissional'}
                  </Button>
                ) : null}
                {order.status === OrderStatus.CANCELLED && order.mode === OrderMode.EXPRESS && areaName ? (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onPress={() =>
                      router.push({
                        pathname: '/(client)/(orders)/express',
                        params: {
                          areaId: order.areaId ?? '',
                          categoryId: order.categoryId,
                          areaName: areaName ?? '',
                          categoryName,
                        },
                      } as never)
                    }
                  >
                    Refazer pedido
                  </Button>
                ) : null}
              </View>
            </View>
          </>
        ) : null}

        {order.status === OrderStatus.PENDING || order.status === OrderStatus.ACCEPTED ? (
          <View style={styles.cancelAction}>
            <Button
              variant="dangerOutline"
              size="md"
              onPress={handleCancel}
              loading={cancelOrder.isPending}
            >
              Cancelar pedido
            </Button>
          </View>
        ) : null}

        <View style={{ height: spacing[4] }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  statusSection: { alignItems: 'center', gap: spacing[2], paddingTop: spacing[2] },
  badgesRow: { flexDirection: 'row', gap: spacing[2] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeaderStart: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  windowCard: {
    gap: spacing[2],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    padding: spacing[3],
  },
  windowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
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
  proposalInfo: { flex: 1, gap: spacing[0.5] },
  proposalRating: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  proposalPrice: { alignItems: 'flex-end', gap: spacing[0.5] },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  professionalInfo: { flex: 1, gap: spacing[1] },
  professionalActions: { flexDirection: 'row', gap: spacing[2] },
  photosScroll: { gap: spacing[2] },
  photoThumb: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  infoText: { flex: 1, gap: spacing[0.5] },
  paymentCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelCard: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing[4],
    gap: spacing[1],
    alignItems: 'center',
  },
  scopeMismatchCard: {
    width: '100%',
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: spacing[4],
    gap: spacing[1],
    alignItems: 'center',
  },
  newPriceCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  actionsRow: { flexDirection: 'row', gap: spacing[2] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  cancelAction: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
