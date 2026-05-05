import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronRight,
  Search,
} from 'lucide-react-native';
import { SearchBar } from '@/components/client/search/SearchBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { getAreaVisual } from '@/lib/catalog/area-visuals';
import { getCategoryVisual } from '@/lib/catalog/category-visuals';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { colors, radius, spacing } from '@/theme';

export default function SearchScreen() {
  const router = useRouter();
  const { areaId: initialAreaId } = useLocalSearchParams<{ areaId?: string }>();
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(initialAreaId ?? null);
  const deferredQuery = useDeferredValue(query).trim().toLowerCase();

  useEffect(() => {
    if (initialAreaId) setSelectedArea(initialAreaId);
  }, [initialAreaId]);

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
      pathname: '/(client)/(search)/professionals',
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
                const visual = getCategoryVisual(category.name);
                const Icon = visual.Icon;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => handleCategoryPress(currentArea.id, category.id)}
                    style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: visual.bgColor }]}>
                      <Icon size={18} color={visual.color} />
                    </View>
                    <Text variant="bodySm" style={styles.categoryName}>{category.name}</Text>
                    <ChevronRight color={colors.neutral[400]} size={20} />
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
                const visual = getAreaVisual(area.name);
                const Icon = visual.Icon;
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => setSelectedArea(area.id)}
                    style={({ pressed }) => [styles.areaCard, pressed && styles.pressed]}
                  >
                    <View style={[styles.areaIcon, { backgroundColor: visual.bgColor }]}>
                      <Icon size={24} color={visual.color} />
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
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { flex: 1 },
});
