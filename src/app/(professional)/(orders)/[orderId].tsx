import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Clock, MapPin, MessageCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Divider, Input, Text } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { useProfessionalOrder, useRespondToOrder, useRespondOnDemandOrder, useProCompleteOrder, useProCancelOrder } from '@/lib/hooks/useProfessionalArea';
import { formatMoney, formatDateTime, formatDuration } from '@/lib/utils/formatters';
import { colors, radius, spacing } from '@/theme';
import { OrderMode, OrderStatus } from '@/types/order';

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' }> = {
  [OrderStatus.PENDING]: { label: 'Pendente', variant: 'warning' },
  [OrderStatus.ACCEPTED]: { label: 'Aceito', variant: 'info' },
  [OrderStatus.COMPLETED_BY_PRO]: { label: 'Aguardando cliente', variant: 'default' },
  [OrderStatus.COMPLETED]: { label: 'Concluído', variant: 'success' },
  [OrderStatus.CANCELLED]: { label: 'Cancelado', variant: 'muted' },
  [OrderStatus.DISPUTED]: { label: 'Em disputa', variant: 'error' },
};

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
  const respondToOrder = useRespondToOrder(orderId);
  const respondOnDemand = useRespondOnDemandOrder(orderId);
  const completeOrder = useProCompleteOrder(orderId);
  const cancelOrder = useProCancelOrder(orderId);
  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();

  const [proposedAmount, setProposedAmount] = useState('');

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
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE[OrderStatus.PENDING];
  const requestPhoto = order.photos.find((p) => p.type === 'request');
  const completionPhotos = order.photos.filter((p) => p.type === 'completion_proof');
  const isOnDemand = order.mode === OrderMode.ON_DEMAND;
  const hasProfessionalActions =
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.DISPUTED;
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

  function handleAccept() {
    const digits = proposedAmount.replace(/\D/g, '');
    const amount = parseInt(digits || '0', 10) / 100;
    if (!amount || amount <= 0) {
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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (Platform.OS === 'web') {
        window.alert('Permissão necessária. Libere acesso à galeria para enviar a foto.');
      } else {
        Alert.alert('Permissão necessária', 'Libere acesso à galeria para enviar a foto.');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
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

    completeOrder.mutate(formData);
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            <Image source={{ uri: requestPhoto.downloadUrl }} style={styles.requestPhoto} resizeMode="cover" />
          ) : null}
          {isExpressInvitation ? (
            <Text variant="labelLg" color={colors.neutral[600]} style={styles.centered}>
              Este cliente ainda está escolhendo profissionais. Envie sua proposta para participar da seleção.
            </Text>
          ) : null}
          {isAwaitingClientChoice ? (
            <Text variant="labelLg" color={colors.neutral[600]} style={styles.centered}>
              Sua proposta foi enviada. Agora o cliente precisa escolher entre as propostas recebidas.
            </Text>
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
                      <Image source={{ uri: photo.downloadUrl }} style={styles.photoImage} />
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
                O cliente deseja agendar este servico. Aceitar ou recusar?
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
                Informe seu valor para aceitar o pedido:
              </Text>
              <Input
                value={proposedAmount}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '');
                  setProposedAmount(digits ? formatMoney(parseInt(digits, 10) / 100) : '');
                }}
                placeholder="Valor proposto (R$)"
                keyboardType="numeric"
              />
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

          {order.status === OrderStatus.ACCEPTED ? (
            <View style={styles.actionsColumn}>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                leftIcon={<Camera color="#FFFFFF" size={16} />}
                onPress={handleComplete}
                loading={completeOrder.isPending}
              >
                Concluir com foto
              </Button>
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
            </View>
          ) : null}

          {order.status === OrderStatus.COMPLETED_BY_PRO ? (
            <View style={styles.waitingCard}>
              <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                Aguardando confirmacao do cliente...
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
  actionsRow: { flexDirection: 'row', gap: spacing[2] },
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
});
