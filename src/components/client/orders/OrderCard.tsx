import { Pressable, StyleSheet, View } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { Avatar, Text } from '@/components/ui';
import { OrderStatusBadge, type OrderStatus } from './OrderStatusBadge';
import { colors, radius, spacing } from '@/theme';

export interface OrderCardItem {
  id: string;
  categoryName: string;
  description: string;
  professionalName?: string;
  status: OrderStatus;
  createdAt: string;
  address: string;
  totalAmount?: string;
  proposalCount?: number;
}

interface OrderCardProps {
  order: OrderCardItem;
  onPress?: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const showProfessional = order.professionalName && order.status !== 'pending';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        {showProfessional ? (
          <Avatar name={order.professionalName!} size="md" />
        ) : (
          <View style={styles.categoryIcon}>
            <Text variant="titleSm" color={colors.primary.default}>
              {order.categoryName.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.topText}>
          <Text variant="titleSm">{order.categoryName}</Text>
          <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
            {showProfessional ? order.professionalName : order.description}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Clock color={colors.neutral[400]} size={14} />
          <Text variant="labelLg" color={colors.neutral[600]}>
            {order.createdAt}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin color={colors.neutral[400]} size={14} />
          <Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1}>
            {order.address}
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        {order.status === 'pending' && order.proposalCount != null ? (
          <Text variant="labelLg" color={colors.primary.default}>
            {order.proposalCount} {order.proposalCount === 1 ? 'proposta' : 'propostas'}
          </Text>
        ) : order.totalAmount ? (
          <Text variant="titleSm" color={colors.primary.default}>
            {order.totalAmount}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  pressed: {
    backgroundColor: colors.neutral[100],
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  topText: {
    flex: 1,
    gap: 2,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    gap: spacing[2],
    paddingLeft: spacing[1],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  bottom: {
    alignItems: 'flex-end',
  },
});
