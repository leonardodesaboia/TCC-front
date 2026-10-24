import { Badge } from '@/components/ui';
import { OrderMode } from '@/types/order';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'completed_by_pro'
  | 'completed'
  | 'cancelled'
  | 'disputed';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' }> = {
  pending: { label: 'Buscando', variant: 'warning' },
  accepted: { label: 'Aceito', variant: 'info' },
  completed_by_pro: { label: 'Aguardando confirmação', variant: 'default' },
  completed: { label: 'Concluído', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'muted' },
  disputed: { label: 'Em disputa', variant: 'error' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** No convencional o pedido já tem profissional: "pendente" é esperar a resposta dele, não buscar. */
  mode?: OrderMode;
}

export function OrderStatusBadge({ status, mode }: OrderStatusBadgeProps) {
  if (status === 'pending' && mode === OrderMode.ON_DEMAND) {
    return <Badge label="Aguardando profissional" variant="warning" />;
  }
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return <Badge label={config.label} variant={config.variant} />;
}
