import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGoBack } from '@/lib/navigation/back-history';
import { Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DurationInput } from '@/components/forms/DurationInput';
import { durationInMinutes, durationParts } from '@/lib/utils/duration-input';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import {
  useDeleteProfessionalOffering,
  useProfessionalOfferings,
  useUpdateProfessionalOffering,
} from '@/lib/hooks/useProfessionalManagement';
import { moneyToInput, parseMoney } from '@/lib/utils/masks';
import type { PricingType } from '@/types/service-meta';
import { colors, radius, spacing } from '@/theme';

export default function EditProfessionalServiceScreen() {
  const goBack = useGoBack();
  const { offeringId } = useLocalSearchParams<{ offeringId: string }>();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const offeringsQuery = useProfessionalOfferings(profile?.id ?? '');
  const categoriesQuery = useServiceCategories();
  const updateOffering = useUpdateProfessionalOffering(profile?.id ?? '', offeringId);
  const deleteOffering = useDeleteProfessionalOffering(profile?.id ?? '');

  const offering = (offeringsQuery.data ?? []).find((item) => item.id === offeringId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('fixed');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState(durationParts());
  const [clearPrice, setClearPrice] = useState(false);

  useEffect(() => {
    if (offering) {
      setTitle(offering.title);
      setDescription(offering.description);
      setPricingType(offering.pricingType);
      setPrice(offering.price != null ? moneyToInput(offering.price) : '');
      setDuration(durationParts(offering.estimatedDurationMinutes));
      setClearPrice(false);
    }
  }, [offering]);

  if (profileQuery.isLoading || offeringsQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  if (profileQuery.isError || offeringsQuery.isError || categoriesQuery.isError || !profile) {
    return <ErrorState message="Não foi possível carregar o serviço." />;
  }
  if (!offering) {
    return <ErrorState message="Serviço não encontrado." />;
  }

  const categoryName = categoriesQuery.data?.find((c) => c.id === offering.categoryId)?.name ?? 'Categoria';
  const parsedPrice = parseMoney(price);
  const parsedDuration = durationInMinutes(duration);
  const useSpecialtyPrice = pricingType === 'hourly' && clearPrice;
  const validPrice = pricingType === 'hourly' && (useSpecialtyPrice || !price.trim()) || parsedPrice !== null && parsedPrice > 0;
  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    (pricingType === 'hourly' || parsedDuration > 0) &&
    validPrice;

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await updateOffering.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        pricingType,
        price: useSpecialtyPrice ? null : parsedPrice,
        clearPrice: useSpecialtyPrice,
        estimatedDurationMinutes: pricingType === 'hourly' ? null : parsedDuration,
      });
      goBack();
    } catch {
      // toast já exibido pelo hook
    }
  }

  function handleDelete() {
    const confirmDelete = async () => {
      try {
        await deleteOffering.mutateAsync(offeringId);
        goBack();
      } catch {
        // toast já exibido
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.')) {
        void confirmDelete();
      }
      return;
    }

    Alert.alert(
      'Remover serviço',
      'Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => void confirmDelete() },
      ],
    );
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Editar serviço" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.metaCard}>
          <Text variant="labelLg" color={colors.neutral[500]}>Categoria</Text>
          <Text variant="titleSm">{categoryName}</Text>
          <Text variant="labelSm" color={colors.neutral[400]}>
            A categoria não pode ser alterada após o cadastro.
          </Text>
        </View>

        <FormField label="Título">
          <Input value={title} onChangeText={setTitle} placeholder="Ex: Instalação de chuveiro" maxLength={120} />
        </FormField>

        <FormField label="Descrição">
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o que está incluso, requisitos, etc."
            multiline
            numberOfLines={4}
            maxLength={2000}
          />
        </FormField>

        <FormField label="Tipo de cobrança">
          <View style={styles.chipsRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: pricingType === 'fixed' }}
              aria-checked={pricingType === 'fixed'}
              onPress={() => { setPricingType('fixed'); setClearPrice(false); }}
              style={[styles.chip, pricingType === 'fixed' && styles.chipActive]}
            >
              <Text variant="labelLg" color={pricingType === 'fixed' ? '#FFFFFF' : colors.neutral[700]}>
                Valor fixo
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: pricingType === 'hourly' }}
              aria-checked={pricingType === 'hourly'}
              onPress={() => setPricingType('hourly')}
              style={[styles.chip, pricingType === 'hourly' && styles.chipActive]}
            >
              <Text variant="labelLg" color={pricingType === 'hourly' ? '#FFFFFF' : colors.neutral[700]}>
                Por hora
              </Text>
            </Pressable>
          </View>
        </FormField>

        <FormField label={pricingType === 'hourly' ? 'Valor por hora (opcional)' : 'Valor (R$)'}>
          <MoneyInput
            value={price}
            onChangeText={(value) => {
              setPrice(value);
              if (value) setClearPrice(false);
            }}
            placeholder="Ex: 100"
            editable={!useSpecialtyPrice}
          />
          {pricingType === 'hourly' ? (
            <Pressable onPress={() => { setClearPrice((value) => !value); if (!clearPrice) setPrice(''); }}>
              <Text variant="labelSm" color={clearPrice ? colors.primary.default : colors.neutral[500]}>
                {clearPrice ? '✓ Usar valor/hora da especialidade' : 'Limpar e usar valor/hora da especialidade'}
              </Text>
            </Pressable>
          ) : null}
        </FormField>

        {pricingType !== 'hourly' ? (
          <DurationInput value={duration} onChange={setDuration} />
        ) : null}

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.deleteRow, pressed && styles.pressed]}
        >
          <Trash2 color={colors.error} size={18} />
          <Text variant="bodySm" color={colors.error}>Remover serviço</Text>
        </Pressable>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        {!canSubmit ? <Text variant="bodySm" color={colors.neutral[600]}>Confira título, descrição, valor e duração antes de salvar.</Text> : null}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={updateOffering.isPending}
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
  metaCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[1],
  },
  chipsRow: { flexDirection: 'row', gap: spacing[2] },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: {
    backgroundColor: colors.primary.default,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
