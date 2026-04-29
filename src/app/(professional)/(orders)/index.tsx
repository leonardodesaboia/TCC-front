import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardList, Clock, MapPin } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Badge, Text } from '@/components/ui';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useProfessionalOrders } from '@/lib/hooks/useProfessionalArea';
import { OrderMode, OrderStatus } from '@/types/order';
import { colors, radius, spacing } from '@/theme';

const FILTERS = ['Todos', 'Pendente', 'Aceito', 'Aguardando', 'Concluido', 'Cancelado'];

const STATUS_MAP: Record<string, OrderStatus | undefined> = {
  Todos: undefined,
  Pendente: OrderStatus.PENDING,
  Aceito: OrderStatus.ACCEPTED,
  Aguardando: OrderStatus.COMPLETED_BY_PRO,
  Concluido: OrderStatus.COMPLETED,
  Cancelado: OrderStatus.CANCELLED,
};

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' }> = {
  [OrderStatus.PENDING]: { label: 'Pendente', variant: 'warning' },
  [OrderStatus.ACCEPTED]: { label: 'Aceito', variant: 'info' },
  [OrderStatus.COMPLETED_BY_PRO]: { label: 'Aguardando', variant: 'default' },
  [OrderStatus.COMPLETED]: { label: 'Concluido', variant: 'success' },
  [OrderStatus.CANCELLED]: { label: 'Cancelado', variant: 'muted' },
  [OrderStatus.DISPUTED]: { label: 'Em disputa', variant: 'error' },
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

export default function ProfessionalOrdersScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Todos');
  const ordersQuery = useProfessionalOrders({ status: STATUS_MAP[filter] });
  const categoriesQuery = useServiceCategories();

  if (ordersQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando pedidos..." />;
  }

  if (ordersQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        message="Nao foi possivel carregar seus pedidos."
        onRetry={() => {
          void ordersQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  const categories = categoriesQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

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

      {orders.length > 0 ? (
        <View style={styles.list}>
          {orders.map((order) => {
            const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Servico';
            const snapshot = order.addressSnapshot;
            const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE[OrderStatus.PENDING];

            return (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/(professional)/(orders)/${order.id}` as any)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.top}>
                  <View style={styles.categoryIcon}>
                    <Text variant="titleSm" color={colors.primary.default}>
                      {categoryName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.topText}>
                    <Text variant="titleSm">{categoryName}</Text>
                    <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                      {order.description}
                    </Text>
                  </View>
                  <View style={styles.badgesRow}>
                    <Badge label={badge.label} variant={badge.variant} />
                    {order.mode === OrderMode.ON_DEMAND ? (
                      <Badge label="Sob demanda" variant="info" />
                    ) : order.mode === OrderMode.EXPRESS ? (
                      <Badge label="Express" variant="warning" />
                    ) : null}
                  </View>
                </View>

                <View style={styles.meta}>
                  <View style={styles.metaItem}>
                    <Clock color={colors.neutral[400]} size={14} />
                    <Text variant="labelLg" color={colors.neutral[600]}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin color={colors.neutral[400]} size={14} />
                    <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1}>
                      {snapshot ? `${snapshot.street}, ${snapshot.number} - ${snapshot.district}` : 'Endereco'}
                    </Text>
                  </View>
                </View>

                <View style={styles.bottom}>
                  {order.totalAmount > 0 ? (
                    <Text variant="titleSm" color={colors.primary.default}>
                      {formatMoney(order.totalAmount)}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
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
  screen: { gap: spacing[4] },
  filtersScroll: { flexGrow: 0 },
  filters: { gap: spacing[2], paddingRight: spacing[4] },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: { backgroundColor: colors.neutral[900] },
  badgesRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  list: { gap: spacing[3] },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  pressed: { backgroundColor: colors.neutral[100] },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, gap: 2 },
  meta: { gap: spacing[2], paddingLeft: spacing[1] },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  bottom: { alignItems: 'flex-end' },
});
