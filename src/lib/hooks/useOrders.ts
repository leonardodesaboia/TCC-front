import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { forgetCurrentRoute } from '@/lib/navigation/back-history';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { appendImage } from '@/lib/utils/form-data';
import { toast } from '@/lib/utils/toast';
import { OrderStatus, type CreateOnDemandOrderRequestDto, type CreateOrderRequestDto, type OrderDetails, type OrderFiltersDto } from '@/types/order';

async function buildPhotoFormData(imageUri: string): Promise<FormData> {
  const formData = new FormData();
  await appendImage(formData, 'file', { uri: imageUri }, 'photo.jpg');
  formData.append('type', 'request');
  return formData;
}

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
    refetchInterval: (query) => (enabled && !!id && !query.state.error ? ACTIVE_ORDER_POLL_MS : false),
  });
}

export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageUri, ...payload }: CreateOrderRequestDto & { imageUri?: string }) => {
      const order = await clientIntegration.orders.create(payload);
      if (imageUri) {
        try {
          const formData = await buildPhotoFormData(imageUri);
          await clientIntegration.orders.uploadPhoto(order.id, formData);
        } catch (error) {
          toast.error('Foto não enviada', `O pedido foi criado, mas a foto não pôde ser enviada. ${getApiErrorMessage(error)}`);
        }
      }
      return order;
    },
    onSuccess: (order) => {
      // O pedido recém-criado já vai para o cache: a tela de detalhes abre na hora,
      // sem ficar em "Carregando pedido..." esperando a primeira busca.
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      toast.success('Pedido enviado!', 'Os profissionais próximos estão sendo avisados.');
      forgetCurrentRoute();
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
    mutationFn: async ({ imageUri, ...payload }: CreateOnDemandOrderRequestDto & { imageUri?: string }) => {
      const order = await clientIntegration.orders.createOnDemand(payload);
      if (imageUri) {
        try {
          const formData = await buildPhotoFormData(imageUri);
          await clientIntegration.orders.uploadPhoto(order.id, formData);
        } catch (error) {
          toast.error('Foto não enviada', `O pedido foi criado, mas a foto não pôde ser enviada. ${getApiErrorMessage(error)}`);
        }
      }
      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido enviado!', 'O profissional será notificado');
      forgetCurrentRoute();
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
      toast.success('Proposta aceita!', 'Você já pode conversar com o profissional pelo botão "Conversar".');
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
      forgetCurrentRoute();
      router.replace('/(client)/(orders)');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao cancelar pedido', getApiErrorMessage(error));
    },
  });
}

export function useConfirmOrder(orderId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => clientIntegration.orders.confirm(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Serviço confirmado!', 'Agora conte como foi o atendimento.');
      // A avaliação é o passo seguinte natural: abrir direto evita que ela seja esquecida.
      router.push(`/(client)/(orders)/review/${orderId}` as never);
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

export function useRespondNewPrice(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accepted: boolean) =>
      clientIntegration.orders.respondNewPrice(orderId, { accepted }),
    onSuccess: (_data, accepted) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (accepted) {
        toast.success('Novo preço aceito!', 'O valor do pedido foi atualizado.');
      } else {
        toast.info('Pedido cancelado.', 'O novo preço foi recusado, sem custo para você.');
      }
    },
    onError: (error: unknown) => {
      toast.error('Erro ao responder proposta', getApiErrorMessage(error));
    },
  });
}

export function useRespondServiceChange(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accepted: boolean) =>
      clientIntegration.orders.respondServiceChange(orderId, { accepted }),
    onSuccess: (_data, accepted) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (accepted) {
        toast.success('Troca de serviço aceita!', 'O serviço do pedido foi atualizado.');
      } else {
        toast.info('Pedido cancelado.', 'A troca de serviço foi recusada, sem custo para você.');
      }
    },
    onError: (error: unknown) => {
      toast.error('Erro ao responder proposta', getApiErrorMessage(error));
    },
  });
}
