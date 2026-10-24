import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, Camera, CheckCircle2, Clock, MapPin, MessageCircle } from 'lucide-react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import { pickImage } from '@/lib/utils/image-picker';
import { ExpandableImage } from '@/components/ui/ExpandableImage';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { useProfessionalOrder, useRespondToOrder, useRespondOnDemandOrder, useProCompleteOrder, useProCancelOrder } from '@/lib/hooks/useProfessionalArea';
import { useNow } from '@/lib/hooks/useNow';
import { formatMoney, formatDateTime, formatDuration, formatRemaining } from '@/lib/utils/formatters';
import { parseMoney } from '@/lib/utils/masks';
import { colors, radius, spacing } from '@/theme';
import { OrderMode, OrderStatus } from '@/types/order';
import { PROFESSIONAL_ORDER_STATUS_BADGE } from '@/lib/constants/order-status';

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

export default function ProfessionalOrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderQuery = useProfessionalOrder(orderId);
  const pullToRefresh = usePullToRefresh(orderQuery);
  const respondToOrder = useRespondToOrder(orderId);
  const respondOnDemand = useRespondOnDemandOrder(orderId);
  const completeOrder = useProCompleteOrder(orderId);
  const cancelOrder = useProCancelOrder(orderId);
  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();

  const [proposedAmount, setProposedAmount] = useState('');
  // Foto escolhida para concluir o serviço; só é enviada depois que o profissional confirma.
  const [completionAsset, setCompletionAsset] = useState<ImagePickerAsset | null>(null);
  const now = useNow(1000, orderQuery.data?.status === OrderStatus.PENDING);

  if (orderQuery.isLoading || areasQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando pedido..." />;
  }

  if (orderQuery.isError || areasQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar esse pedido."
        onRetry={() => {
          void orderQuery.refetch();
          void areasQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  const order = orderQuery.data;
  if (!order) return <ErrorState message="Pedido não encontrado." />;

  const areaName = order.areaId
    ? areasQuery.data?.find((a) => a.id === order.areaId)?.name
    : undefined;
  const categoryName = categoriesQuery.data?.find((c) => c.id === order.categoryId)?.name ?? 'Serviço';
  const badge = PROFESSIONAL_ORDER_STATUS_BADGE[order.status] ?? PROFESSIONAL_ORDER_STATUS_BADGE[OrderStatus.PENDING];
  const requestPhoto = order.photos.find((p) => p.type === 'request');
  const completionPhotos = order.photos.filter((p) => p.type === 'completion_proof');
  const isOnDemand = order.mode === OrderMode.ON_DEMAND;
  const hasProfessionalActions =
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.DISPUTED;
  const hasPendingPriceProposal = order.pendingPriceAmount != null;
  const hasPendingServiceChangeProposal = order.pendingServiceId != null;
  const isExpressQueueEntry = order.mode === OrderMode.EXPRESS && !order.professionalId;
  const isExpressInvitation =
    isExpressQueueEntry &&
    order.status === OrderStatus.PENDING &&
    !order.professionalProResponse;
  const isAwaitingClientChoice =
    isExpressQueueEntry &&
    order.status === OrderStatus.PENDING &&
    order.professionalProResponse === 'accepted' &&
    !order.professionalClientResponse;
  const isExpressSelfRejected =
    isExpressQueueEntry && order.professionalProResponse === 'rejected';
  const isExpressTimedOut =
    isExpressQueueEntry && order.professionalProResponse === 'timeout';
  const isExpressClientChoseOther =
    isExpressQueueEntry &&
    order.professionalProResponse === 'accepted' &&
    order.professionalClientResponse === 'rejected';

  const proposalDeadlineMs = order.proposalDeadline ? new Date(order.proposalDeadline).getTime() : null;
  const proposalTimeLeft = proposalDeadlineMs !== null ? proposalDeadlineMs - now : null;
  const isChosenExpress = order.mode === OrderMode.EXPRESS && order.status === OrderStatus.ACCEPTED;

  function handleAccept() {
    const amount = parseMoney(proposedAmount);
    if (!amount) {
      if (Platform.OS === 'web') {
        window.alert('Valor inválido. Informe o valor proposto para o serviço.');
      } else {
        Alert.alert('Valor inválido', 'Informe o valor proposto para o serviço.');
      }
      return;
    }
    respondToOrder.mutate({ response: 'accepted', proposedAmount: amount });
  }

  function handleReject() {
    const confirmReject = () => respondToOrder.mutate({ response: 'rejected' });

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja recusar este pedido?')) {
        confirmReject();
      }
      return;
    }

    Alert.alert(
      'Recusar pedido',
      'Tem certeza que deseja recusar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, recusar', style: 'destructive', onPress: confirmReject },
      ],
    );
  }

  function handleAcceptOnDemand() {
    respondOnDemand.mutate(true);
  }

  function handleRejectOnDemand() {
    const confirmReject = () => respondOnDemand.mutate(false);

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja recusar este pedido?')) {
        confirmReject();
      }
      return;
    }

    Alert.alert(
      'Recusar pedido',
      'Tem certeza que deseja recusar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, recusar', style: 'destructive', onPress: confirmReject },
      ],
    );
  }

  async function handleComplete() {
    const asset = await pickImage();
    if (asset) setCompletionAsset(asset);
  }

  function handleSendCompletion() {
    const asset = completionAsset;
    if (!asset) return;
    const formData = new FormData();
    const webFile = (asset as typeof asset & { file?: File }).file;

    if (Platform.OS === 'web' && webFile instanceof File) {
      formData.append('file', webFile, webFile.name);
    } else {
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'completion.jpg',
      } as any);
    }

    completeOrder.mutate(formData, { onSuccess: () => setCompletionAsset(null) });
  }

  function handleCancel() {
    const confirmCancel = () => cancelOrder.mutate('Cancelado pelo profissional');

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja cancelar este pedido?')) {
        confirmCancel();
      }
      return;
    }

    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: confirmCancel },
      ],
    );
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Detalhes do pedido" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={pullToRefresh.refreshing} onRefresh={pullToRefresh.onRefresh} />}>
        {/* Status */}
        <View style={styles.statusSection}>
          <View style={styles.badgesRow}>
            <Badge label={badge.label} variant={badge.variant} />
            <Badge label={isOnDemand ? 'Sob demanda' : 'Express'} variant={isOnDemand ? 'info' : 'warning'} />
            {isExpressInvitation ? <Badge label="Aguardando proposta" variant="default" /> : null}
            {isAwaitingClientChoice ? <Badge label="Proposta enviada" variant="info" /> : null}
            {isExpressSelfRejected ? <Badge label="Recusado por você" variant="muted" /> : null}
            {isExpressTimedOut ? <Badge label="Prazo expirado" variant="muted" /> : null}
            {isExpressClientChoseOther ? <Badge label="Não selecionado" variant="muted" /> : null}
          </View>
          <Text variant="titleLg">{categoryName}</Text>
          {areaName ? <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text> : null}
          <Text variant="bodySm" color={colors.neutral[500]}>{order.description}</Text>
          {requestPhoto?.downloadUrl ? (
            <ExpandableImage uri={requestPhoto.downloadUrl} style={styles.requestPhoto} containerStyle={styles.requestPhotoWrap} />
          ) : null}
          {isExpressInvitation ? (
            <Text variant="labelLg" color={colors.neutral[600]} style={styles.centered}>
              Este cliente ainda está escolhendo profissionais. Envie sua proposta para participar da seleção.
            </Text>
          ) : null}
          {isAwaitingClientChoice ? (
            <Text variant="labelLg" color={colors.neutral[600]} style={styles.centered}>
              Sua proposta foi enviada. Agora o cliente precisa escolher entre as propostas recebidas.
              Você ainda não foi contratado.
            </Text>
          ) : null}
          {isChosenExpress ? (
            <View style={styles.chosenCard}>
              <CheckCircle2 color={colors.success} size={20} />
              <View style={styles.chosenText}>
                <Text variant="titleSm" color={colors.success}>O cliente escolheu você!</Text>
                <Text variant="labelLg" color={colors.neutral[700]}>
                  Combine o horário pelo chat e, ao terminar, conclua o serviço com uma foto.
                </Text>
              </View>
            </View>
          ) : null}
          {order.scheduledAt ? (
            <Text variant="labelLg" color={colors.neutral[600]}>
              Agendado para: {formatDateTime(order.scheduledAt)}
            </Text>
          ) : null}
        </View>

        <Divider />

        {/* Details */}
        <View style={styles.section}>
          <Text variant="titleSm">Detalhes</Text>
          <InfoRow
            icon={<MapPin color={colors.neutral[400]} size={18} />}
            label="Endereço"
            value={order.addressSnapshot
              ? `${order.addressSnapshot.street}, ${order.addressSnapshot.number}${order.addressSnapshot.complement ? `, ${order.addressSnapshot.complement}` : ''} - ${order.addressSnapshot.district}, ${order.addressSnapshot.city}`
              : 'Endereço indisponível'}
          />
          {order.scheduledAt ? (
            <InfoRow
              icon={<Clock color={colors.neutral[400]} size={18} />}
              label="Horário estimado"
              value={
                order.estimatedDurationMinutes
                  ? `${formatDateTime(order.scheduledAt)} → ${formatDateTime(new Date(new Date(order.scheduledAt).getTime() + order.estimatedDurationMinutes * 60000).toISOString())}`
                  : formatDateTime(order.scheduledAt)
              }
            />
          ) : null}
          {order.estimatedDurationMinutes ? (
            <InfoRow
              icon={<Clock color={colors.neutral[400]} size={18} />}
              label="Duração estimada"
              value={formatDuration(order.estimatedDurationMinutes)}
            />
          ) : null}
        </View>

        {/* Payment info */}
        {(order.totalAmount > 0 || order.baseAmount > 0) ? (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="titleSm">Valores</Text>
              <View style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Valor base</Text>
                  <Text variant="bodySm">{formatMoney(order.baseAmount)}</Text>
                </View>
                {order.urgencyFee > 0 ? (
                  <View style={styles.paymentRow}>
                    <Text variant="bodySm" color={colors.neutral[600]}>Urgência</Text>
                    <Text variant="bodySm">{formatMoney(order.urgencyFee)}</Text>
                  </View>
                ) : null}
                <Divider />
                <View style={styles.paymentRow}>
                  <Text variant="titleSm">Total</Text>
                  <Text variant="titleSm" color={colors.primary.default}>{formatMoney(order.totalAmount)}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {/* Completion photos */}
        {completionPhotos.length > 0 ? (
          <>
            <Divider />
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
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
          </>
        ) : null}

        {hasProfessionalActions ? <Divider /> : null}

        {/* Actions based on status */}
        {hasProfessionalActions ? (
        <View style={styles.section}>
          <Text variant="titleSm">Ações</Text>

          {order.status === OrderStatus.PENDING && isOnDemand ? (
            <View style={styles.actionsColumn}>
              <Text variant="bodySm" color={colors.neutral[500]}>
                O cliente deseja agendar este serviço. Aceitar ou recusar?
              </Text>
              {order.totalAmount > 0 ? (
                <Text variant="titleSm" color={colors.primary.default}>
                  Valor: {formatMoney(order.totalAmount)}
                </Text>
              ) : null}
              <View style={styles.actionsRow}>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  onPress={handleRejectOnDemand}
                  loading={respondOnDemand.isPending}
                >
                  Recusar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                  onPress={handleAcceptOnDemand}
                  loading={respondOnDemand.isPending}
                >
                  Aceitar pedido
                </Button>
              </View>
            </View>
          ) : null}

          {order.status === OrderStatus.PENDING && !isOnDemand && isExpressInvitation ? (
            <View style={styles.actionsColumn}>
              <Text variant="bodySm" color={colors.neutral[500]}>
                Informe seu valor para participar da seleção. O cliente compara as propostas e escolhe uma.
              </Text>
              {proposalTimeLeft !== null ? (
                <Text variant="labelLg" color={proposalTimeLeft > 0 ? colors.warning : colors.error}>
                  {proposalTimeLeft > 0
                    ? `Tempo para enviar a proposta: ${formatRemaining(proposalTimeLeft)}`
                    : 'O prazo para enviar propostas terminou.'}
                </Text>
              ) : null}
              <MoneyInput value={proposedAmount} onChangeText={setProposedAmount} placeholder="Valor proposto, ex: 120" />
              <View style={styles.actionsRow}>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  onPress={handleReject}
                  loading={respondToOrder.isPending}
                >
                  Recusar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                  onPress={handleAccept}
                  loading={respondToOrder.isPending}
                >
                  Enviar proposta
                </Button>
              </View>
            </View>
          ) : null}

          {isAwaitingClientChoice ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                Proposta enviada com sucesso.
              </Text>
              {order.professionalProposedAmount ? (
                <Text variant="titleSm" color={colors.primary.default} style={styles.centered}>
                  Valor proposto: {formatMoney(order.professionalProposedAmount)}
                </Text>
              ) : null}
            </View>
          ) : null}

          {isExpressSelfRejected ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                Você recusou este pedido. Não há mais ações disponíveis.
              </Text>
            </View>
          ) : null}

          {isExpressTimedOut ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                O prazo para responder a este pedido expirou.
              </Text>
            </View>
          ) : null}

          {isExpressClientChoseOther ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                O cliente escolheu outro profissional para este pedido.
              </Text>
            </View>
          ) : null}

          {order.status === OrderStatus.ACCEPTED && hasPendingPriceProposal ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                Proposta de novo preço enviada. Aguardando resposta do cliente antes de poder
                concluir o serviço.
              </Text>
              {order.pendingPriceAmount ? (
                <Text variant="titleSm" color={colors.primary.default} style={styles.centered}>
                  Novo valor proposto: {formatMoney(order.pendingPriceAmount)}
                </Text>
              ) : null}
            </View>
          ) : null}

          {order.status === OrderStatus.ACCEPTED && hasPendingServiceChangeProposal ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                Proposta de troca de serviço enviada. Aguardando resposta do cliente antes de
                poder concluir o serviço.
              </Text>
            </View>
          ) : null}

          {order.status === OrderStatus.ACCEPTED ? (
            <View style={styles.actionsColumn}>
              {!hasPendingPriceProposal && !hasPendingServiceChangeProposal && !completionAsset ? (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                  leftIcon={<Camera color="#FFFFFF" size={16} />}
                  onPress={() => { void handleComplete(); }}
                >
                  Concluir com foto
                </Button>
              ) : null}
              {completionAsset ? (
                <View style={styles.previewCard}>
                  <Text variant="titleSm">Confira a foto antes de concluir</Text>
                  <Image source={{ uri: completionAsset.uri }} style={styles.previewImage} resizeMode="cover" />
                  <Text variant="labelLg" color={colors.neutral[500]}>
                    Ao enviar, o pedido fica aguardando a confirmação do cliente. Essa ação não pode ser desfeita.
                  </Text>
                  <View style={styles.actionsRow}>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      onPress={() => { void handleComplete(); }}
                      disabled={completeOrder.isPending}
                    >
                      Trocar foto
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth={false}
                      onPress={handleSendCompletion}
                      loading={completeOrder.isPending}
                    >
                      Enviar e concluir
                    </Button>
                  </View>
                </View>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                fullWidth={false}
                leftIcon={<MessageCircle color={colors.primary.default} size={16} />}
                onPress={() =>
                  router.push({
                    pathname: '/(professional)/conversations',
                    params: { orderId, from: 'order' },
                  } as any)
                }
              >
                Conversar com cliente
              </Button>
              {!hasPendingPriceProposal && !hasPendingServiceChangeProposal ? (
                isOnDemand ? (
                  <Button
                    variant="dangerOutline"
                    size="sm"
                    leftIcon={<AlertTriangle color={colors.error} size={16} />}
                    onPress={() =>
                      router.push(`/(professional)/(orders)/report-scope-mismatch/${orderId}` as never)
                    }
                  >
                    Escopo divergente
                  </Button>
                ) : (
                  <View style={styles.actionsRow}>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      onPress={() =>
                        router.push(`/(professional)/(orders)/propose-new-price/${orderId}` as never)
                      }
                    >
                      Propor novo preço
                    </Button>
                    <Button
                      variant="dangerOutline"
                      size="sm"
                      fullWidth={false}
                      leftIcon={<AlertTriangle color={colors.error} size={16} />}
                      onPress={() =>
                        router.push(`/(professional)/(orders)/report-scope-mismatch/${orderId}` as never)
                      }
                    >
                      Escopo divergente
                    </Button>
                  </View>
                )
              ) : null}
            </View>
          ) : null}

          {order.status === OrderStatus.COMPLETED_BY_PRO ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                Aguardando confirmação do cliente...
              </Text>
            </View>
          ) : null}

        {order.status === OrderStatus.COMPLETED ? (
          <View style={styles.completedCard}>
            <Text variant="bodySm" color={colors.success}>
                Serviço concluído com sucesso!
            </Text>
          </View>
        ) : null}

        </View>
        ) : null}

        {order.status === OrderStatus.DISPUTED ? (
          <View style={styles.section}>
            <Text variant="titleSm">Disputa</Text>
            <View style={styles.actionsColumn}>
              <Text variant="bodySm" color={colors.neutral[500]}>
                Este pedido está em disputa. Acompanhe o andamento e os anexos visíveis.
              </Text>
              <Button
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => router.push(`/(professional)/(orders)/dispute/${orderId}` as never)}
              >
                Ver disputa
              </Button>
            </View>
          </View>
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

        {order.status === OrderStatus.ACCEPTED ? (
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  centered: { textAlign: 'center' },
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
  requestPhotoWrap: { alignSelf: 'stretch' },
  requestPhoto: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
  },
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
  actionsColumn: { gap: spacing[3] },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chosenCard: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
    width: '100%',
    backgroundColor: colors.successMid,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  chosenText: { flex: 1, gap: spacing[1] },
  previewCard: {
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  previewImage: { width: '100%', height: 200, borderRadius: radius.md },
  waitingCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[6],
  },
  completedCard: {
    backgroundColor: colors.successMid,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  cancelAction: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
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
});
