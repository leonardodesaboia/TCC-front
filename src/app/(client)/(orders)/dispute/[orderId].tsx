import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { AxiosError } from 'axios';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Button, Divider, Text } from '@/components/ui';
import { useAddDisputeEvidence, useDisputeEvidences, useOpenDispute, useOrderDispute } from '@/lib/hooks/useDisputes';
import { colors, radius, spacing } from '@/theme';

export default function OrderDisputeScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const disputeQuery = useOrderDispute(orderId);
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');

  const hasNoDispute =
    disputeQuery.isError &&
    disputeQuery.error instanceof AxiosError &&
    disputeQuery.error.response?.status === 404;

  const openDispute = useOpenDispute(orderId);
  const disputeId = disputeQuery.data?.id ?? '';
  const evidencesQuery = useDisputeEvidences(disputeId);
  const addEvidence = useAddDisputeEvidence(disputeId);

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
        <View style={styles.section}>
          <Text variant="titleSm">Motivo</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Explique o problema encontrado..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
        </View>
        <View style={styles.footer}>
          <Button
            onPress={async () => {
              await openDispute.mutateAsync(reason.trim());
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

  return (
    <Screen edges={['top']}>
      <Header title="Disputa" showBack />

      <View style={styles.card}>
        <Text variant="titleSm">Status: {dispute.status}</Text>
        <Text variant="bodySm" color={colors.neutral[600]}>{dispute.reason}</Text>
      </View>

      <Divider />

      {evidencesQuery.isLoading ? (
        <LoadingScreen message="Carregando evidências..." />
      ) : evidencesQuery.isError ? (
        <ErrorState message="Não foi possível carregar evidências." onRetry={() => evidencesQuery.refetch()} />
      ) : (
        <View style={styles.section}>
          <Text variant="titleSm">Evidências</Text>
          {(evidencesQuery.data ?? []).length > 0 ? (
            <View style={styles.evidenceList}>
              {(evidencesQuery.data ?? []).map((item) => (
                <View key={item.id} style={styles.evidenceCard}>
                  <Text variant="bodySm">{item.content ?? `[${item.evidenceType}]`}</Text>
                  <Text variant="labelSm" color={colors.neutral[400]}>{item.sentAt}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="Sem evidências"
              description="Adicione detalhes para apoiar sua disputa."
            />
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text variant="titleSm">Adicionar evidência em texto</Text>
        <TextInput
          value={evidence}
          onChangeText={setEvidence}
          placeholder="Descreva o que aconteceu..."
          placeholderTextColor={colors.neutral[400]}
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />
        <Button
          onPress={() => {
            const trimmed = evidence.trim();
            if (!trimmed) return;
            addEvidence.mutate(trimmed);
            setEvidence('');
          }}
          loading={addEvidence.isPending}
          disabled={evidence.trim().length === 0}
        >
          Enviar evidência
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  footer: { paddingTop: spacing[6] },
  textArea: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    minHeight: 140,
    padding: spacing[4],
    color: colors.neutral[900],
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    gap: spacing[2],
  },
  evidenceList: { gap: spacing[2] },
  evidenceCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[3],
    gap: spacing[1],
  },
});
