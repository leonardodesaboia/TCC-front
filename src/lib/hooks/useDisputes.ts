import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '@/lib/api/disputes';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';

const disputeKeys = {
  byOrder: (orderId: string) => ['disputes', 'order', orderId] as const,
  evidences: (disputeId: string) => ['disputes', disputeId, 'evidences'] as const,
};

export function useOrderDispute(orderId: string) {
  return useQuery({
    queryKey: disputeKeys.byOrder(orderId),
    queryFn: () => disputesApi.getByOrderId(orderId),
    enabled: !!orderId,
    retry: false,
  });
}

export function useOpenDispute(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => disputesApi.open(orderId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.byOrder(orderId) });
      toast.success('Disputa aberta com sucesso.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao abrir disputa', getApiErrorMessage(error));
    },
  });
}

export function useDisputeEvidences(disputeId: string) {
  return useQuery({
    queryKey: disputeKeys.evidences(disputeId),
    queryFn: () => disputesApi.getEvidences(disputeId),
    enabled: !!disputeId,
  });
}

export function useAddDisputeEvidence(disputeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => disputesApi.addTextEvidence(disputeId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.evidences(disputeId) });
      toast.success('Evidência adicionada.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao enviar evidência', getApiErrorMessage(error));
    },
  });
}
