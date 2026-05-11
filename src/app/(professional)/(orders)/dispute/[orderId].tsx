import { Image, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Badge, Text } from '@/components/ui';
import { useDisputeEvidences, useOrderDispute } from '@/lib/hooks/useDisputes';
import { useProfessionalOrder } from '@/lib/hooks/useProfessionalArea';
import { formatDateTime, formatDuration, formatMoney } from '@/lib/utils/formatters';
import { colors, radius, spacing } from '@/theme';
import type { Dispute, DisputeEvidence, DisputeResolution, DisputeStatus } from '@/types/dispute';
import { OrderMode, type OrderDetails } from '@/types/order';

function getDisputeStatusMeta(status: DisputeStatus): { label: string; variant: 'warning' | 'info' | 'success' } {
  switch (status) {
    case 'under_review':
      return { label: 'Em análise', variant: 'info' };
    case 'resolved':
      return { label: 'Resolvida', variant: 'success' };
    case 'open':
    default:
      return { label: 'Aberta', variant: 'warning' };
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

function DisputeOverviewCard({ dispute }: { dispute: Dispute }) {
  const statusMeta = getDisputeStatusMeta(dispute.status);

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View style={styles.heroTextBlock}>
          <Text variant="titleSm">Resumo da disputa</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>
            O motivo enviado pelo cliente fica restrito ao fluxo administrativo.
          </Text>
        </View>
        <Badge label={statusMeta.label} variant={statusMeta.variant} />
      </View>

      <View style={styles.detailGrid}>
        <DetailItem label="Aberta em" value={formatDateTime(dispute.openedAt)} />
        <DetailItem label="Resolução" value={getResolutionLabel(dispute.resolution)} />
        <DetailItem label="Encerrada em" value={formatDateTime(dispute.resolvedAt)} />
      </View>

      {dispute.adminNotes ? (
        <View style={styles.noteBox}>
          <Text variant="labelLg" color={colors.neutral[500]}>Notas administrativas</Text>
          <Text variant="bodySm">{dispute.adminNotes}</Text>
        </View>
      ) : null}
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

      {evidence.content ? <Text variant="bodySm">{evidence.content}</Text> : null}
      {evidence.file?.downloadUrl ? (
        <Image source={{ uri: evidence.file.downloadUrl }} style={styles.evidenceImage} resizeMode="cover" />
      ) : null}
    </View>
  );
}

export default function ProfessionalDisputeScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderQuery = useProfessionalOrder(orderId);
  const disputeQuery = useOrderDispute(orderId);
  const disputeId = disputeQuery.data?.id ?? '';
  const evidencesQuery = useDisputeEvidences(disputeId);

  if (orderQuery.isLoading || disputeQuery.isLoading) {
    return <LoadingScreen message="Carregando disputa..." />;
  }

  if (orderQuery.isError || disputeQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar essa disputa."
        onRetry={() => {
          void orderQuery.refetch();
          void disputeQuery.refetch();
          if (disputeId) {
            void evidencesQuery.refetch();
          }
        }}
      />
    );
  }

  const order = orderQuery.data;
  const dispute = disputeQuery.data;

  if (!order || !dispute) {
    return <ErrorState message="Disputa não encontrada." />;
  }

  const visibleEvidences = (evidencesQuery.data ?? []).filter((evidence) => evidence.senderId !== order.clientId);

  return (
    <Screen edges={['top']}>
      <Header title="Disputa" showBack />

      <DisputeOverviewCard dispute={dispute} />
      <OrderSummaryCard order={order} />

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text variant="titleSm">Evidências visíveis</Text>
          <Badge label={`${visibleEvidences.length}`} variant="muted" />
        </View>

        {evidencesQuery.isLoading ? (
          <Text variant="bodySm" color={colors.neutral[500]}>Carregando evidências...</Text>
        ) : evidencesQuery.isError ? (
          <Text variant="bodySm" color={colors.error}>Não foi possível carregar as evidências.</Text>
        ) : visibleEvidences.length > 0 ? (
          <View style={styles.evidenceList}>
            {visibleEvidences.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </View>
        ) : (
          <Text variant="bodySm" color={colors.neutral[500]}>
            Nenhuma evidência compartilhável foi exibida para este perfil.
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
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
  noteBox: {
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    padding: spacing[3],
    gap: spacing[1],
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
