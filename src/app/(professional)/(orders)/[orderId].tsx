import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, DollarSign, MapPin, MessageCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { useProfessionalOrder, useRespondToOrder, useRespondOnDemandOrder, useProCompleteOrder, useProCancelOrder } from '@/lib/hooks/useProfessionalArea';
import { colors, radius, spacing } from '@/theme';
import { OrderMode, OrderStatus } from '@/types/order';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Ainda nao definido';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' }> = {
  [OrderStatus.PENDING]: { label: 'Pendente', variant: 'warning' },
  [OrderStatus.ACCEPTED]: { label: 'Aceito', variant: 'info' },
  [OrderStatus.COMPLETED_BY_PRO]: { label: 'Aguardando cliente', variant: 'default' },
  [OrderStatus.COMPLETED]: { label: 'Concluido', variant: 'success' },
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
        message="Nao foi possivel carregar esse pedido."
        onRetry={() => {
          void orderQuery.refetch();
          void areasQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  const order = orderQuery.data;
  if (!order) return <ErrorState message="Pedido nao encontrado." />;

  const areaName = areasQuery.data?.find((a) => a.id === order.areaId)?.name ?? 'Area';
  const categoryName = categoriesQuery.data?.find((c) => c.id === order.categoryId)?.name ?? 'Servico';
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE[OrderStatus.PENDING];
  const completionPhotos = order.photos.filter((p) => p.type === 'completion_proof');
  const isOnDemand = order.mode === OrderMode.ON_DEMAND;

  function handleAccept() {
    const amount = parseFloat(proposedAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      Alert.alert('Valor invalido', 'Informe o valor proposto para o servico.');
      return;
    }
    respondToOrder.mutate({ response: 'accepted', proposedAmount: amount });
  }

  function handleReject() {
    Alert.alert(
      'Recusar pedido',
      'Tem certeza que deseja recusar este pedido?',
      [
        { text: 'Nao', style: 'cancel' },
        { text: 'Sim, recusar', style: 'destructive', onPress: () => respondToOrder.mutate({ response: 'rejected' }) },
      ],
    );
  }

  function handleAcceptOnDemand() {
    respondOnDemand.mutate(true);
  }

  function handleRejectOnDemand() {
    Alert.alert(
      'Recusar pedido',
      'Tem certeza que deseja recusar este pedido?',
      [
        { text: 'Nao', style: 'cancel' },
        { text: 'Sim, recusar', style: 'destructive', onPress: () => respondOnDemand.mutate(false) },
      ],
    );
  }

  async function handleComplete() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'completion.jpg',
    } as any);

    completeOrder.mutate(formData);
  }

  function handleCancel() {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Nao', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: () => cancelOrder.mutate('Cancelado pelo profissional') },
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
          </View>
          <Text variant="titleLg">{categoryName}</Text>
          <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{order.description}</Text>
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
            label="Endereco"
            value={order.addressSnapshot
              ? `${order.addressSnapshot.street}, ${order.addressSnapshot.number}${order.addressSnapshot.complement ? `, ${order.addressSnapshot.complement}` : ''} - ${order.addressSnapshot.district}, ${order.addressSnapshot.city}`
              : 'Endereco indisponivel'}
          />
          <InfoRow
            icon={<DollarSign color={colors.neutral[400]} size={18} />}
            label="Criado em"
            value={formatDateTime(order.createdAt)}
          />
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
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Taxa da plataforma</Text>
                  <Text variant="bodySm">{formatMoney(order.platformFee)}</Text>
                </View>
                {order.urgencyFee > 0 ? (
                  <View style={styles.paymentRow}>
                    <Text variant="bodySm" color={colors.neutral[600]}>Urgencia</Text>
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
                <Text variant="titleSm">Fotos de conclusao</Text>
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

        <Divider />

        {/* Actions based on status */}
        <View style={styles.section}>
          <Text variant="titleSm">Acoes</Text>

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

          {order.status === OrderStatus.PENDING && !isOnDemand ? (
            <View style={styles.actionsColumn}>
              <Text variant="bodySm" color={colors.neutral[500]}>
                Informe seu valor para aceitar o pedido:
              </Text>
              <TextInput
                value={proposedAmount}
                onChangeText={setProposedAmount}
                placeholder="Valor proposto (R$)"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="numeric"
                style={styles.amountInput}
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
                onPress={() => router.push({ pathname: '/(professional)/conversations', params: { orderId } } as any)}
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
                Servico concluido com sucesso!
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      {order.status === OrderStatus.ACCEPTED ? (
        <View style={styles.bottomBar}>
          <Button
            variant="secondary"
            size="lg"
            onPress={handleCancel}
            loading={cancelOrder.isPending}
          >
            Cancelar pedido
          </Button>
        </View>
      ) : null}
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
  amountInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[50],
    color: colors.neutral[900],
    fontSize: 16,
  },
  waitingCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[6],
  },
  completedCard: {
    backgroundColor: '#DCFCE7',
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
