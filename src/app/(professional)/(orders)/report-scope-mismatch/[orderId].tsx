import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Badge, Button, Input, Text } from '@/components/ui';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import {
  useMyProfessionalProfile,
  useProfessionalOrder,
  useProposeServiceChange,
  useReportScopeMismatch,
} from '@/lib/hooks/useProfessionalArea';
import { useProfessionalOfferings } from '@/lib/hooks/useProfessionalManagement';
import { formatMoney } from '@/lib/utils/formatters';
import { colors, radius, spacing } from '@/theme';
import { OrderMode } from '@/types/order';

const MAX_LENGTH = 500;

type Action = 'cancel' | 'change-service';

export default function ReportScopeMismatchScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderQuery = useProfessionalOrder(orderId);
  const profileQuery = useMyProfessionalProfile();
  const isOnDemand = orderQuery.data?.mode === OrderMode.ON_DEMAND;
  const offeringsQuery = useProfessionalOfferings(isOnDemand ? profileQuery.data?.id ?? '' : '');

  const reportScopeMismatch = useReportScopeMismatch(orderId);
  const proposeServiceChange = useProposeServiceChange(orderId);

  const [action, setAction] = useState<Action>('cancel');
  const [reason, setReason] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [durationText, setDurationText] = useState('');

  if (orderQuery.isLoading || (isOnDemand && (profileQuery.isLoading || offeringsQuery.isLoading))) {
    return <LoadingScreen message="Carregando pedido..." />;
  }

  if (orderQuery.isError || (isOnDemand && (profileQuery.isError || offeringsQuery.isError))) {
    return (
      <ErrorState
        message="Não foi possível carregar esse pedido."
        onRetry={() => {
          void orderQuery.refetch();
          void profileQuery.refetch();
          void offeringsQuery.refetch();
        }}
      />
    );
  }

  const currentServiceId = orderQuery.data?.serviceId;
  const availableOfferings = (offeringsQuery.data ?? []).filter(
    (offering) => offering.active && offering.id !== currentServiceId,
  );
  const selectedOffering = availableOfferings.find((o) => o.id === selectedServiceId);
  const needsDuration = selectedOffering?.pricingType === 'hourly' && !selectedOffering.estimatedDurationMinutes;
  const durationMinutes = parseInt(durationText.replace(/\D/g, '') || '0', 10);

  const canSubmitCancel = reason.trim().length > 0;
  const canSubmitServiceChange =
    !!selectedServiceId &&
    reason.trim().length > 0 &&
    (!needsDuration || (durationMinutes > 0 && durationMinutes % 30 === 0));

  function handleSubmitCancel() {
    const trimmed = reason.trim();
    if (!trimmed) return;

    const confirmMessage =
      'Isso cancela o pedido agora, sem custo para você nem para o cliente, e não pode ser desfeito. Confirmar?';
    const doSubmit = () => reportScopeMismatch.mutate(trimmed);

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) doSubmit();
      return;
    }

    Alert.alert(
      'Cancelar pedido sem custo',
      confirmMessage,
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: doSubmit },
      ],
    );
  }

  function handleSubmitServiceChange() {
    if (!canSubmitServiceChange || !selectedServiceId) return;
    proposeServiceChange.mutate({
      newServiceId: selectedServiceId,
      reason: reason.trim(),
      estimatedDurationMinutes: needsDuration ? durationMinutes : undefined,
    });
  }

  return (
    <Screen edges={['top']} scroll={false}>
      <Header title="Escopo divergente" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionCard}>
          <Text variant="titleSm">O que você encontrou é diferente do pedido?</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>
            {isOnDemand
              ? 'Você pode cancelar o pedido sem custo, ou, se tiver outro serviço seu que corresponda ao que encontrou, propor a troca em vez de cancelar direto.'
              : 'Descreva a divergência encontrada no local. O pedido será cancelado imediatamente, sem custo para nenhuma das partes, e o cliente verá essa descrição.'}
          </Text>
        </View>

        {isOnDemand ? (
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setAction('cancel')}
              style={[styles.toggleButton, action === 'cancel' && styles.toggleButtonActive]}
            >
              <Text
                variant="labelLg"
                color={action === 'cancel' ? colors.primary.default : colors.neutral[500]}
              >
                Cancelar pedido
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAction('change-service')}
              style={[styles.toggleButton, action === 'change-service' && styles.toggleButtonActive]}
            >
              <Text
                variant="labelLg"
                color={action === 'change-service' ? colors.primary.default : colors.neutral[500]}
              >
                Propor troca de serviço
              </Text>
            </Pressable>
          </View>
        ) : null}

        {action === 'change-service' && isOnDemand ? (
          <>
            <View style={styles.section}>
              <Text variant="titleSm">Escolha o novo serviço</Text>
              {availableOfferings.length > 0 ? (
                <View style={styles.list}>
                  {availableOfferings.map((offering) => {
                    const selected = offering.id === selectedServiceId;
                    return (
                      <Pressable
                        key={offering.id}
                        onPress={() => setSelectedServiceId(offering.id)}
                        style={({ pressed }) => [
                          styles.card,
                          selected && styles.cardSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text variant="titleSm" style={styles.cardTitle}>{offering.title}</Text>
                        <View style={styles.cardFooter}>
                          <Text variant="bodySm" color={colors.primary.default}>
                            {formatMoney(offering.effectivePrice)}
                            {offering.pricingType === 'hourly' ? '/h' : ''}
                          </Text>
                          {selected ? <Badge label="Selecionado" variant="info" /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <EmptyState
                  icon={Plus}
                  title="Nenhum outro serviço disponível"
                  description="Cadastre o serviço correto no seu catálogo e volte aqui para propor a troca."
                />
              )}
              <Button
                variant="secondary"
                size="sm"
                fullWidth={false}
                leftIcon={<Plus color={colors.primary.default} size={16} />}
                onPress={() => router.push('/(professional)/(profile)/services/new' as any)}
              >
                Cadastrar novo serviço
              </Button>
            </View>

            {needsDuration ? (
              <View style={styles.section}>
                <Text variant="titleSm">Duração estimada</Text>
                <Text variant="bodySm" color={colors.neutral[600]}>
                  Esse serviço é cobrado por hora e não tem uma duração padrão — informe quanto
                  tempo o serviço deve levar (múltiplo de 30 minutos).
                </Text>
                <Input
                  value={durationText}
                  onChangeText={(text) => setDurationText(text.replace(/\D/g, ''))}
                  placeholder="Duração em minutos (ex: 90)"
                  keyboardType="numeric"
                />
              </View>
            ) : null}
          </>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleSm">
            {action === 'change-service' ? 'Motivo da troca' : 'Descreva a divergência'}
          </Text>
          <Input
            value={reason}
            onChangeText={(text) => setReason(text.slice(0, MAX_LENGTH))}
            placeholder={
              action === 'change-service'
                ? 'Explique por que o escopo corresponde a esse outro serviço...'
                : 'Ex: o cliente descreveu troca de tomada, mas o problema é no disjuntor...'
            }
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
          <Text variant="labelSm" color={colors.neutral[400]} style={styles.counter}>
            {reason.length}/{MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.footer}>
          {action === 'change-service' && isOnDemand ? (
            <Button
              variant="primary"
              onPress={handleSubmitServiceChange}
              loading={proposeServiceChange.isPending}
              disabled={!canSubmitServiceChange}
            >
              Enviar proposta ao cliente
            </Button>
          ) : (
            <Button
              variant="danger"
              onPress={handleSubmitCancel}
              loading={reportScopeMismatch.isPending}
              disabled={!canSubmitCancel}
            >
              Cancelar pedido sem custo
            </Button>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: spacing[5], paddingBottom: spacing[6] },
  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    gap: spacing[3],
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  toggleButtonActive: {
    backgroundColor: colors.neutral[100],
  },
  section: { gap: spacing[3] },
  list: { gap: spacing[2] },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
    gap: spacing[2],
  },
  cardSelected: {
    borderColor: colors.primary.default,
    borderWidth: 2,
  },
  pressed: { opacity: 0.85 },
  cardTitle: { flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textArea: { minHeight: 140 },
  counter: { textAlign: 'right' },
  footer: { paddingTop: spacing[2] },
});
