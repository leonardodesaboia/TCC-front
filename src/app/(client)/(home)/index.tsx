import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
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
import { Button, Text } from '@/components/ui';
import { OrderCard, type OrderCardItem } from '@/components/client/orders/OrderCard';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
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
  const categoriesQuery = useServiceCategories();
  const notificationsQuery = useNotifications();
  const ordersQuery = useMyOrders();

  if (areasQuery.isLoading || categoriesQuery.isLoading || notificationsQuery.isLoading || ordersQuery.isLoading) {
    return <LoadingScreen message="Carregando início..." />;
  }

  if (areasQuery.isError || categoriesQuery.isError || notificationsQuery.isError || ordersQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar a tela inicial."
        onRetry={() => {
          void areasQuery.refetch();
          void categoriesQuery.refetch();
          void notificationsQuery.refetch();
          void ordersQuery.refetch();
        }}
      />
    );
  }

  const areas = (areasQuery.data ?? []).slice(0, 5);
  const categories = categoriesQuery.data ?? [];
  const unreadNotifications = (notificationsQuery.data ?? []).filter((item) => !item.readAt).length;
  const activeOrders: OrderCardItem[] = (ordersQuery.data ?? [])
    .filter((order) => [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.COMPLETED_BY_PRO].includes(order.status))
    .slice(0, 3)
    .map((order) => {
      const categoryName = categories.find((c) => c.id === order.categoryId)?.name ?? 'Serviço';
      const snapshot = order.addressSnapshot;
      return {
        id: order.id,
        categoryName,
        description: order.description,
        status: order.status,
        mode: order.mode,
        createdAt: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt)),
        address: snapshot ? `${snapshot.street}, ${snapshot.number} - ${snapshot.district}` : '',
      };
    });

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
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => router.push(`/(client)/(orders)/${order.id}` as any)}
            />
          ))}
        </View>
      ) : null}

      {/* CTA */}
      <View style={styles.ctaRow}>
        <View style={styles.ctaBtn}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/(client)/(search)')}
          >
            Agendar serviço
          </Button>
        </View>
        <View style={styles.ctaBtn}>
          <Button
            variant="secondary"
            size="lg"
            rightIcon={<Zap color={colors.primary.default} size={16} />}
            onPress={() => router.push('/(client)/(express)')}
          >
            Express
          </Button>
        </View>
      </View>
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
  ctaRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  ctaBtn: {
    flex: 1,
  },
});
