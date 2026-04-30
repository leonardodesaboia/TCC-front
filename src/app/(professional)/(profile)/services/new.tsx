import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useCreateProfessionalOffering } from '@/lib/hooks/useProfessionalManagement';
import type { PricingType } from '@/types/service-meta';
import { colors, radius, spacing } from '@/theme';

export default function NewProfessionalServiceScreen() {
  const router = useRouter();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const categoriesQuery = useServiceCategories();
  const createOffering = useCreateProfessionalOffering(profile?.id ?? '');

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('fixed');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  if (profileQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  if (profileQuery.isError || categoriesQuery.isError || !profile) {
    return <ErrorState message="Não foi possível carregar o formulário." />;
  }

  const categories = categoriesQuery.data ?? [];
  const parsedPrice = price ? Number(price.replace(',', '.')) : null;
  const parsedDuration = duration ? parseInt(duration, 10) : 0;
  const canSubmit =
    !!categoryId &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    parsedDuration > 0 &&
    (pricingType === 'hourly' || (parsedPrice !== null && !Number.isNaN(parsedPrice) && parsedPrice > 0));

  async function handleSubmit() {
    if (!canSubmit || !categoryId) return;
    try {
      await createOffering.mutateAsync({
        categoryId,
        title: title.trim(),
        description: description.trim(),
        pricingType,
        price: parsedPrice ?? null,
        estimatedDurationMinutes: parsedDuration,
      });
      router.back();
    } catch {
      // toast já exibido pelo hook
    }
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Novo servico" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <FormField label="Categoria">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {categories.map((category) => {
              const active = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text variant="labelLg" color={active ? '#FFFFFF' : colors.neutral[700]}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </FormField>

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
            onChangeText={setPrice}
            placeholder="Ex: 80"
            keyboardType="decimal-pad"
          />
          {pricingType === 'hourly' ? (
            <Text variant="labelSm" color={colors.neutral[500]}>
              Se vazio, será usado o valor/hora da especialidade.
            </Text>
          ) : null}
        </FormField>

        <FormField label="Duração estimada (minutos)">
          <Input value={duration} onChangeText={setDuration} placeholder="Ex: 60" keyboardType="numeric" />
        </FormField>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={createOffering.isPending}
        >
          Cadastrar servico
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[4] },
  chipsRow: { flexDirection: 'row', gap: spacing[2], paddingRight: spacing[4] },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: {
    backgroundColor: colors.primary.default,
  },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
