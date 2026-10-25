import { OrderStatus } from '@/types/order';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted';

/** Rótulos de status na área do profissional. Fonte única para lista e detalhe do pedido. */
export const PROFESSIONAL_ORDER_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  [OrderStatus.PENDING]: { label: 'Pendente', variant: 'warning' },
  [OrderStatus.ACCEPTED]: { label: 'Aceito', variant: 'info' },
  [OrderStatus.COMPLETED_BY_PRO]: { label: 'Aguardando cliente', variant: 'default' },
  [OrderStatus.COMPLETED]: { label: 'Concluído', variant: 'success' },
  [OrderStatus.CANCELLED]: { label: 'Cancelado', variant: 'muted' },
  [OrderStatus.DISPUTED]: { label: 'Em disputa', variant: 'error' },
};
