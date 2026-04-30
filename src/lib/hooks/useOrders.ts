import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import { OrderStatus, type CreateOnDemandOrderRequestDto, type CreateOrderRequestDto, type OrderDetails, type OrderFiltersDto } from '@/types/order';

const ACTIVE_ORDER_POLL_MS = 5000;

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
    refetchInterval: (query) => {
      const order = query.state.data as OrderDetails | undefined;
      if (!order) return ACTIVE_ORDER_POLL_MS;
      return order.status === OrderStatus.PENDING || order.status === OrderStatus.ACCEPTED
        ? ACTIVE_ORDER_POLL_MS
        : false;
    },
  });
}

export function useOrderProposals(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.proposals(id),
    queryFn: () => clientIntegration.orders.getExpressProposals(id),
    enabled: enabled && !!id,
    refetchInterval: enabled ? ACTIVE_ORDER_POLL_MS : false,
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

export function useCreateOnDemandOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOnDemandOrderRequestDto) => clientIntegration.orders.createOnDemand(payload),
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

export function useChooseOrderProposal(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professionalId: string) =>
      clientIntegration.orders.chooseProposal(orderId, professionalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.proposals(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Proposta aceita!', 'O chat será liberado quando o backend concluir a transição.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao aceitar proposta', getApiErrorMessage(error));
    },
  });
}

export function useCancelOrder(orderId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => clientIntegration.orders.cancel(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido cancelado.');
      router.replace('/(client)/(orders)');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao cancelar pedido', getApiErrorMessage(error));
    },
  });
}

export function useConfirmOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clientIntegration.orders.confirm(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido confirmado.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao confirmar pedido', getApiErrorMessage(error));
    },
  });
}

export function useUploadOrderPhoto(orderId: string) {
  return useMutation({
    mutationFn: (formData: FormData) => clientIntegration.orders.uploadPhoto(orderId, formData),
    onSuccess: () => {
      toast.success('Foto enviada.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao enviar foto', getApiErrorMessage(error));
    },
  });
}
