import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import {
  useDeleteProfessionalOffering,
  useProfessionalOfferings,
  useUpdateProfessionalOffering,
} from '@/lib/hooks/useProfessionalManagement';
import type { PricingType } from '@/types/service-meta';
import { colors, radius, spacing } from '@/theme';

export default function EditProfessionalServiceScreen() {
  const router = useRouter();
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
  const [duration, setDuration] = useState('');
  const [clearPrice, setClearPrice] = useState(false);

  useEffect(() => {
    if (offering) {
      setTitle(offering.title);
      setDescription(offering.description);
      setPricingType(offering.pricingType);
      setPrice(offering.price != null ? String(offering.price) : '');
      setDuration(String(offering.estimatedDurationMinutes ?? 0));
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
  const parsedPrice = price ? Number(price.replace(',', '.')) : null;
  const parsedDuration = duration ? parseInt(duration, 10) : 0;
  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    parsedDuration > 0 &&
    (clearPrice || pricingType === 'hourly' || (parsedPrice !== null && !Number.isNaN(parsedPrice) && parsedPrice > 0));

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await updateOffering.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        pricingType,
        price: clearPrice ? null : parsedPrice,
        clearPrice,
        estimatedDurationMinutes: parsedDuration,
      });
      router.back();
    } catch {
      // toast já exibido pelo hook
    }
  }

  function handleDelete() {
    Alert.alert(
      'Remover serviço',
      'Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOffering.mutateAsync(offeringId);
              router.back();
            } catch {
              // toast já exibido
            }
          },
        },
      ],
    );
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Editar servico" showBack />

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
              onPress={() => setPricingType('fixed')}
              style={[styles.chip, pricingType === 'fixed' && styles.chipActive]}
            >
              <Text variant="labelLg" color={pricingType === 'fixed' ? '#FFFFFF' : colors.neutral[700]}>
                Valor fixo
              </Text>
            </Pressable>
            <Pressable
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
          <Input
            value={price}
            onChangeText={(value) => {
              setPrice(value);
              if (value) setClearPrice(false);
            }}
            placeholder="Ex: 80"
            keyboardType="decimal-pad"
            editable={!clearPrice}
          />
          {pricingType === 'hourly' ? (
            <Pressable onPress={() => { setClearPrice((value) => !value); if (!clearPrice) setPrice(''); }}>
              <Text variant="labelSm" color={clearPrice ? colors.primary.default : colors.neutral[500]}>
                {clearPrice ? '✓ Usar valor/hora da especialidade' : 'Limpar e usar valor/hora da especialidade'}
              </Text>
            </Pressable>
          ) : null}
        </FormField>

        <FormField label="Duração estimada (minutos)">
          <Input value={duration} onChangeText={setDuration} placeholder="Ex: 60" keyboardType="numeric" />
        </FormField>

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
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={updateOffering.isPending}
        >
          Salvar alteracoes
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
  pressed: { opacity: 0.7 },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
