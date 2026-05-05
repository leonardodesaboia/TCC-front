import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Brush,
  CheckCircle2,
  ChevronRight,
  Droplets,
  MessageCircle,
  Repeat,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Avatar, Button, Text } from '@/components/ui';
import { OrderCard, type OrderCardItem } from '@/components/client/orders/OrderCard';
import {
  FeaturedProfessionals,
  type FeaturedProfessional,
} from '@/components/client/home/FeaturedProfessionals';
import { getAreaVisual } from '@/lib/catalog/area-visuals';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { useConversations } from '@/lib/hooks/useConversations';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useMyOrders } from '@/lib/hooks/useOrders';
import { useProfessional, useSearchProfessionals } from '@/lib/hooks/useProfessionals';
import { useAuth } from '@/providers/AuthProvider';
import { OrderStatus } from '@/types/order';
import { colors, radius, spacing } from '@/theme';

function sortByNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt));
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Cliente', [user?.name]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);
  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();
  const notificationsQuery = useNotifications();
  const ordersQuery = useMyOrders();
  const conversationsQuery = useConversations();
  const featuredQuery = useSearchProfessionals({ limit: 8 });

  const lastCompletedProId = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const lastCompleted = orders
      .filter((o) => o.status === OrderStatus.COMPLETED && !!o.professionalId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    return lastCompleted?.professionalId ?? '';
  }, [ordersQuery.data]);

  const lastProQuery = useProfessional(lastCompletedProId);

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

  const areas = areasQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const lastPro = lastProQuery.data;
  const featuredPros: FeaturedProfessional[] = (featuredQuery.data ?? [])
    .filter((p) => p.id !== lastPro?.id)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      profession: p.profession,
      highlight: p.specialties[0] ?? '',
      rating: (p.rating ?? 0).toFixed(1),
      badge: p.badgeLabel ?? '',
    }));
  const unreadNotifications = (notificationsQuery.data ?? []).filter((item) => !item.readAt).length;
  const unreadMessages = (conversationsQuery.data ?? []).reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0,
  );
  const pendingConfirmations = sortByNewest(
    (ordersQuery.data ?? []).filter((o) => o.status === OrderStatus.COMPLETED_BY_PRO),
  );
  const activeOrders: OrderCardItem[] = sortByNewest(
    (ordersQuery.data ?? []).filter((order) =>
      [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.COMPLETED_BY_PRO].includes(order.status),
    ),
  )
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
            {greeting}, {firstName}
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

      {/* Pending client confirmation */}
      {pendingConfirmations.length > 0 ? (
        <Pressable
          onPress={() =>
            router.push(`/(client)/(orders)/${pendingConfirmations[0].id}` as never)
          }
          style={({ pressed }) => [styles.alertCard, pressed && styles.pressed]}
        >
          <View style={styles.alertIcon}>
            <CheckCircle2 color={colors.success} size={20} />
          </View>
          <View style={styles.alertText}>
            <Text variant="titleSm">
              {pendingConfirmations.length === 1
                ? 'Confirme a conclusão do serviço'
                : `${pendingConfirmations.length} serviços aguardando confirmação`}
            </Text>
            <Text variant="bodySm" color={colors.neutral[600]} numberOfLines={2}>
              O profissional marcou como concluído. Confirme para finalizar.
            </Text>
          </View>
          <ChevronRight color={colors.neutral[400]} size={20} />
        </Pressable>
      ) : null}

      {/* Unread messages */}
      {unreadMessages > 0 ? (
        <Pressable
          onPress={() => router.push('/(client)/conversations')}
          style={({ pressed }) => [styles.messagesCard, pressed && styles.pressed]}
        >
          <View style={styles.messagesIcon}>
            <MessageCircle color={colors.primary.default} size={20} />
          </View>
          <View style={styles.alertText}>
            <Text variant="titleSm">
              {unreadMessages === 1 ? '1 mensagem nova' : `${unreadMessages} mensagens novas`}
            </Text>
            <Text variant="bodySm" color={colors.neutral[600]} numberOfLines={1}>
              Profissionais aguardando sua resposta
            </Text>
          </View>
          <ChevronRight color={colors.neutral[400]} size={20} />
        </Pressable>
      ) : null}

      {/* Quick categories */}
      <View style={styles.section}>
        <Text variant="titleMd">Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {areas.map((area) => {
            const visual = getAreaVisual(area.name);
            const Icon = visual.Icon;
            return (
              <Pressable
                key={area.id}
                onPress={() =>
                  router.push({
                    pathname: '/(client)/(search)',
                    params: { areaId: area.id },
                  })
                }
                style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
              >
                <View style={[styles.categoryIconLg, { backgroundColor: visual.bgColor }]}>
                  <Icon color={visual.color} size={24} />
                </View>
                <Text variant="labelLg" style={styles.categoryLabel} numberOfLines={1}>
                  {area.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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

      {/* Repeat last completed order */}
      {lastPro ? (
        <View style={styles.section}>
          <Text variant="titleMd">Pedir de novo</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(client)/(search)/professionals/[id]',
                params: { id: lastPro.id },
              } as never)
            }
            style={({ pressed }) => [styles.repeatCard, pressed && styles.pressed]}
          >
            <Avatar name={lastPro.name} size="md" />
            <View style={styles.repeatText}>
              <Text variant="titleSm" numberOfLines={1}>{lastPro.name}</Text>
              <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                {lastPro.profession}
              </Text>
            </View>
            <View style={styles.repeatAction}>
              <Repeat color={colors.primary.default} size={16} />
              <Text variant="labelLg" color={colors.primary.default}>Pedir</Text>
            </View>
          </Pressable>
        </View>
      ) : null}

      {/* Featured professionals */}
      {featuredPros.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Profissionais em destaque</Text>
            <Pressable onPress={() => router.push('/(client)/(search)')}>
              <Text variant="labelLg" color={colors.primary.default}>Ver mais</Text>
            </Pressable>
          </View>
          <FeaturedProfessionals
            professionals={featuredPros}
            onPressProfessional={(id) =>
              router.push({
                pathname: '/(client)/(search)/professionals/[id]',
                params: { id },
              } as never)
            }
          />
        </View>
      ) : null}

      {/* Express explainer */}
      <Pressable
        onPress={() => router.push('/(client)/(express)')}
        style={({ pressed }) => [styles.expressBanner, pressed && styles.pressed]}
      >
        <View style={styles.expressIcon}>
          <Zap color={colors.warning} fill={colors.warning} size={20} />
        </View>
        <View style={styles.expressText}>
          <Text variant="titleSm">Precisa agora? Use o Express</Text>
          <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={2}>
            Vários profissionais por perto respondem em minutos
          </Text>
        </View>
        <ChevronRight color={colors.neutral[400]} size={20} />
      </Pressable>

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
  categoriesScroll: {
    gap: spacing[3],
    paddingRight: spacing[2],
  },
  categoryCard: {
    width: 92,
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  categoryIconLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    textAlign: 'center',
  },
  pressed: { opacity: 0.7 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
  },
  alertText: {
    flex: 1,
    gap: 2,
  },
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
  repeatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  repeatText: {
    flex: 1,
    gap: 2,
  },
  repeatAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    backgroundColor: colors.primary.light,
  },
  expressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
  },
  expressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  expressText: {
    flex: 1,
    gap: 2,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  ctaBtn: {
    flex: 1,
  },
});
