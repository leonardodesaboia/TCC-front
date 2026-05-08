import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import {
  useProfessionalCalendarBlocks,
  useUpdateProfessionalCalendarBlock,
} from '@/lib/hooks/useProfessionalManagement';
import { colors, radius, spacing } from '@/theme';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function maskTime(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

const BLOCK_TYPE_LABEL: Record<string, string> = {
  recurring: 'Recorrente',
  specific_date: 'Data específica',
  order: 'Por pedido',
};

export default function EditCalendarBlockScreen() {
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const router = useRouter();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const blocksQuery = useProfessionalCalendarBlocks(profile?.id ?? '');
  const updateBlock = useUpdateProfessionalCalendarBlock(profile?.id ?? '');

  const block = blocksQuery.data?.find((b) => b.id === blockId);

  const [weekday, setWeekday] = useState<number | null>(null);
  const [specificDate, setSpecificDate] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!block) return;
    setWeekday(block.weekday ?? null);
    setSpecificDate(block.specificDate ?? '');
    setStartsAt(block.startsAt ?? '');
    setEndsAt(block.endsAt ?? '');
    setReason(block.reason ?? '');
  }, [block]);

  if (profileQuery.isLoading || blocksQuery.isLoading) return <LoadingScreen message="Carregando..." />;
  if (!block) return <ErrorState message="Bloqueio não encontrado." />;

  async function handleSubmit() {
    if (!block) return;
    try {
      await updateBlock.mutateAsync({
        blockId: block.id,
        payload: {
          weekday: block.blockType === 'recurring' && weekday != null ? weekday : undefined,
          specificDate: block.blockType === 'specific_date' ? specificDate : undefined,
          startsAt: isValidTime(startsAt) ? startsAt : null,
          endsAt: isValidTime(endsAt) ? endsAt : null,
          reason: reason.trim() || null,
        },
      });
      router.back();
    } catch {
      // toast já exibido pelo hook
    }
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Editar bloqueio" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <FormField label="Tipo">
          <View style={[styles.chip, styles.chipReadOnly]}>
            <Text variant="labelLg" color={colors.neutral[600]}>
              {BLOCK_TYPE_LABEL[block.blockType] ?? block.blockType}
            </Text>
          </View>
        </FormField>

        {block.blockType === 'recurring' ? (
          <FormField label="Dia da semana">
            <View style={styles.chipsRow}>
              {WEEKDAYS.map((label, index) => (
                <Pressable
                  key={index}
                  onPress={() => setWeekday(index)}
                  style={[styles.chip, styles.chipDay, weekday === index && styles.chipActive]}
                >
                  <Text
                    variant="labelLg"
                    color={weekday === index ? colors.neutral[50] : colors.neutral[700]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </FormField>
        ) : block.blockType === 'specific_date' ? (
          <FormField label="Data (AAAA-MM-DD)">
            <Input
              value={specificDate}
              onChangeText={(v) => setSpecificDate(maskDate(v))}
              placeholder="2025-12-31"
              keyboardType="numeric"
              maxLength={10}
            />
          </FormField>
        ) : null}

        {block.blockType !== 'order' ? (
          <>
            <FormField label="Início (deixe vazio para bloquear o dia inteiro)">
              <Input
                value={startsAt}
                onChangeText={(v) => setStartsAt(maskTime(v))}
                placeholder="08:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </FormField>

            <FormField label="Fim">
              <Input
                value={endsAt}
                onChangeText={(v) => setEndsAt(maskTime(v))}
                placeholder="12:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </FormField>
          </>
        ) : null}

        <FormField label="Motivo (opcional)">
          <Input
            value={reason}
            onChangeText={setReason}
            placeholder="Ex: Consulta médica"
            maxLength={500}
          />
        </FormField>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          loading={updateBlock.isPending}
        >
          Salvar alterações
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[4] },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipReadOnly: { alignSelf: 'flex-start' },
  chipDay: { minWidth: 48, alignItems: 'center' },
  chipActive: { backgroundColor: colors.primary.default },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
