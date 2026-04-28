import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/reviews';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';

const reviewKeys = {
  order: (orderId: string) => ['reviews', 'order', orderId] as const,
  professional: (professionalId: string) => ['professional-reviews', professionalId] as const,
};

export function useOrderReviews(orderId: string) {
  return useQuery({
    queryKey: reviewKeys.order(orderId),
    queryFn: () => reviewsApi.getOrderReviews(orderId),
    enabled: !!orderId,
  });
}

export function useProfessionalReviews(professionalId: string) {
  return useQuery({
    queryKey: reviewKeys.professional(professionalId),
    queryFn: () => reviewsApi.getProfessionalReviews(professionalId),
    enabled: !!professionalId,
  });
}

export function useCreateOrderReview(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      reviewsApi.createOrderReview(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.order(orderId) });
      toast.success('Avaliação enviada.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao enviar avaliação', getApiErrorMessage(error));
    },
  });
}
