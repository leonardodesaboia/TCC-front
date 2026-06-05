import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import { toast } from '@/lib/utils/toast';

export function useFavoriteStatus(professionalId: string) {
  return useQuery({
    queryKey: queryKeys.favorites.status(professionalId),
    queryFn: () => clientIntegration.favorites.getStatus(professionalId),
    enabled: !!professionalId,
  });
}

export function useToggleFavorite(professionalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isFavorited: boolean) =>
      isFavorited
        ? clientIntegration.favorites.unfavorite(professionalId)
        : clientIntegration.favorites.favorite(professionalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.favorites.status(professionalId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
    onError: () => {
      toast.error('Não foi possível atualizar os favoritos.');
    },
  });
}

export function useFavoriteProfessionals() {
  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: () => clientIntegration.favorites.list(),
  });
}
