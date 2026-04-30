import React, { useDeferredValue, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Brush,
  Droplets,
  HardHat,
  Heart,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { SearchBar } from '@/components/client/search/SearchBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import type { ServiceArea } from '@/types/catalog';
import { colors, radius, spacing } from '@/theme';

const AREA_STYLES: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  elétrica: { color: '#F59E0B', bgColor: '#FEF3C7', icon: <Zap size={24} /> },
  limpeza: { color: '#3B82F6', bgColor: '#DBEAFE', icon: <Sparkles size={24} /> },
  hidráulica: { color: '#06B6D4', bgColor: '#CFFAFE', icon: <Droplets size={24} /> },
  pintura: { color: '#8B5CF6', bgColor: '#EDE9FE', icon: <Brush size={24} /> },
  manutenção: { color: '#EF4444', bgColor: '#FEE2E2', icon: <Wrench size={24} /> },
  reforma: { color: '#E98936', bgColor: '#FFF1E5', icon: <HardHat size={24} /> },
  cuidados: { color: '#EC4899', bgColor: '#FCE7F3', icon: <Heart size={24} /> },
};

function getAreaVisual(area: ServiceArea) {
  const key = area.name.toLowerCase();
  return AREA_STYLES[key] ?? { color: colors.primary.default, bgColor: colors.primary.light, icon: <Search size={24} /> };
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query).trim().toLowerCase();

  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();

  const areas = areasQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredAreas = useMemo(() => {
    if (!deferredQuery) return areas;
    return areas.filter((area) => {
      const ownMatch = area.name.toLowerCase().includes(deferredQuery);
      const categoryMatch = categories.some(
        (category) =>
          category.areaId === area.id && category.name.toLowerCase().includes(deferredQuery),
      );
      return ownMatch || categoryMatch;
    });
  }, [areas, categories, deferredQuery]);

  const currentArea = selectedArea ? areas.find((area) => area.id === selectedArea) ?? null : null;

  const filteredCategories = useMemo(() => {
    if (!currentArea) return [];
    const currentCategories = categories.filter((category) => category.areaId === currentArea.id);
    if (!deferredQuery) return currentCategories;
    return currentCategories.filter((category) => category.name.toLowerCase().includes(deferredQuery));
  }, [categories, currentArea, deferredQuery]);

  function handleCategoryPress(areaId: string, categoryId: string) {
    const area = areas.find((item) => item.id === areaId);
    const category = categories.find((item) => item.id === categoryId);
    if (!area || !category) return;

    router.push({
      pathname: '/(client)/(search)/category/[categoryId]',
      params: { areaId, categoryId, areaName: area.name, categoryName: category.name },
    } as never);
  }

  if (areasQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando catálogo de serviços..." />;
  }

  if (areasQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar o catálogo agora."
        onRetry={() => {
          void areasQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Text variant="displaySm">O que você precisa?</Text>

      <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />

      {selectedArea && currentArea ? (
        <>
          <Pressable onPress={() => setSelectedArea(null)}>
            <Text variant="labelLg" color={colors.primary.default}>
              ← Voltar para áreas
            </Text>
          </Pressable>

          <Text variant="titleMd">{currentArea.name}</Text>

          {filteredCategories.length > 0 ? (
            <View style={styles.categoryList}>
              {filteredCategories.map((category) => {
                const areaVisual = getAreaVisual(currentArea);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => handleCategoryPress(currentArea.id, category.id)}
                    style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: areaVisual.color }]} />
                    <Text variant="bodySm" style={styles.categoryName}>{category.name}</Text>
                    <Text variant="labelLg" color={colors.primary.default}>Solicitar</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon={Search}
              title="Nenhuma categoria encontrada"
              description="Tente outro termo de busca ou volte para ver todas as áreas."
              actionLabel="Ver áreas"
              onAction={() => setSelectedArea(null)}
            />
          )}
        </>
      ) : (
        <>
          <Text variant="titleMd">Áreas de serviço</Text>
          {filteredAreas.length > 0 ? (
            <View style={styles.grid}>
              {filteredAreas.map((area) => {
                const visual = getAreaVisual(area);
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => setSelectedArea(area.id)}
                    style={({ pressed }) => [styles.areaCard, pressed && styles.pressed]}
                  >
                    <View style={[styles.areaIcon, { backgroundColor: visual.bgColor }]}>
                      {visual.icon}
                    </View>
                    <Text variant="titleSm">{area.name}</Text>
                    <Text variant="labelSm" color={colors.neutral[500]}>
                      {categories.filter((category) => category.areaId === area.id).length} serviços
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon={Search}
              title="Nenhuma área encontrada"
              description="Tente buscar por outra palavra."
              actionLabel="Limpar busca"
              onAction={() => setQuery('')}
            />
          )}
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
