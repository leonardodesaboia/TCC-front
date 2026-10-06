import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Button, Input, Text } from '@/components/ui';
import { useProposeNewPrice } from '@/lib/hooks/useProfessionalArea';
import { formatMoney } from '@/lib/utils/formatters';
import { colors, radius, spacing } from '@/theme';

const MAX_REASON_LENGTH = 500;

export default function ProposeNewPriceScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');
  const proposeNewPrice = useProposeNewPrice(orderId);

  const amount = parseInt(amountText.replace(/\D/g, '') || '0', 10) / 100;
  const canSubmit = amount > 0 && reason.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    proposeNewPrice.mutate({ newAmount: amount, reason: reason.trim() });
  }

  return (
    <Screen edges={['top']}>
      <Header title="Propor novo preço" showBack />

      <View style={styles.sectionCard}>
        <Text variant="titleSm">Escopo diferente do combinado?</Text>
        <Text variant="bodySm" color={colors.neutral[600]}>
          Em vez de cancelar direto, você pode propor um novo valor para o escopo real
          encontrado. O pedido continua ativo enquanto o cliente decide — se ele recusar, o
          pedido é cancelado sem custo para nenhuma das partes.
        </Text>

        <Input
          value={amountText}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '');
            setAmountText(digits ? formatMoney(parseInt(digits, 10) / 100) : '');
          }}
          placeholder="Novo valor (R$)"
          keyboardType="numeric"
        />

        <Input
          value={reason}
          onChangeText={(text) => setReason(text.slice(0, MAX_REASON_LENGTH))}
          placeholder="Explique o motivo do novo valor..."
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />
        <Text variant="labelSm" color={colors.neutral[400]} style={styles.counter}>
          {reason.length}/{MAX_REASON_LENGTH}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={proposeNewPrice.isPending}
          disabled={!canSubmit}
        >
          Enviar proposta ao cliente
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  textArea: { minHeight: 120 },
  counter: { textAlign: 'right' },
  footer: { paddingTop: spacing[2] },
});
