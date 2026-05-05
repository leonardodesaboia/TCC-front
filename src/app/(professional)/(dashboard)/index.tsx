import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Clock,
  MapPin,
  Star,
  Zap,
} from 'lucide-react-native';
import { ExpressAvailabilityCard } from '@/components/availability/ExpressAvailabilityCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Badge, Text } from '@/components/ui';
import { getCategoryVisual } from '@/lib/catalog/category-visuals';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useMyProfessionalProfile, useProfessionalOrders } from '@/lib/hooks/useProfessionalArea';
import { useAuth } from '@/providers/AuthProvider';
import { OrderMode, OrderStatus } from '@/types/order';
import { colors, radius, spacing } from '@/theme';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function sortByNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt));
}

export default function ProfessionalDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Profissional', [user?.name]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);
  const profileQuery = useMyProfessionalProfile();
  const ordersQuery = useProfessionalOrders();
  const categoriesQuery = useServiceCategories();
  const notificationsQuery = useNotifications();

  if (profileQuery.isLoading || ordersQuery.isLoading || categoriesQuery.isLoading || notificationsQuery.isLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (profileQuery.isError || ordersQuery.isError) {
    return (
      <ErrorState
        message="Nao foi possivel carregar o dashboard."
        onRetry={() => {
          void profileQuery.refetch();
          void ordersQuery.refetch();
          void categoriesQuery.refetch();
          void notificationsQuery.refetch();
        }}
      />
    );
  }

  const profile = profileQuery.data;
  const allOrders = ordersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const unreadNotifications = (notificationsQuery.data ?? []).filter((n) => !n.readAt).length;

  const pendingOrders = sortByNewest(allOrders.filter((o) => o.status === OrderStatus.PENDING));
  const pendingDisplayOrders = pendingOrders;
  const activeOrders = sortByNewest(
    allOrders.filter((o) => [OrderStatus.ACCEPTED, OrderStatus.COMPLETED_BY_PRO].includes(o.status)),
  );
  const completedOrders = allOrders.filter((o) => o.status === OrderStatus.COMPLETED);
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const isRefreshing =
    (ordersQuery.isFetching && !ordersQuery.isLoading) ||
    (notificationsQuery.isFetching && !notificationsQuery.isLoading);

  function handleRefresh() {
    void ordersQuery.refetch();
    void notificationsQuery.refetch();
    void profileQuery.refetch();
  }

  return (
    <Screen
      edges={['top']}
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.greeting}>
        <View style={styles.greetingLeft}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            {greeting}, {firstName}
          </Text>
          <Text variant="displaySm">Seu painel</Text>
          {profile && profile.reviewCount > 0 ? (
            <View style={styles.ratingRow}>
              <Star color={colors.warning} fill={colors.warning} size={14} />
              <Text variant="bodySm" color={colors.neutral[500]}>
                {profile.averageRating.toFixed(1)} ({profile.reviewCount})
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.push('/(professional)/notifications' as any)}
          style={styles.bellBtn}
          hitSlop={8}
        >
          <Bell color={colors.neutral[700]} size={22} />
          {unreadNotifications > 0 ? (
            <View style={styles.badgeDot}>
              <Text variant="labelSm" color="#FFFFFF">
                {unreadNotifications > 9 ? '9+' : String(unreadNotifications)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricChip}>
          <Zap color={colors.primary.default} size={14} />
          <Text variant="titleSm" style={styles.metricValue}>
            {activeOrders.length}
          </Text>
          <Text variant="labelSm" color={colors.neutral[500]} style={styles.metricLabel}>
            Ativos
          </Text>
        </View>
        <View style={styles.metricChip}>
          <Clock color={colors.warning} size={14} />
          <Text variant="titleSm" style={styles.metricValue}>
            {pendingOrders.length}
          </Text>
          <Text variant="labelSm" color={colors.neutral[500]} style={styles.metricLabel}>
            Pendentes
          </Text>
        </View>
        <View style={styles.metricChip}>
          <Clock color={colors.success} size={14} />
          <Text
            variant="titleSm"
            style={styles.metricValue}
          >
            {completedOrders.length}
          </Text>
          <Text variant="labelSm" color={colors.neutral[500]} style={styles.metricLabel}>
            Concluidos
          </Text>
        </View>
      </View>

      <ExpressAvailabilityCard variant="compact" />

      {pendingDisplayOrders.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Pendentes</Text>
            <Pressable onPress={() => router.push('/(professional)/(orders)' as any)}>
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {pendingDisplayOrders.map((order) => {
            const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Servico';
            const snapshot = order.addressSnapshot;
            const categoryVisual = getCategoryVisual(categoryName);
            const CategoryIcon = categoryVisual.Icon;
            const isExpressInvitation =
              order.mode === OrderMode.EXPRESS &&
              !order.professionalId &&
              !order.professionalProResponse;
            const isAwaitingClientChoice =
              order.mode === OrderMode.EXPRESS &&
              !order.professionalId &&
              order.professionalProResponse === 'accepted' &&
              !order.professionalClientResponse;
            const isExpressPending = order.mode === OrderMode.EXPRESS;
            const displayAmount = order.totalAmount > 0
              ? order.totalAmount
              : order.professionalProposedAmount ?? 0;
            const badgeLabel = isExpressInvitation
              ? 'Novo'
              : isAwaitingClientChoice
                ? 'Proposta enviada'
                : isExpressPending
                  ? 'Express'
                  : 'Pendente';
            const badgeVariant = isExpressInvitation
              ? 'warning'
              : isAwaitingClientChoice
                ? 'info'
                : isExpressPending
                  ? 'info'
                  : 'warning';
            const helperText = isExpressInvitation
              ? 'Enviar proposta'
              : isAwaitingClientChoice
                ? 'Aguardando escolha do cliente'
                : isExpressPending
                  ? 'Pedido Express pendente'
                  : 'Aguardando resposta';

            return (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/(professional)/(orders)/${order.id}` as any)}
                style={({ pressed }) => [
                  isExpressInvitation ? styles.invitationCard : styles.orderCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.orderTop}>
                  <View
                    style={[
                      styles.orderCategoryIcon,
                      isExpressInvitation
                        ? [styles.invitationIcon, { backgroundColor: '#FFFFFF' }]
                        : { backgroundColor: categoryVisual.bgColor },
                    ]}
                  >
                    <CategoryIcon color={categoryVisual.color} size={18} />
                  </View>
                  <View style={styles.orderText}>
                    <Text variant="titleSm">{categoryName}</Text>
                    <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                      {order.description}
                    </Text>
                  </View>
                  <Badge label={badgeLabel} variant={badgeVariant} />
                  <ChevronRight color={colors.neutral[400]} size={18} />
                </View>
                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <MapPin color={colors.neutral[400]} size={14} />
                    <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1}>
                      {snapshot ? `${snapshot.street}, ${snapshot.number}` : 'Endereco'}
                    </Text>
                  </View>
                  {displayAmount > 0 ? (
                    <Text variant="titleSm" color={colors.primary.default}>
                      {formatMoney(displayAmount)}
                    </Text>
                  ) : (
                    <Text
                      variant="labelLg"
                      color={isExpressInvitation ? colors.warning : colors.neutral[500]}
                    >
                      {helperText}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {activeOrders.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Em atividade</Text>
            <Pressable onPress={() => router.push('/(professional)/(orders)' as any)}>
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {activeOrders.map((order) => {
            const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Servico';
            const snapshot = order.addressSnapshot;
            const categoryVisual = getCategoryVisual(categoryName);
            const CategoryIcon = categoryVisual.Icon;
            const isWaitingClient = order.status === OrderStatus.COMPLETED_BY_PRO;

            return (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/(professional)/(orders)/${order.id}` as any)}
                style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}
              >
                <View style={styles.orderTop}>
                  <View style={[styles.orderCategoryIcon, { backgroundColor: categoryVisual.bgColor }]}>
                    <CategoryIcon color={categoryVisual.color} size={18} />
                  </View>
                  <View style={styles.orderText}>
                    <Text variant="titleSm">{categoryName}</Text>
                    <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                      {order.description}
                    </Text>
                  </View>
                  <Badge
                    label={isWaitingClient ? 'Aguardando cliente' : 'Em andamento'}
                    variant={isWaitingClient ? 'default' : 'info'}
                  />
                  <ChevronRight color={colors.neutral[400]} size={18} />
                </View>
                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <MapPin color={colors.neutral[400]} size={14} />
                    <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1}>
                      {snapshot ? `${snapshot.street}, ${snapshot.number}` : 'Endereco'}
                    </Text>
                  </View>
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
      ) : null}

      {pendingDisplayOrders.length === 0 && activeOrders.length === 0 ? (
        <View style={styles.section}>
          <Text variant="titleMd">Pedidos</Text>
          <EmptyState
            icon={ClipboardList}
            title="Nenhum pedido em aberto"
            description="Novos pedidos pendentes ou em atividade aparecerao aqui."
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing[6] },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingLeft: {
    flex: 1,
    gap: spacing[1],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  metricChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minWidth: 0,
    overflow: 'hidden',
  },
  metricValue: {
    flexShrink: 1,
    minWidth: 0,
  },
  metricLabel: {
    flexShrink: 0,
  },
  section: { gap: spacing[3] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  orderCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  invitationCard: {
    borderRadius: radius.xl,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: spacing[4],
    gap: spacing[3],
  },
  invitationIcon: {
    backgroundColor: '#FFFFFF',
  },
  pressed: { opacity: 0.85 },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  orderCategoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { flex: 1, gap: 2 },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
});
