import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Clock,
  ShieldAlert,
  MapPin,
  MessageCircle,
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
import { useConversations } from '@/lib/hooks/useConversations';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useMyProfessionalProfile, useProfessionalOrders } from '@/lib/hooks/useProfessionalArea';
import { useAuth } from '@/providers/AuthProvider';
import { OrderMode, OrderStatus } from '@/types/order';
import { formatMoney, sortByNewest } from '@/lib/utils/formatters';
import { colors, radius, spacing } from '@/theme';

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
  const conversationsQuery = useConversations();

  if (profileQuery.isLoading || ordersQuery.isLoading || categoriesQuery.isLoading || notificationsQuery.isLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (profileQuery.isError || ordersQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar o dashboard."
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
  const unreadMessages = (conversationsQuery.data ?? []).reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0,
  );

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
    void conversationsQuery.refetch();
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
          accessibilityRole="button"
          accessibilityLabel="Notificações"
        >
          <Bell color={colors.neutral[700]} size={22} />
          {unreadNotifications > 0 ? (
            <View style={styles.badgeDot}>
              <Text variant="labelSm" color={colors.neutral[50]}>
                {unreadNotifications > 9 ? '9+' : String(unreadNotifications)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {profile && profile.verificationStatus !== 'approved' ? (
        <Pressable
          onPress={() => router.push('/(professional)/(profile)/documents' as any)}
          style={({ pressed }) => [styles.verificationBanner, pressed && styles.pressed]}
        >
          <ShieldAlert color={profile.verificationStatus === 'rejected' ? colors.error : colors.warning} size={20} />
          <View style={styles.verificationText}>
            <Text variant="titleSm">
              {profile.verificationStatus === 'rejected' ? 'Documentos recusados' : 'Conta em análise'}
            </Text>
            <Text variant="labelLg" color={colors.neutral[700]}>
              {profile.verificationStatus === 'rejected'
                ? 'Envie novos documentos para voltar a receber pedidos.'
                : 'Você só recebe pedidos depois que seus documentos forem aprovados. Toque para ver.'}
            </Text>
          </View>
          <ChevronRight color={colors.neutral[400]} size={18} />
        </Pressable>
      ) : null}

      {unreadMessages > 0 ? (
        <Pressable
          onPress={() => router.push('/(professional)/conversations' as any)}
          style={({ pressed }) => [styles.messagesCard, pressed && styles.pressed]}
        >
          <View style={styles.messagesIcon}>
            <MessageCircle color={colors.primary.default} size={20} />
          </View>
          <View style={styles.messagesText}>
            <Text variant="titleSm">
              {unreadMessages === 1 ? '1 mensagem nova' : `${unreadMessages} mensagens novas`}
            </Text>
            <Text variant="bodySm" color={colors.neutral[600]} numberOfLines={1}>
              Clientes aguardando sua resposta
            </Text>
          </View>
          <ChevronRight color={colors.neutral[400]} size={20} />
        </Pressable>
      ) : null}

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
            Concluídos
          </Text>
        </View>
      </View>

      <ExpressAvailabilityCard variant="compact" />

      {pendingDisplayOrders.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Pendentes</Text>
            <Pressable onPress={() => router.push('/(professional)/(orders)' as any)} hitSlop={8} accessibilityRole="button">
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {pendingDisplayOrders.map((order) => {
            const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Serviço';
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
                        ? [styles.invitationIcon, { backgroundColor: colors.neutral[50] }]
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
                    <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1} style={styles.metaText}>
                      {snapshot ? `${snapshot.street}, ${snapshot.number}` : 'Endereço'}
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
            <Pressable onPress={() => router.push('/(professional)/(orders)' as any)} hitSlop={8} accessibilityRole="button">
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {activeOrders.map((order) => {
            const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Serviço';
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
                    label={isWaitingClient ? 'Aguardando cliente' : 'Aceito'}
                    variant={isWaitingClient ? 'default' : 'info'}
                  />
                  <ChevronRight color={colors.neutral[400]} size={18} />
                </View>
                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <MapPin color={colors.neutral[400]} size={14} />
                    <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1} style={styles.metaText}>
                      {snapshot ? `${snapshot.street}, ${snapshot.number}` : 'Endereço'}
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
            description="Novos pedidos pendentes ou em atividade aparecerão aqui."
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  verificationText: { flex: 1, gap: spacing[1] },
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
    borderRadius: radius.lg,
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[1.5],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minWidth: 0,
    overflow: 'hidden',
  },
  // Ícone e número na primeira linha, rótulo inteiro na segunda: "Em andamento" não cabe ao lado.
  metricValue: {
    flexShrink: 0,
  },
  metricLabel: {
    width: '100%',
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
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: spacing[4],
    gap: spacing[3],
  },
  invitationIcon: {
    backgroundColor: colors.neutral[50],
  },
  pressed: { opacity: 0.85 },
  messagesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary.light,
    backgroundColor: colors.neutral[50],
  },
  messagesIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.light,
  },
  messagesText: {
    flex: 1,
    gap: 2,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  orderCategoryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { flex: 1, gap: spacing[0.5] },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  // Sem flexShrink o texto ignora o numberOfLines e passa por cima do valor ao lado.
  metaText: { flexShrink: 1 },
});
