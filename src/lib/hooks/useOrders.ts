import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type { CreateOrderRequestDto, OrderFiltersDto } from '@/types/order';

export function useMyOrders(params: OrderFiltersDto = {}) {
  return useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => clientIntegration.orders.getMyOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => clientIntegration.orders.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderRequestDto) => clientIntegration.orders.create(payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido enviado!', 'O profissional será notificado');
      router.push(`/(client)/(orders)/${order.id}`);
    },
    onError: (error: unknown) => {
      toast.error('Erro ao criar pedido', getApiErrorMessage(error));
    },
  });
}
