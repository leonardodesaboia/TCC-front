import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Brush, Droplets, HardHat, Heart, Search, Sparkles, Wrench, Zap } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import type { ServiceArea } from '@/types/catalog';
import { colors, radius, spacing } from '@/theme';

const AREA_STYLES: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  elétrica: { color: '#F59E0B', bgColor: '#FEF3C7', icon: <Zap size={24} color="#F59E0B" /> },
  limpeza: { color: '#3B82F6', bgColor: '#DBEAFE', icon: <Sparkles size={24} color="#3B82F6" /> },
  hidráulica: { color: '#06B6D4', bgColor: '#CFFAFE', icon: <Droplets size={24} color="#06B6D4" /> },
  pintura: { color: '#8B5CF6', bgColor: '#EDE9FE', icon: <Brush size={24} color="#8B5CF6" /> },
  manutenção: { color: '#EF4444', bgColor: '#FEE2E2', icon: <Wrench size={24} color="#EF4444" /> },
  reforma: { color: '#E98936', bgColor: '#FFF1E5', icon: <HardHat size={24} color="#E98936" /> },
  cuidados: { color: '#EC4899', bgColor: '#FCE7F3', icon: <Heart size={24} color="#EC4899" /> },
};

function getAreaVisual(area: ServiceArea) {
  return (
    AREA_STYLES[area.name.toLowerCase()] ?? {
      color: colors.primary.default,
      bgColor: colors.primary.light,
      icon: <Search size={24} color={colors.primary.default} />,
    }
  );
}

export default function ExpressHubScreen() {
  const router = useRouter();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();

  if (areasQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando serviços..." />;
  }

  if (areasQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os serviços."
        onRetry={() => {
          void areasQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  const areas = areasQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const currentArea = selectedAreaId ? (areas.find((a) => a.id === selectedAreaId) ?? null) : null;
  const currentCategories = currentArea ? categories.filter((c) => c.areaId === currentArea.id) : [];

  function handleCategoryPress(areaId: string, categoryId: string) {
    const area = areas.find((a) => a.id === areaId);
    const category = categories.find((c) => c.id === categoryId);
    if (!area || !category) return;

    router.push({
      pathname: '/(client)/(express)/create',
      params: { areaId, categoryId, areaName: area.name, categoryName: category.name },
    } as never);
  }

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Text variant="displaySm">Pedido Express</Text>
      <Text variant="bodySm" color={colors.neutral[500]}>
        Descreva o que precisa e receba propostas de profissionais próximos.
      </Text>

      {currentArea ? (
        <>
          <Pressable onPress={() => setSelectedAreaId(null)}>
            <Text variant="labelLg" color={colors.primary.default}>
              ← Voltar para áreas
            </Text>
          </Pressable>

          <Text variant="titleMd">{currentArea.name}</Text>

          <View style={styles.categoryList}>
            {currentCategories.length === 0 ? (
              <Text variant="bodySm" color={colors.neutral[500]}>
                Nenhum serviço disponível nesta área.
              </Text>
            ) : currentCategories.map((category) => {
              const visual = getAreaVisual(currentArea);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(currentArea.id, category.id)}
                  style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}
                >
                  <View style={[styles.categoryDot, { backgroundColor: visual.color }]} />
                  <Text variant="bodySm" style={styles.categoryName}>
                    {category.name}
                  </Text>
                  <Text variant="labelLg" color={colors.primary.default}>
                    Criar pedido
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text variant="titleMd">Selecione a área</Text>
          <View style={styles.grid}>
            {areas.map((area) => {
              const visual = getAreaVisual(area);
              return (
                <Pressable
                  key={area.id}
                  onPress={() => setSelectedAreaId(area.id)}
                  style={({ pressed }) => [styles.areaCard, pressed && styles.pressed]}
                >
                  <View style={[styles.areaIcon, { backgroundColor: visual.bgColor }]}>
                    {visual.icon}
                  </View>
                  <Text variant="titleSm">{area.name}</Text>
                  <Text variant="labelSm" color={colors.neutral[500]}>
                    {categories.filter((c) => c.areaId === area.id).length} serviços
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  areaCard: {
    width: '47%',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[3],
  },
  areaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  categoryList: { gap: spacing[1] },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { flex: 1 },
});
