import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Bell,
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  MapPin,
  Star,
} from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Badge, Text } from '@/components/ui';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useMyProfessionalProfile, useProfessionalOrders } from '@/lib/hooks/useProfessionalArea';
import { useAuth } from '@/providers/AuthProvider';
import { OrderStatus } from '@/types/order';
import { colors, radius, spacing } from '@/theme';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function StatCard({ icon: Icon, label, value, iconColor }: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  iconColor?: string;
}) {
  const color = iconColor ?? colors.primary.default;
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={18} />
      </View>
      <Text variant="titleLg">{value}</Text>
      <Text variant="labelLg" color={colors.neutral[500]}>{label}</Text>
    </View>
  );
}

export default function ProfessionalDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Profissional', [user?.name]);
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

  const pendingOrders = allOrders.filter((o) => o.status === OrderStatus.PENDING);
  const activeOrders = allOrders.filter((o) => o.status === OrderStatus.ACCEPTED);
  const completedOrders = allOrders.filter((o) => o.status === OrderStatus.COMPLETED);
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <Screen edges={['top']} style={styles.screen}>
      {/* Greeting */}
      <View style={styles.greeting}>
        <View style={styles.greetingLeft}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            Ola, {firstName}
          </Text>
          <Text variant="displaySm">Seu painel</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(professional)/(orders)' as any)}
          style={styles.bellBtn}
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

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon={Clock} label="Pendentes" value={pendingOrders.length} iconColor={colors.warning} />
        <StatCard icon={CheckCircle} label="Concluidos" value={completedOrders.length} iconColor={colors.success} />
        <StatCard icon={DollarSign} label="Ganhos" value={formatMoney(totalEarnings)} iconColor={colors.success} />
      </View>

      {/* Rating */}
      {profile ? (
        <View style={styles.ratingCard}>
          <Star color={colors.warning} fill={colors.warning} size={18} />
          <Text variant="titleSm">{profile.averageRating.toFixed(1)}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>
            ({profile.reviewCount} {profile.reviewCount === 1 ? 'avaliacao' : 'avaliacoes'})
          </Text>
        </View>
      ) : null}

      {/* Pending orders */}
      {pendingOrders.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Pedidos pendentes</Text>
            <Pressable onPress={() => router.push('/(professional)/(orders)' as any)}>
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {pendingOrders.slice(0, 3).map((order) => {
            const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Servico';
            const snapshot = order.addressSnapshot;
            return (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/(professional)/(orders)/${order.id}` as any)}
                style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}
              >
                <View style={styles.orderTop}>
                  <View style={styles.orderCategoryIcon}>
                    <Text variant="titleSm" color={colors.primary.default}>
                      {categoryName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.orderText}>
                    <Text variant="titleSm">{categoryName}</Text>
                    <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                      {order.description}
                    </Text>
                  </View>
                  <Badge label="Novo" variant="warning" />
                </View>
                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <MapPin color={colors.neutral[400]} size={14} />
                    <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1}>
                      {snapshot ? `${snapshot.street}, ${snapshot.number}` : 'Endereco'}
                    </Text>
                  </View>
                  <Text variant="titleSm" color={colors.primary.default}>
                    {formatMoney(order.totalAmount)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.section}>
          <Text variant="titleMd">Pedidos pendentes</Text>
          <EmptyState
            icon={ClipboardList}
            title="Nenhum pedido pendente"
            description="Novos pedidos Express aparecerao aqui quando clientes proximos solicitarem servicos."
          />
        </View>
      )}

      {/* Active orders */}
      {activeOrders.length > 0 ? (
        <Pressable
          onPress={() => router.push('/(professional)/(orders)' as any)}
          style={styles.ctaCard}
        >
          <View style={styles.ctaContent}>
            <Text variant="titleSm" color="#FFFFFF">
              {activeOrders.length} {activeOrders.length === 1 ? 'pedido ativo' : 'pedidos ativos'}
            </Text>
            <Text variant="labelLg" color="rgba(255,255,255,0.8)">
              Acompanhe seus servicos em andamento
            </Text>
          </View>
          <ArrowRight color="#FFFFFF" size={20} />
        </Pressable>
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
  greetingLeft: { flex: 1, gap: spacing[1] },
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  section: { gap: spacing[3] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  pressed: { backgroundColor: colors.neutral[100] },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  orderCategoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
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
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.primary.default,
    borderRadius: radius.xl,
    padding: spacing[4],
  },
  ctaContent: { flex: 1, gap: spacing[1] },
});
