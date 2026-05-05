import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { getAreaVisual } from '@/lib/catalog/area-visuals';
import { getCategoryVisual } from '@/lib/catalog/category-visuals';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { colors, radius, spacing } from '@/theme';

const EXPRESS_ACCENT = colors.warning;
const EXPRESS_ACCENT_BG = '#FFFBEB';
const EXPRESS_ACCENT_BORDER = '#FCD34D';

interface StepProps {
  index: number;
  label: string;
  active: boolean;
}

function Step({ index, label, active }: StepProps) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNum, active && styles.stepNumActive]}>
        <Text
          variant="labelSm"
          color={active ? '#FFFFFF' : colors.neutral[500]}
        >
          {index}
        </Text>
      </View>
      <Text
        variant="labelSm"
        color={active ? colors.neutral[900] : colors.neutral[500]}
      >
        {label}
      </Text>
    </View>
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
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Zap color="#FFFFFF" size={26} fill="#FFFFFF" />
        </View>
        <View style={styles.heroText}>
          <Text variant="titleLg" color="#FFFFFF">Pedido Express</Text>
          <View style={styles.heroSubRow}>
            <Clock color="rgba(255,255,255,0.85)" size={14} />
            <Text variant="labelLg" color="rgba(255,255,255,0.9)">
              Propostas em minutos
            </Text>
          </View>
        </View>
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        <Step index={1} label="Categoria" active />
        <View style={styles.stepLine} />
        <Step index={2} label="Descrição" active={false} />
        <View style={styles.stepLine} />
        <Step index={3} label="Propostas" active={false} />
      </View>

      {currentArea ? (
        <>
          <Pressable onPress={() => setSelectedAreaId(null)} style={styles.backLink}>
            <Text variant="labelLg" color={EXPRESS_ACCENT}>
              ← Voltar para áreas
            </Text>
          </Pressable>

          <Text variant="titleMd">{currentArea.name}</Text>

          <View style={styles.list}>
            {currentCategories.length === 0 ? (
              <Text variant="bodySm" color={colors.neutral[500]}>
                Nenhum serviço disponível nesta área.
              </Text>
            ) : (
              currentCategories.map((category) => {
                const visual = getCategoryVisual(category.name);
                const Icon = visual.Icon;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => handleCategoryPress(currentArea.id, category.id)}
                    style={({ pressed }) => [styles.categoryRow, pressed && styles.pressed]}
                  >
                    <View style={[styles.categoryBolt, { backgroundColor: visual.bgColor }]}>
                      <Icon color={visual.color} size={18} />
                    </View>
                    <Text variant="bodySm" style={styles.categoryName}>
                      {category.name}
                    </Text>
                    <Text variant="labelLg" color={EXPRESS_ACCENT}>
                      Criar pedido →
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </>
      ) : (
        <>
          <Text variant="titleMd">Selecione a área</Text>
          <View style={styles.list}>
            {areas.map((area) => {
              const visual = getAreaVisual(area.name);
              const Icon = visual.Icon;
              return (
                <Pressable
                  key={area.id}
                  onPress={() => setSelectedAreaId(area.id)}
                  style={({ pressed }) => [styles.areaRow, pressed && styles.pressed]}
                >
                  <View style={[styles.areaRowIcon, { backgroundColor: visual.bgColor }]}>
                    <Icon size={22} color={visual.color} />
                  </View>
                  <View style={styles.areaRowText}>
                    <Text variant="titleSm">{area.name}</Text>
                    <Text variant="labelSm" color={colors.neutral[500]}>
                      {categories.filter((c) => c.areaId === area.id).length} serviços
                    </Text>
                  </View>
                  <ChevronRight color={colors.neutral[400]} size={20} />
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: EXPRESS_ACCENT,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroText: { flex: 1, gap: spacing[1] },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    backgroundColor: EXPRESS_ACCENT_BG,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: EXPRESS_ACCENT_BORDER,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  stepNumActive: {
    backgroundColor: EXPRESS_ACCENT,
    borderColor: EXPRESS_ACCENT,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: EXPRESS_ACCENT_BORDER,
    marginHorizontal: spacing[1],
  },
  backLink: { alignSelf: 'flex-start' },
  list: { gap: spacing[2] },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  areaRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaRowText: { flex: 1, gap: 2 },
  pressed: { opacity: 0.7 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: EXPRESS_ACCENT_BORDER,
    backgroundColor: EXPRESS_ACCENT_BG,
  },
  categoryBolt: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  categoryName: { flex: 1 },
});
