import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { queryKeys } from '@/lib/constants/query-keys';
import { professionalIntegration } from '@/lib/integrations/professional';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import { useAuth } from '@/providers/AuthProvider';
import { OrderStatus, type OrderDetails, type OrderFiltersDto, type ProRespondRequest } from '@/types/order';

const PRO_LIST_POLL_MS = 10000;
const PRO_DETAIL_POLL_MS = 5000;

export function useMyProfessionalProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.professionals.myProfile,
    queryFn: () => professionalIntegration.profile.getMyProfile(),
    enabled: !!user?.id,
  });
}

export function useProfessionalOrders(params: OrderFiltersDto = {}) {
  return useQuery({
    queryKey: queryKeys.professionalOrders.list(params),
    queryFn: () => professionalIntegration.orders.getOrders(params),
    refetchInterval: PRO_LIST_POLL_MS,
  });
}

export function useProfessionalOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.professionalOrders.detail(id),
    queryFn: () => professionalIntegration.orders.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const order = query.state.data as OrderDetails | undefined;
      if (!order) return PRO_DETAIL_POLL_MS;
      return order.status === OrderStatus.PENDING || order.status === OrderStatus.ACCEPTED
        ? PRO_DETAIL_POLL_MS
        : false;
    },
  });
}

export function useRespondToOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProRespondRequest) =>
      professionalIntegration.orders.respond(orderId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (variables.response === 'accepted') {
        toast.success('Proposta enviada!');
      } else {
        toast.info('Pedido recusado.');
      }
    },
    onError: (error: unknown) => {
      toast.error('Erro ao responder pedido', getApiErrorMessage(error));
    },
  });
}

export function useRespondOnDemandOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accepted: boolean) =>
      professionalIntegration.orders.respondOnDemand(orderId, accepted),
    onSuccess: (_data, accepted) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (accepted) {
        toast.success('Pedido aceito!');
      } else {
        toast.info('Pedido recusado.');
      }
    },
    onError: (error: unknown) => {
      toast.error('Erro ao responder pedido', getApiErrorMessage(error));
    },
  });
}

export function useProCompleteOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      professionalIntegration.orders.complete(orderId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Servico marcado como concluido!');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao concluir servico', getApiErrorMessage(error));
    },
  });
}

export function useProCancelOrder(orderId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) =>
      professionalIntegration.orders.cancel(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido cancelado.');
      router.replace('/(professional)/(orders)');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao cancelar pedido', getApiErrorMessage(error));
    },
  });
}
