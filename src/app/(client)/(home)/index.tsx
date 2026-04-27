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
import { Screen } from '@/components/layout/Screen';
import { Avatar, Badge, Text } from '@/components/ui';
import { OrderStatusBadge } from '@/components/client/orders/OrderStatusBadge';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme';

const QUICK_CATEGORIES = [
  { id: 'cat-1', name: 'Elétrica', icon: Zap, color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'cat-2', name: 'Limpeza', icon: Sparkles, color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'cat-3', name: 'Hidráulica', icon: Droplets, color: '#06B6D4', bg: '#CFFAFE' },
  { id: 'cat-4', name: 'Pintura', icon: Brush, color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'cat-5', name: 'Manutenção', icon: Wrench, color: '#EF4444', bg: '#FEE2E2' },
];

const ACTIVE_ORDERS = [
  {
    id: '1',
    categoryName: 'Eletricista',
    description: 'Trocar duas tomadas na sala',
    status: 'accepted' as const,
    professionalName: 'Carlos Mendes',
    proposalCount: 0,
  },
  {
    id: '2',
    categoryName: 'Faxina residencial',
    description: 'Limpeza geral de apartamento',
    status: 'pending' as const,
    professionalName: undefined,
    proposalCount: 3,
  },
];

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Cliente', [user?.name]);

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
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Pressable
                key={cat.id}
                onPress={() => router.push('/(client)/(search)')}
                style={({ pressed }) => [styles.categoryChip, pressed && styles.pressed]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                  <Icon color={cat.color} size={18} />
                </View>
                <Text variant="labelLg">{cat.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Active orders */}
      {ACTIVE_ORDERS.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMd">Pedidos ativos</Text>
            <Pressable onPress={() => router.push('/(client)/(orders)')}>
              <Text variant="labelLg" color={colors.primary.default}>Ver todos</Text>
            </Pressable>
          </View>

          {ACTIVE_ORDERS.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/(client)/(orders)/${order.id}` as any)}
              style={styles.orderCard}
            >
              <View style={styles.orderTop}>
                {order.professionalName ? (
                  <Avatar name={order.professionalName} size="md" />
                ) : (
                  <View style={styles.orderIconWrap}>
                    <Zap color={colors.primary.default} size={18} />
                  </View>
                )}
                <View style={styles.orderInfo}>
                  <Text variant="titleSm">{order.categoryName}</Text>
                  <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
                    {order.professionalName ?? order.description}
                  </Text>
                </View>
                <OrderStatusBadge status={order.status} />
              </View>
              {order.status === 'pending' && order.proposalCount > 0 ? (
                <View style={styles.orderFooter}>
                  <Text variant="labelLg" color={colors.primary.default}>
                    {order.proposalCount} {order.proposalCount === 1 ? 'proposta recebida' : 'propostas recebidas'}
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
