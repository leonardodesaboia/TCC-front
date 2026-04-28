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

export function useOrderProposals(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.proposals(id),
    queryFn: () => clientIntegration.orders.getExpressProposals(id),
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
