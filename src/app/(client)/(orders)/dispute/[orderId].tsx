import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import { AxiosError } from 'axios';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Badge, Button, Divider, Input, Text } from '@/components/ui';
import { disputesApi } from '@/lib/api/disputes';
import { useDisputeEvidences, useOpenDispute, useOrderDispute } from '@/lib/hooks/useDisputes';
import { useOrder } from '@/lib/hooks/useOrders';
import { formatDateTime, formatDuration, formatMoney } from '@/lib/utils/formatters';
import { toast } from '@/lib/utils/toast';
import { colors, radius, spacing } from '@/theme';
import type { Dispute, DisputeEvidence, DisputeResolution, DisputeStatus } from '@/types/dispute';
import { OrderMode, type OrderDetails } from '@/types/order';

function getDisputeStatusMeta(status: DisputeStatus): { label: string; variant: 'warning' | 'info' | 'success' } {
  switch (status) {
    case 'under_review':
      return {
        label: 'Em análise',
        variant: 'info',
      };
    case 'resolved':
      return {
        label: 'Resolvida',
        variant: 'success',
      };
    case 'open':
    default:
      return {
        label: 'Aberta',
        variant: 'warning',
      };
  }
}

function getResolutionLabel(resolution?: DisputeResolution): string {
  switch (resolution) {
    case 'refund_full':
      return 'Reembolso integral';
    case 'refund_partial':
      return 'Reembolso parcial';
    case 'release_to_pro':
      return 'Liberação para o profissional';
    default:
      return 'Ainda não definida';
  }
}

function getModeLabel(mode?: OrderMode): string {
  switch (mode) {
    case OrderMode.EXPRESS:
      return 'Express';
    case OrderMode.ON_DEMAND:
      return 'Agendado';
    default:
      return 'Pedido';
  }
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text variant="labelLg" color={colors.neutral[500]}>{label}</Text>
      <Text variant="bodySm">{value}</Text>
    </View>
  );
}

function OrderSummaryCard({ order }: { order: OrderDetails }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text variant="titleSm">Pedido vinculado</Text>
        <Badge label={getModeLabel(order.mode)} variant="muted" />
      </View>

      <Text variant="bodySm" color={colors.neutral[600]}>
        {order.serviceName ?? order.description}
      </Text>

      <View style={styles.detailGrid}>
        <DetailItem label="Profissional" value={order.professionalName ?? 'Ainda não definido'} />
        <DetailItem label="Valor total" value={formatMoney(order.totalAmount)} />
        <DetailItem label="Agendamento" value={formatDateTime(order.scheduledAt)} />
        <DetailItem label="Prazo da disputa" value={formatDateTime(order.disputeDeadline)} />
        <DetailItem label="Duração" value={formatDuration(order.estimatedDurationMinutes)} />
      </View>
    </View>
  );
}

function EvidenceCard({ evidence }: { evidence: DisputeEvidence }) {
  const isPhoto = evidence.evidenceType === 'photo';

  return (
    <View style={styles.evidenceCard}>
      <View style={styles.evidenceHeader}>
        <Badge label={isPhoto ? 'Foto' : 'Texto'} variant={isPhoto ? 'info' : 'muted'} />
        <Text variant="labelLg" color={colors.neutral[500]}>
          {formatDateTime(evidence.sentAt)}
        </Text>
      </View>

      {evidence.content ? (
        <Text variant="bodySm" color={colors.neutral[700]}>
          {evidence.content}
        </Text>
      ) : null}

      {evidence.file?.downloadUrl ? (
        <Image source={{ uri: evidence.file.downloadUrl }} style={styles.evidenceImage} resizeMode="cover" />
      ) : null}
    </View>
  );
}

function DisputeOverviewCard({ dispute }: { dispute: Dispute }) {
  const statusMeta = getDisputeStatusMeta(dispute.status);

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View style={styles.heroTextBlock}>
          <Text variant="titleSm">Resumo da disputa</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>{formatDateTime(dispute.openedAt)}</Text>
        </View>
        <Badge label={statusMeta.label} variant={statusMeta.variant} />
      </View>

      <Text variant="bodySm">{dispute.reason}</Text>

      <View style={styles.detailGrid}>
        <DetailItem label="Resolução" value={getResolutionLabel(dispute.resolution)} />
        <DetailItem label="Encerrada em" value={formatDateTime(dispute.resolvedAt)} />
      </View>

      {dispute.adminNotes ? (
        <>
          <Divider />
          <View style={styles.detailItem}>
            <Text variant="labelLg" color={colors.neutral[500]}>Notas administrativas</Text>
            <Text variant="bodySm">{dispute.adminNotes}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

export default function OrderDisputeScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const orderQuery = useOrder(orderId);
  const disputeQuery = useOrderDispute(orderId);
  const [reason, setReason] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const hasNoDispute =
    disputeQuery.isError &&
    disputeQuery.error instanceof AxiosError &&
    disputeQuery.error.response?.status === 404;

  const openDispute = useOpenDispute(orderId);
  const disputeId = disputeQuery.data?.id ?? '';
  const evidencesQuery = useDisputeEvidences(disputeId);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  if (disputeQuery.isLoading) {
    return <LoadingScreen message="Carregando disputa..." />;
  }

  if (disputeQuery.isError && !hasNoDispute) {
    return <ErrorState message="Não foi possível carregar a disputa." onRetry={() => disputeQuery.refetch()} />;
  }

  if (hasNoDispute || !disputeQuery.data) {
    return (
      <Screen edges={['top']}>
        <Header title="Abrir disputa" showBack />

        {orderQuery.data ? <OrderSummaryCard order={orderQuery.data} /> : null}

        <View style={styles.sectionCard}>
          <Text variant="titleSm">Descreva o problema</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>
            Explique o ocorrido e, se possível, anexe uma foto para acelerar a análise.
          </Text>

          <Input
            value={reason}
            onChangeText={setReason}
            placeholder="Explique o que aconteceu..."
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />

          {imageUri ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <Pressable style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                <X color="#FFFFFF" size={14} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.imagePickerBtn} onPress={pickImage}>
              <Camera color={colors.neutral[500]} size={18} />
              <Text variant="labelLg" color={colors.neutral[500]}>Adicionar foto (opcional)</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            onPress={async () => {
              const dispute = await openDispute.mutateAsync(reason.trim());
              if (imageUri) {
                try {
                  await disputesApi.addPhotoEvidence(dispute.id, reason.trim(), imageUri);
                } catch {
                  toast.error('Foto não enviada', 'A disputa foi aberta, mas a foto não pôde ser enviada.');
                }
              }
              router.replace(`/(client)/(orders)/dispute/${orderId}` as never);
            }}
            loading={openDispute.isPending}
            disabled={reason.trim().length === 0}
          >
            Abrir disputa
          </Button>
        </View>
      </Screen>
    );
  }

  const dispute = disputeQuery.data;
  const order = orderQuery.data;
  const evidences = evidencesQuery.data ?? [];

  return (
    <Screen edges={['top']}>
      <Header title="Disputa" showBack />

      <DisputeOverviewCard dispute={dispute} />

      {order ? <OrderSummaryCard order={order} /> : null}

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text variant="titleSm">Evidências</Text>
          <Badge label={`${evidences.length}`} variant="muted" />
        </View>

        {evidencesQuery.isLoading ? (
          <Text variant="bodySm" color={colors.neutral[500]}>Carregando evidências...</Text>
        ) : evidencesQuery.isError ? (
          <Text variant="bodySm" color={colors.error}>Não foi possível carregar as evidências.</Text>
        ) : evidences.length > 0 ? (
          <View style={styles.evidenceList}>
            {evidences.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </View>
        ) : (
          <Text variant="bodySm" color={colors.neutral[500]}>
            Nenhuma evidência adicional foi enviada até agora.
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: spacing[6],
  },
  heroCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary.light,
    backgroundColor: '#FFF9F4',
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  heroTop: {
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextBlock: {
    flex: 1,
    gap: spacing[1],
  },
  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  detailItem: {
    minWidth: '47%',
    flexGrow: 1,
    gap: spacing[1],
  },
  textArea: {
    minHeight: 140,
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
  },
  imagePreviewWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
  },
  removeImageBtn: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceList: {
    gap: spacing[3],
  },
  evidenceCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.background,
    padding: spacing[3],
    gap: spacing[3],
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  evidenceImage: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
  },
});
