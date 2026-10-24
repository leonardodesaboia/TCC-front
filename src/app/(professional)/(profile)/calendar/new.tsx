import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useGoBack } from '@/lib/navigation/back-history';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useCreateProfessionalCalendarBlock } from '@/lib/hooks/useProfessionalManagement';
import { formatDateWithWeekday } from '@/lib/utils/formatters';
import type { BlockType } from '@/types/professional-management';
import { colors, radius, spacing } from '@/theme';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function isValidDate(value: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

function maskTime(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converte "dd/mm/aaaa" em Date (meio-dia, para não sofrer com fuso). Retorna null se a data não existir. */
function parseDate(value: string): Date | null {
  if (!isValidDate(value)) return null;
  const [dd, mm, yyyy] = value.split('/').map(Number);
  const date = new Date(yyyy, mm - 1, dd, 12);
  return date.getDate() === dd && date.getMonth() === mm - 1 ? date : null;
}

function dateToApi(value: string): string {
  const [dd, mm, yyyy] = value.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewCalendarBlockScreen() {
  const goBack = useGoBack();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const createBlock = useCreateProfessionalCalendarBlock(profile?.id ?? '');

  const [blockType, setBlockType] = useState<Extract<BlockType, 'recurring' | 'specific_date'>>('specific_date');
  const [weekday, setWeekday] = useState<number | null>(null);
  const [specificDate, setSpecificDate] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');

  const parsedDate = parseDate(specificDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = parsedDate !== null && parsedDate < today;

  if (profileQuery.isLoading) return <LoadingScreen message="Carregando..." />;
  if (profileQuery.isError || !profile) return <ErrorState message="Não foi possível carregar o formulário." />;

  const canSubmit =
    (blockType === 'recurring' && weekday != null) ||
    (blockType === 'specific_date' && parsedDate !== null && !isPastDate);

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await createBlock.mutateAsync({
        blockType,
        weekday: blockType === 'recurring' ? weekday! : undefined,
        specificDate: blockType === 'specific_date' ? dateToApi(specificDate) : undefined,
        startsAt: isValidTime(startsAt) ? startsAt : undefined,
        endsAt: isValidTime(endsAt) ? endsAt : undefined,
        reason: reason.trim() || undefined,
      });
      goBack();
    } catch {
      // toast já exibido pelo hook
    }
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Novo bloqueio" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <FormField label="Tipo de bloqueio">
          <View style={styles.chipsRow}>
            {(['specific_date', 'recurring'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setBlockType(type)}
                style={[styles.chip, blockType === type && styles.chipActive]}
              >
                <Text
                  variant="labelLg"
                  color={blockType === type ? colors.neutral[50] : colors.neutral[700]}
                >
                  {type === 'recurring' ? 'Toda semana' : 'Data específica'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="labelLg" color={colors.neutral[500]}>
            {blockType === 'specific_date'
              ? 'Bloqueia apenas o dia escolhido.'
              : 'Bloqueia o mesmo dia em todas as semanas, sem data para acabar.'}
          </Text>
        </FormField>

        {blockType === 'recurring' ? (
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
        ) : (
          <FormField label="Data">
            <Input
              value={specificDate}
              onChangeText={(v) => setSpecificDate(maskDate(v))}
              placeholder="dd/mm/aaaa"
              keyboardType="numeric"
              maxLength={10}
            />
            {parsedDate ? (
              <Text variant="labelLg" color={isPastDate ? colors.error : colors.neutral[600]}>
                {isPastDate
                  ? 'Essa data já passou. Escolha uma data a partir de hoje.'
                  : `Dia escolhido: ${formatDateWithWeekday(parsedDate)}`}
              </Text>
            ) : specificDate.length === 10 ? (
              <Text variant="labelLg" color={colors.error}>Data inválida.</Text>
            ) : null}
          </FormField>
        )}

        <Text variant="labelLg" color={colors.neutral[500]}>
          Para bloquear o dia inteiro, deixe os dois horários em branco.
        </Text>

        <FormField label="Horário de início (opcional)">
          <Input
            value={startsAt}
            onChangeText={(v) => setStartsAt(maskTime(v))}
            placeholder="hh:mm"
            keyboardType="numeric"
            maxLength={5}
          />
        </FormField>

        <FormField label="Horário de fim (opcional)">
          <Input
            value={endsAt}
            onChangeText={(v) => setEndsAt(maskTime(v))}
            placeholder="hh:mm"
            keyboardType="numeric"
            maxLength={5}
          />
        </FormField>

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
          disabled={!canSubmit}
          loading={createBlock.isPending}
        >
          Salvar bloqueio
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
  chipDay: { minWidth: 48, alignItems: 'center' },
  chipActive: { backgroundColor: colors.primary.default },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
