import { Badge } from '@/components/ui';

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
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return <Badge label={config.label} variant={config.variant} />;
}
