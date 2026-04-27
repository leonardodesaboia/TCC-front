import { useDeferredValue, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface ServiceArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  categories: ServiceCategory[];
}

interface ServiceCategory {
  id: string;
  name: string;
}

const SERVICE_AREAS: ServiceArea[] = [
  {
    id: 'area-1',
    name: 'Elétrica',
    icon: <Zap size={24} />,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    categories: [
      { id: 'cat-1', name: 'Eletricista' },
      { id: 'cat-2', name: 'Instalação de tomada' },
      { id: 'cat-3', name: 'Troca de disjuntor' },
    ],
  },
  {
    id: 'area-2',
    name: 'Limpeza',
    icon: <Sparkles size={24} />,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    categories: [
      { id: 'cat-4', name: 'Faxina residencial' },
      { id: 'cat-5', name: 'Limpeza pós-obra' },
      { id: 'cat-6', name: 'Limpeza comercial' },
    ],
  },
  {
    id: 'area-3',
    name: 'Hidráulica',
    icon: <Droplets size={24} />,
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    categories: [
      { id: 'cat-7', name: 'Encanador' },
      { id: 'cat-8', name: 'Desentupimento' },
      { id: 'cat-9', name: 'Instalação de torneira' },
    ],
  },
  {
    id: 'area-4',
    name: 'Pintura',
    icon: <Brush size={24} />,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    categories: [
      { id: 'cat-10', name: 'Pintura interna' },
      { id: 'cat-11', name: 'Pintura externa' },
      { id: 'cat-12', name: 'Textura e efeitos' },
    ],
  },
  {
    id: 'area-5',
    name: 'Manutenção',
    icon: <Wrench size={24} />,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    categories: [
      { id: 'cat-13', name: 'Manutenção geral' },
      { id: 'cat-14', name: 'Montagem de móveis' },
      { id: 'cat-15', name: 'Reparos domésticos' },
    ],
  },
  {
    id: 'area-6',
    name: 'Reforma',
    icon: <HardHat size={24} />,
    color: '#E98936',
    bgColor: '#FFF1E5',
    categories: [
      { id: 'cat-16', name: 'Pedreiro' },
      { id: 'cat-17', name: 'Gesseiro' },
      { id: 'cat-18', name: 'Azulejista' },
    ],
  },
  {
    id: 'area-7',
    name: 'Cuidados',
    icon: <Heart size={24} />,
    color: '#EC4899',
    bgColor: '#FCE7F3',
    categories: [
      { id: 'cat-19', name: 'Cuidador de idosos' },
      { id: 'cat-20', name: 'Babá' },
      { id: 'cat-21', name: 'Pet sitter' },
    ],
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const dq = useDeferredValue(query).trim().toLowerCase();

  const filteredAreas = dq.length === 0
    ? SERVICE_AREAS
    : SERVICE_AREAS.filter(
        (a) =>
          a.name.toLowerCase().includes(dq) ||
          a.categories.some((c) => c.name.toLowerCase().includes(dq)),
      );

  const currentArea = selectedArea
    ? SERVICE_AREAS.find((a) => a.id === selectedArea)
    : null;

  const filteredCategories = currentArea
    ? dq.length === 0
      ? currentArea.categories
      : currentArea.categories.filter((c) => c.name.toLowerCase().includes(dq))
    : [];

  function handleCategoryPress(areaId: string, categoryId: string) {
    const area = SERVICE_AREAS.find((a) => a.id === areaId);
    const category = area?.categories.find((c) => c.id === categoryId);
    if (area && category) {
      router.push({
        pathname: '/(client)/(orders)/express',
        params: { areaId, categoryId, areaName: area.name, categoryName: category.name },
      } as any);
    }
  }

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Text variant="displaySm">O que você precisa?</Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
      />

      {selectedArea && currentArea ? (
        /* Category list within selected area */
        <>
          <Pressable onPress={() => setSelectedArea(null)}>
            <Text variant="labelLg" color={colors.primary.default}>
              ← Voltar para áreas
            </Text>
          </Pressable>

          <Text variant="titleMd">{currentArea.name}</Text>

          <View style={styles.categoryList}>
            {filteredCategories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => handleCategoryPress(currentArea.id, cat.id)}
                style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}
              >
                <View style={[styles.categoryDot, { backgroundColor: currentArea.color }]} />
                <Text variant="bodySm" style={styles.categoryName}>{cat.name}</Text>
                <Text variant="labelLg" color={colors.primary.default}>Solicitar</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        /* Areas grid */
        <>
          <Text variant="titleMd">Áreas de serviço</Text>
          <View style={styles.grid}>
            {filteredAreas.map((area) => (
              <Pressable
                key={area.id}
                onPress={() => setSelectedArea(area.id)}
                style={({ pressed }) => [styles.areaCard, pressed && styles.pressed]}
              >
                <View style={[styles.areaIcon, { backgroundColor: area.bgColor }]}>
                  {React.cloneElement(area.icon as React.ReactElement, { color: area.color })}
                </View>
                <Text variant="titleSm">{area.name}</Text>
                <Text variant="labelSm" color={colors.neutral[500]}>
                  {area.categories.length} serviços
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

import React from 'react';

const styles = StyleSheet.create({
  screen: { gap: spacing[4] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
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
    paddingVertical: spacing[3.5],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: { flex: 1 },
});
