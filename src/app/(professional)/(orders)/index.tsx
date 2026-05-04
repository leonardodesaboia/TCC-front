import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardList, Clock, MapPin, Zap } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Badge, Text } from '@/components/ui';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useProfessionalOrders } from '@/lib/hooks/useProfessionalArea';
import { OrderMode, OrderStatus, type OrderSummary } from '@/types/order';
import type { ServiceCategory } from '@/types/catalog';
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

function isExpressInvitationOrder(order: OrderSummary): boolean {
  return (
    order.mode === OrderMode.EXPRESS &&
    order.status === OrderStatus.PENDING &&
    !order.professionalId &&
    !order.professionalProResponse
  );
}

function OrderCard({
  order,
  categories,
  onPress,
  highlight,
}: {
  order: OrderSummary;
  categories: ServiceCategory[];
  onPress: () => void;
  highlight?: boolean;
}) {
  const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Servico';
  const snapshot = order.addressSnapshot;
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE[OrderStatus.PENDING];
  const isExpressInvitation = isExpressInvitationOrder(order);
  const isAwaitingClientChoice =
    order.mode === OrderMode.EXPRESS &&
    order.status === OrderStatus.PENDING &&
    !order.professionalId &&
    order.professionalProResponse === 'accepted' &&
    !order.professionalClientResponse;
  const displayAmount = order.totalAmount > 0
    ? order.totalAmount
    : order.professionalProposedAmount ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlight && styles.invitationCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.categoryIcon, highlight && styles.invitationIcon]}>
          {highlight ? (
            <Zap color={colors.warning} size={20} />
          ) : (
            <Text variant="titleSm" color={colors.primary.default}>
              {categoryName.charAt(0)}
            </Text>
          )}
        </View>
        <View style={styles.topContent}>
          <View style={styles.topText}>
            <Text variant="titleSm" numberOfLines={2} style={styles.categoryTitle}>
              {categoryName}
            </Text>
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
            {isExpressInvitation ? <Badge label="Aguardando proposta" variant="default" /> : null}
            {isAwaitingClientChoice ? <Badge label="Proposta enviada" variant="info" /> : null}
          </View>
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
        {displayAmount > 0 ? (
          <Text variant="titleSm" color={colors.primary.default}>
            {formatMoney(displayAmount)}
          </Text>
        ) : highlight ? (
          <Text variant="labelLg" color={colors.warning}>
            Enviar proposta
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
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
  const showsInvitationsSection = filter === 'Todos' || filter === 'Pendente';
  const invitations = showsInvitationsSection ? orders.filter(isExpressInvitationOrder) : [];
  const otherOrders = showsInvitationsSection
    ? orders.filter((order) => !isExpressInvitationOrder(order))
    : orders;

  const isRefreshing = ordersQuery.isFetching && !ordersQuery.isLoading;

  return (
    <Screen
      edges={['top']}
      style={styles.screen}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => ordersQuery.refetch()} />
      }
    >
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
        <View style={styles.sections}>
          {invitations.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Zap color={colors.warning} size={16} />
                <Text variant="titleMd">Convites Express</Text>
                <Badge label={String(invitations.length)} variant="warning" />
              </View>
              <View style={styles.list}>
                {invitations.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    categories={categories}
                    highlight
                    onPress={() =>
                      router.push(`/(professional)/(orders)/${order.id}` as any)
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          {otherOrders.length > 0 ? (
            <View style={styles.section}>
              {showsInvitationsSection && invitations.length > 0 ? (
                <View style={styles.sectionHeader}>
                  <Text variant="titleMd">Seus pedidos</Text>
                </View>
              ) : null}
              <View style={styles.list}>
                {otherOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    categories={categories}
                    onPress={() =>
                      router.push(`/(professional)/(orders)/${order.id}` as any)
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}
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
  sections: { gap: spacing[5] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  list: { gap: spacing[3] },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  invitationCard: {
    backgroundColor: '#FFF7E6',
    borderColor: colors.warning,
  },
  invitationIcon: {
    backgroundColor: '#FFFFFF',
  },
  pressed: { backgroundColor: colors.neutral[100] },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  topContent: { flex: 1, gap: spacing[2], minWidth: 0 },
  topText: { gap: 2, minWidth: 0 },
  categoryTitle: { flexShrink: 1 },
  meta: { gap: spacing[2], paddingLeft: spacing[1] },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  bottom: { alignItems: 'flex-end' },
});
