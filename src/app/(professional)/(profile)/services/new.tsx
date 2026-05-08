import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { getCategoryVisual } from '@/lib/catalog/category-visuals';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useCreateProfessionalOffering } from '@/lib/hooks/useProfessionalManagement';
import type { PricingType } from '@/types/service-meta';
import type { ProfessionalSpecialty } from '@/types/professional-management';
import { colors, radius, spacing } from '@/theme';

function formatMoneyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const integer = digits.slice(0, -2) || '0';
  const decimal = digits.slice(-2).padStart(2, '0');
  return `${String(Number(integer))},${decimal}`;
}

function parseMoneyInput(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function numberToMoneyInput(value: number): string {
  return formatMoneyInput(Math.round(value * 100).toString());
}

export default function NewProfessionalServiceScreen() {
  const router = useRouter();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const createOffering = useCreateProfessionalOffering(profile?.id ?? '');

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('fixed');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  if (profileQuery.isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  if (profileQuery.isError || !profile) {
    return <ErrorState message="Não foi possível carregar o formulário." />;
  }

  const specialties: ProfessionalSpecialty[] = profile.specialties ?? [];

  function handleSelectCategory(specialty: ProfessionalSpecialty) {
    setCategoryId(specialty.categoryId);
    if (pricingType === 'hourly' && specialty.hourlyRate != null) {
      setPrice(numberToMoneyInput(specialty.hourlyRate));
    }
  }

  function handleSelectPricingType(type: PricingType) {
    setPricingType(type);
    if (type === 'hourly' && categoryId) {
      const specialty = specialties.find((s) => s.categoryId === categoryId);
      if (specialty?.hourlyRate != null) {
        setPrice(numberToMoneyInput(specialty.hourlyRate));
      }
    }
  }

  const parsedPrice = parseMoneyInput(price);
  const parsedDuration = duration ? parseInt(duration, 10) : 0;
  const canSubmit =
    !!categoryId &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    (pricingType === 'hourly' || parsedDuration > 0) &&
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
        estimatedDurationMinutes: pricingType === 'hourly' ? null : parsedDuration,
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
        <FormField label="Profissão">
          {specialties.length === 0 ? (
            <Text variant="bodySm" color={colors.neutral[500]}>
              Nenhuma profissão cadastrada no seu perfil.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {specialties.map((specialty) => {
                const active = specialty.categoryId === categoryId;
                const name = specialty.categoryName ?? specialty.categoryId;
                const visual = getCategoryVisual(name);
                const Icon = visual.Icon;
                return (
                  <Pressable
                    key={specialty.categoryId}
                    onPress={() => handleSelectCategory(specialty)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <View style={styles.chipContent}>
                      <View
                        style={[
                          styles.chipIcon,
                          active ? styles.chipIconActive : { backgroundColor: visual.bgColor },
                        ]}
                      >
                        <Icon size={14} color={active ? colors.neutral[50] : visual.color} />
                      </View>
                      <Text variant="labelLg" color={active ? colors.neutral[50] : colors.neutral[700]}>
                        {name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
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
              onPress={() => handleSelectPricingType('fixed')}
              style={[styles.chip, pricingType === 'fixed' && styles.chipActive]}
            >
              <Text variant="labelLg" color={pricingType === 'fixed' ? colors.neutral[50] : colors.neutral[700]}>
                Valor fixo
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelectPricingType('hourly')}
              style={[styles.chip, pricingType === 'hourly' && styles.chipActive]}
            >
              <Text variant="labelLg" color={pricingType === 'hourly' ? colors.neutral[50] : colors.neutral[700]}>
                Por hora
              </Text>
            </Pressable>
          </View>
        </FormField>

        <FormField label={pricingType === 'hourly' ? 'Valor por hora (R$)' : 'Valor (R$)'}>
          <Input
            value={price}
            onChangeText={(v) => setPrice(formatMoneyInput(v))}
            placeholder="Ex: 80,00"
            keyboardType="numeric"
          />
          {pricingType === 'hourly' ? (
            <Text variant="labelSm" color={colors.neutral[500]}>
              Preenchido automaticamente com o valor da profissão selecionada.
            </Text>
          ) : null}
        </FormField>

        {pricingType !== 'hourly' ? (
          <FormField label="Duração estimada (minutos)">
            <Input value={duration} onChangeText={setDuration} placeholder="Ex: 60" keyboardType="numeric" />
          </FormField>
        ) : null}

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
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  chipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIconActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
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
