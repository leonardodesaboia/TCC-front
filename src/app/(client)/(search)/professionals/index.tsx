import { useDeferredValue, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, Sparkles } from 'lucide-react-native';
import { ProfessionalList } from '@/components/client/search/ProfessionalList';
import { SearchBar } from '@/components/client/search/SearchBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Text } from '@/components/ui';
import { useProfessionalsByCategory } from '@/lib/hooks/useProfessionals';
import { colors, radius, spacing } from '@/theme';

type FilterChipKey = 'rating' | 'price' | 'availability';

const FILTER_CHIPS: Array<{
  key: FilterChipKey;
  label: string;
  disabled?: boolean;
}> = [
  { key: 'rating', label: 'Mais bem avaliados' },
  { key: 'price', label: 'Menor preco', disabled: true },
  { key: 'availability', label: 'Disponivel agora' },
];

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function isAvailableNow(label?: string) {
  const normalized = normalize(label);
  return /(agora|hoje|imediat|dispon|livre|atende)/.test(normalized);
}

export default function ProfessionalsByCategoryScreen() {
  const router = useRouter();
  const { areaId, categoryId, areaName, categoryName } = useLocalSearchParams<{
    areaId?: string;
    categoryId?: string;
    areaName?: string;
    categoryName?: string;
  }>();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChipKey>('rating');
  const deferredQuery = useDeferredValue(query);

  const professionalsQuery = useProfessionalsByCategory(categoryId, areaId, categoryName, {
    limit: 50,
  });

  const professionals = professionalsQuery.data ?? [];

  const filteredProfessionals = useMemo(() => {
    const normalizedQuery = normalize(deferredQuery);
    let current = professionals.filter((professional) => {
      if (!normalizedQuery) return true;

      const searchableFields = [
        professional.name,
        professional.profession,
        professional.neighborhood,
        professional.city,
        ...professional.specialties,
      ];

      return searchableFields.some((field) => normalize(field).includes(normalizedQuery));
    });

    if (activeFilter === 'availability') {
      current = current.filter((professional) => isAvailableNow(professional.availabilityLabel));
    }

    return [...current].sort((left, right) => {
      if (activeFilter === 'availability') {
        return Number(isAvailableNow(right.availabilityLabel)) - Number(isAvailableNow(left.availabilityLabel));
      }

      return right.rating - left.rating;
    });
  }, [activeFilter, deferredQuery, professionals]);

  const emptyState = useMemo(() => {
    if (query.trim()) {
      return {
        title: 'Nenhum profissional encontrado',
        description: 'Tente outro termo ou remova os filtros para ampliar a busca.',
        actionLabel: 'Limpar busca',
        onAction: () => setQuery(''),
      };
    }

    if (activeFilter === 'availability') {
      return {
        title: 'Sem disponibilidade imediata',
        description: 'Nenhum profissional dessa categoria aparece como disponivel agora.',
        actionLabel: 'Ver todos',
        onAction: () => setActiveFilter('rating'),
      };
    }

    return {
      title: 'Nenhum profissional disponivel',
      description: 'Ainda nao encontramos profissionais para essa categoria. Voce pode abrir um pedido Express agora.',
      actionLabel: 'Abrir Express',
      onAction: () => {
        if (!areaId || !categoryId) return;
        router.push({
          pathname: '/(client)/(orders)/express',
          params: {
            areaId,
            categoryId,
            areaName,
            categoryName,
          },
        });
      },
    };
  }, [activeFilter, areaId, areaName, categoryId, categoryName, query, router]);

  if (professionalsQuery.isLoading) {
    return <LoadingScreen message="Carregando profissionais..." />;
  }

  if (professionalsQuery.isError) {
    return (
      <ErrorState
        message="Nao foi possivel carregar os profissionais dessa categoria."
        onRetry={() => {
          void professionalsQuery.refetch();
        }}
      />
    );
  }

  return (
    <Screen
      edges={['top']}
      style={styles.screen}
      refreshControl={
        <RefreshControl
          refreshing={professionalsQuery.isRefetching}
          onRefresh={() => {
            void professionalsQuery.refetch();
          }}
          tintColor={colors.primary.default}
        />
      }
    >
      <Header title="Escolher profissional" showBack />

      <View style={styles.hero}>
        {areaName ? <Badge label={areaName} /> : null}
        <Text variant="displaySm">{categoryName ?? 'Profissionais'}</Text>
        <Text variant="bodySm" color={colors.neutral[600]}>
          Compare perfis, avaliacoes e siga direto para o agendamento sob demanda.
        </Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />

      <View style={styles.filterRow}>
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.key === activeFilter;
          return (
            <Pressable
              key={chip.key}
              disabled={chip.disabled}
              onPress={() => setActiveFilter(chip.key)}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
                chip.disabled && styles.filterChipDisabled,
              ]}
            >
              <Text
                variant="labelLg"
                color={
                  chip.disabled
                    ? colors.neutral[400]
                    : isActive
                      ? colors.primary.default
                      : colors.neutral[600]
                }
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summaryRow}>
        <Text variant="labelLg" color={colors.neutral[500]}>
          {filteredProfessionals.length} profissionais encontrados
        </Text>
        {activeFilter === 'price' ? (
          <Badge label="Preco em breve" variant="muted" />
        ) : null}
      </View>

      {filteredProfessionals.length > 0 ? (
        <ProfessionalList
          professionals={filteredProfessionals.map((professional) => ({
            id: professional.id,
            name: professional.name,
            profession: professional.profession,
            specialties: professional.specialties,
            rating: professional.rating.toFixed(1),
            reviewCount: String(professional.reviewCount),
            neighborhood:
              [professional.neighborhood, professional.city].filter(Boolean).join(', ') ||
              'Localizacao nao informada',
            availability: professional.availabilityLabel ?? 'Consulte disponibilidade',
            badge: professional.badgeLabel,
            ctaLabel: 'Ver perfil',
          }))}
          onPressProfessional={(professionalId) =>
            router.push({
              pathname: '/(client)/(search)/professionals/[id]',
              params: {
                id: professionalId,
                areaId,
                areaName,
                categoryId,
                categoryName,
              },
            })
          }
        />
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={query.trim() || activeFilter === 'availability' ? Search : Sparkles}
            title={emptyState.title}
            description={emptyState.description}
            actionLabel={emptyState.actionLabel}
            onAction={emptyState.onAction}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[4],
  },
  hero: {
    gap: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  filterChip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  filterChipActive: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.light,
  },
  filterChipDisabled: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
