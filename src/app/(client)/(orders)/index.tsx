import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { OrderCard, type OrderCardItem } from '@/components/client/orders/OrderCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useMyOrders } from '@/lib/hooks/useOrders';
import { OrderStatus } from '@/types/order';
import { colors, radius, spacing } from '@/theme';

const FILTERS = ['Todos', 'Buscando', 'Aceito', 'Aguardando', 'Concluído', 'Cancelado'];

const STATUS_MAP: Record<string, OrderStatus | undefined> = {
  Todos: undefined,
  Buscando: OrderStatus.PENDING,
  Aceito: OrderStatus.ACCEPTED,
  Aguardando: OrderStatus.COMPLETED_BY_PRO,
  Concluído: OrderStatus.COMPLETED,
  Cancelado: OrderStatus.CANCELLED,
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function OrdersScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Todos');
  const ordersQuery = useMyOrders({ status: STATUS_MAP[filter] });
  const categoriesQuery = useServiceCategories();

  if (ordersQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando pedidos..." />;
  }

  if (ordersQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar seus pedidos."
        onRetry={() => {
          void ordersQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  const categories = categoriesQuery.data ?? [];
  const filtered: OrderCardItem[] = (ordersQuery.data ?? []).map((order) => {
    const categoryName = categories.find((category) => category.id === order.categoryId)?.name ?? 'Serviço';
    const snapshot = order.addressSnapshot;
    return {
      id: order.id,
      categoryName,
      description: order.description,
      status: order.status,
      mode: order.mode,
      createdAt: formatDate(order.createdAt),
      address: snapshot
        ? `${snapshot.street}, ${snapshot.number} - ${snapshot.district}`
        : 'Endereço indisponível',
      totalAmount: order.totalAmount > 0 ? formatMoney(order.totalAmount) : undefined,
    };
  });

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Text variant="displaySm">Pedidos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text variant="labelLg" color={active ? '#FFFFFF' : colors.neutral[700]}>
                {f}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length > 0 ? (
        <View style={styles.list}>
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => router.push(`/(client)/(orders)/${order.id}` as any)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum pedido"
          description="Nenhum pedido encontrado com esse filtro."
          actionLabel="Limpar filtro"
          onAction={() => setFilter('Todos')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[4],
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: spacing[2],
    paddingRight: spacing[4],
  },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: {
    backgroundColor: colors.neutral[900],
  },
  list: {
    gap: spacing[3],
  },
});
