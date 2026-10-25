import { View } from 'react-native';
import { Text } from '@/components/ui';
import { PROFESSIONAL_ORDER_STATUS_BADGE } from '@/lib/constants/order-status';
import { formatDateTime } from '@/lib/utils/formatters';
import { OrderMode, type OrderSummary } from '@/types/order';
import { useServiceCategories } from '@/lib/hooks/useCatalog';
import { colors, spacing } from '@/theme';

/** Keep the order identifier visible even when extra context cannot be loaded. */
export function ConversationOrderInfo({ orderId, order }: { orderId: string; order?: OrderSummary }) {
  const categories = useServiceCategories();
  const serviceName = order?.serviceName || categories.data?.find((item) => item.id === order?.categoryId)?.name || 'Pedido';
  const status = order && PROFESSIONAL_ORDER_STATUS_BADGE[order.status]?.label;
  return (
    <View style={{ gap: spacing[1] }}>
      <Text variant="labelLg" color={colors.neutral[700]}>{serviceName} · #{orderId.slice(0, 8)}</Text>
      {order ? <Text variant="bodySm" color={colors.neutral[600]}>{order.mode === OrderMode.EXPRESS ? 'Express' : order.mode === OrderMode.ON_DEMAND ? 'Agendado' : 'Pedido'}{status ? ` · ${status}` : ''}</Text> : null}
      {order?.description ? <Text variant="bodySm" color={colors.neutral[700]} numberOfLines={2}>{order.description}</Text> : null}
      {order?.scheduledAt || order?.createdAt ? <Text variant="bodySm" color={colors.neutral[600]}>{order.scheduledAt ? 'Agendado para' : 'Criado em'} {formatDateTime(order.scheduledAt || order.createdAt)}</Text> : null}
    </View>
  );
}
