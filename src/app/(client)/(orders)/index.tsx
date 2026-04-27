import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { OrderCard, type MockOrder } from '@/components/client/orders/OrderCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { OrderStatus } from '@/components/client/orders/OrderStatusBadge';
import { colors, radius, spacing } from '@/theme';

const FILTERS = ['Todos', 'Buscando', 'Aceito', 'Aguardando', 'Concluído', 'Cancelado'];

const STATUS_MAP: Record<string, OrderStatus | undefined> = {
  Todos: undefined,
  Buscando: 'pending',
  Aceito: 'accepted',
  Aguardando: 'completed_by_pro',
  Concluído: 'completed',
  Cancelado: 'cancelled',
};

const ORDERS: MockOrder[] = [
  {
    id: '1',
    categoryName: 'Eletricista',
    description: 'Trocar duas tomadas na sala e instalar uma nova na cozinha',
    professionalName: 'Carlos Mendes',
    status: 'accepted',
    createdAt: 'Hoje, 10:30',
    address: 'Rua das Flores, 123 - Centro',
    totalAmount: 'R$ 150,00',
  },
  {
    id: '2',
    categoryName: 'Faxina residencial',
    description: 'Limpeza geral de apartamento 3 quartos',
    status: 'pending',
    createdAt: 'Hoje, 09:15',
    address: 'Av. Santos Dumont, 1500 - Aldeota',
    proposalCount: 3,
  },
  {
    id: '3',
    categoryName: 'Encanador',
    description: 'Torneira da cozinha vazando, preciso de reparo urgente',
    professionalName: 'Pedro Henrique',
    status: 'completed_by_pro',
    createdAt: 'Ontem, 14:00',
    address: 'Rua Canuto de Aguiar, 88 - Meireles',
    totalAmount: 'R$ 120,00',
  },
  {
    id: '4',
    categoryName: 'Pintura interna',
    description: 'Pintar sala e dois quartos, cor branca',
    professionalName: 'Roberto Souza',
    status: 'completed',
    createdAt: '22/04, 08:00',
    address: 'Rua Tibúrcio Cavalcante, 45 - Dionísio Torres',
    totalAmount: 'R$ 800,00',
  },
  {
    id: '5',
    categoryName: 'Montagem de móveis',
    description: 'Montar guarda-roupa e cômoda do quarto',
    status: 'cancelled',
    createdAt: '20/04, 14:00',
    address: 'Rua Joaquim Nabuco, 302 - Aldeota',
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Todos');

  const filtered = ORDERS.filter((o) => {
    const target = STATUS_MAP[filter];
    return !target || o.status === target;
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
