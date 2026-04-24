import { useDeferredValue, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Search, Sparkles } from 'lucide-react-native';
import { ProfessionalList } from '@/components/client/search/ProfessionalList';
import { SearchBar } from '@/components/client/search/SearchBar';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { colors, layout, radius, shadows, spacing } from '@/theme';

const CATEGORY_CHIPS = [
  'Todos',
  'Limpeza',
  'Elétrica',
  'Cuidados',
  'Manutenção',
];

const PROFESSIONALS = [
  {
    id: 'pro-1',
    name: 'Ana Beatriz',
    profession: 'Faxina e organização',
    specialties: ['Apartamento', 'Pós-obra leve'],
    rating: '4,9',
    reviewCount: '128',
    neighborhood: 'Aldeota',
    availability: 'Disponível amanhã',
    badge: 'Mais contratada',
    accentColor: '#E98936',
  },
  {
    id: 'pro-2',
    name: 'Caio Lima',
    profession: 'Elétrica residencial',
    specialties: ['Instalação', 'Pequenos reparos'],
    rating: '4,8',
    reviewCount: '94',
    neighborhood: 'Meireles',
    availability: 'Atende hoje',
    badge: 'Resposta rápida',
    accentColor: '#C46F28',
  },
  {
    id: 'pro-3',
    name: 'Juliana Rocha',
    profession: 'Cuidados e bem-estar',
    specialties: ['Acompanhamento', 'Rotina domiciliar'],
    rating: '5,0',
    reviewCount: '63',
    neighborhood: 'Cocó',
    availability: 'Agenda noturna',
    badge: 'Novo destaque',
    accentColor: '#D77219',
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const deferredQuery = useDeferredValue(query);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredProfessionals = PROFESSIONALS.filter((professional) => {
    const matchesCategory =
      selectedCategory === 'Todos' ||
      professional.profession.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      professional.specialties.some((item) =>
        item.toLowerCase().includes(selectedCategory.toLowerCase()),
      );

    const matchesQuery =
      normalizedQuery.length === 0 ||
      professional.name.toLowerCase().includes(normalizedQuery) ||
      professional.profession.toLowerCase().includes(normalizedQuery) ||
      professional.specialties.some((item) => item.toLowerCase().includes(normalizedQuery)) ||
      professional.neighborhood.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <Screen edges={['top']} style={styles.screenContent}>
      <View style={styles.backdrop} />

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Search color={colors.neutral[50]} size={14} />
          <Text variant="labelLg" color={colors.neutral[50]}>
            BUSCAR
          </Text>
        </View>
        <Text variant="displaySm" color={colors.neutral[50]}>
          Encontre o profissional certo sem esforço.
        </Text>
        <Text color="#FFF1E5">
          Comece por uma área, refine a intenção e compare os perfis com calma.
        </Text>
      </View>

      <View style={styles.searchShell}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLg">Categorias</Text>
          <Text variant="labelLg" color={colors.primary.default}>
            {selectedCategory}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = chip === selectedCategory;

            return (
              <Pressable
                key={chip}
                onPress={() => setSelectedCategory(chip)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text
                  variant="labelLg"
                  color={isActive ? colors.neutral[50] : colors.secondary.default}
                >
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLg">Resultados</Text>
          <View style={styles.resultsMeta}>
            <Sparkles color={colors.primary.default} size={15} />
            <Text variant="labelLg" color={colors.primary.default}>
              {filteredProfessionals.length} perfis
            </Text>
          </View>
        </View>

        {filteredProfessionals.length > 0 ? (
          <ProfessionalList professionals={filteredProfessionals} />
        ) : (
          <View style={styles.emptyState}>
            <Text variant="titleSm">Nada apareceu com esse filtro.</Text>
            <Text color={colors.neutral[500]}>
              Tente outro termo ou volte para “Todos”.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: layout.sectionGap,
    paddingBottom: spacing[8],
    backgroundColor: '#FFF8F2',
  },
  backdrop: {
    position: 'absolute',
    top: -80,
    right: -36,
    width: 190,
    height: 190,
    borderRadius: radius.full,
    backgroundColor: 'rgba(233, 137, 54, 0.08)',
  },
  hero: {
    gap: spacing[2],
    borderRadius: radius.xl,
    backgroundColor: colors.primary.default,
    padding: spacing[5],
    ...shadows.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.full,
    backgroundColor: 'rgba(92, 47, 18, 0.16)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  searchShell: {
    gap: spacing[3],
  },
  section: {
    gap: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  chipsRow: {
    gap: spacing[2],
    paddingRight: spacing[4],
  },
  chip: {
    borderRadius: radius.full,
    backgroundColor: '#FFF1E5',
    borderWidth: 1,
    borderColor: '#F6D8BF',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  resultsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  emptyState: {
    gap: spacing[2],
    borderRadius: radius.xl,
    backgroundColor: '#FFF1E5',
    borderWidth: 1,
    borderColor: '#F6D8BF',
    padding: layout.cardPadding,
  },
});
