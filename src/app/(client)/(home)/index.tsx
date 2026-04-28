import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Bell,
  Brush,
  Droplets,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Avatar, Badge, Text } from '@/components/ui';
import { OrderStatusBadge } from '@/components/client/orders/OrderStatusBadge';
import { useServiceAreas } from '@/lib/hooks/useCatalog';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useMyOrders } from '@/lib/hooks/useOrders';
import { useAuth } from '@/providers/AuthProvider';
import { OrderStatus } from '@/types/order';
import { colors, radius, spacing } from '@/theme';

const AREA_ICON_MAP = {
  elétrica: { icon: Zap, color: '#F59E0B', bg: '#FEF3C7' },
  limpeza: { icon: Sparkles, color: '#3B82F6', bg: '#DBEAFE' },
  hidráulica: { icon: Droplets, color: '#06B6D4', bg: '#CFFAFE' },
  pintura: { icon: Brush, color: '#8B5CF6', bg: '#EDE9FE' },
  manutenção: { icon: Wrench, color: '#EF4444', bg: '#FEE2E2' },
} as const;

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Cliente', [user?.name]);
  const areasQuery = useServiceAreas();
  const notificationsQuery = useNotifications();
  const ordersQuery = useMyOrders();

  if (areasQuery.isLoading || notificationsQuery.isLoading || ordersQuery.isLoading) {
    return <LoadingScreen message="Carregando início..." />;
  }

  if (areasQuery.isError || notificationsQuery.isError || ordersQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar a tela inicial."
        onRetry={() => {
          void areasQuery.refetch();
          void notificationsQuery.refetch();
          void ordersQuery.refetch();
        }}
      />
    );
  }

  const areas = (areasQuery.data ?? []).slice(0, 5);
  const unreadNotifications = (notificationsQuery.data ?? []).filter((item) => !item.readAt).length;
  const activeOrders = (ordersQuery.data ?? [])
    .filter((order) => [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.COMPLETED_BY_PRO].includes(order.status))
    .slice(0, 3);

  return (
    <Screen edges={['top']} style={styles.screen}>
      {/* Greeting */}
      <View style={styles.greeting}>
        <View style={styles.greetingLeft}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            Olá, {firstName}
          </Text>
          <Text variant="displaySm">O que precisa hoje?</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(client)/(home)/notifications')}
          style={styles.bellBtn}
        >
          <Bell color={colors.neutral[700]} size={22} />
          {unreadNotifications > 0 ? (
            <View style={styles.badgeDot}>
              <Text variant="labelSm" color="#FFFFFF">{unreadNotifications > 9 ? '9+' : String(unreadNotifications)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Quick search */}
      <Pressable
        onPress={() => router.push('/(client)/(search)')}
        style={styles.searchBar}
      >
        <Search color={colors.neutral[400]} size={20} />
        <Text variant="bodySm" color={colors.neutral[400]}>
          Buscar serviço...
        </Text>
      </Pressable>

      {/* Quick categories */}
      <View style={styles.section}>
        <Text variant="titleMd">Categorias</Text>
        <View style={styles.categoriesGrid}>
          {areas.map((area) => {
            const visual = AREA_ICON_MAP[area.name.toLowerCase() as keyof typeof AREA_ICON_MAP];
            const Icon = visual?.icon ?? Zap;
            return (
              <Pressable
                key={area.id}
                onPress={() => router.push('/(client)/(search)')}
                style={({ pressed }) => [styles.categoryChip, pressed && styles.pressed]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: visual?.bg ?? colors.primary.light }]}>
                  <Icon color={visual?.color ?? colors.primary.default} size={18} />
                </View>
                <Text variant="labelLg">{area.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Active orders */}
      {activeOrders.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Pedidos ativos</Text>
            <Pressable onPress={() => router.push('/(client)/(orders)')}>
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {activeOrders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/(client)/(orders)/${order.id}` as any)}
              style={styles.orderCard}
            >
              <View style={styles.orderTop}>
                {order.professionalId ? (
                  <Avatar name="Profissional" size="md" />
                ) : (
                  <View style={styles.orderIconWrap}>
                    <Zap color={colors.primary.default} size={18} />
                  </View>
                )}
                <View style={styles.orderInfo}>
                  <Text variant="titleSm">{order.description.slice(0, 28) || 'Pedido'}</Text>
                  <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                    {order.professionalId ? 'Profissional definido' : order.description}
                  </Text>
                </View>
                <OrderStatusBadge status={order.status} />
              </View>
              {order.status === OrderStatus.PENDING ? (
                <View style={styles.orderFooter}>
                  <Text variant="labelLg" color={colors.primary.default}>
                    Acompanhe propostas no detalhe do pedido
                  </Text>
                  <ArrowRight color={colors.primary.default} size={16} />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* CTA */}
      <Pressable
        onPress={() => router.push('/(client)/(search)')}
        style={styles.ctaCard}
      >
        <View style={styles.ctaContent}>
          <Text variant="titleSm" color="#FFFFFF">Precisa de algo?</Text>
          <Text variant="labelLg" color="rgba(255,255,255,0.8)">
            Crie um pedido Express e receba propostas de profissionais próximos
          </Text>
        </View>
        <ArrowRight color="#FFFFFF" size={20} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[6],
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingLeft: {
    flex: 1,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
  },
  section: {
    gap: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  orderCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    gap: spacing[3],
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  orderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: {
    flex: 1,
    gap: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[1],
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.primary.default,
    borderRadius: radius.xl,
    padding: spacing[4],
  },
  ctaContent: {
    flex: 1,
    gap: spacing[1],
  },
});
