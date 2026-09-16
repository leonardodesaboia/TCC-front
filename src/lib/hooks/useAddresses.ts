import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type {
  CreateAddressRequestDto,
  GeocodeAddressRequestDto,
  ReverseGeocodeRequestDto,
  UpdateAddressRequestDto,
} from '@/types/address';

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: () => clientIntegration.addresses.getAll(),
  });
}

/**
 * Busca coordenadas a partir do endereço escrito.
 *
 * `silent` desliga o toast de erro. Serve para a busca automática, que a pessoa
 * não pediu: falhar ali não deve encher a tela de aviso — ela segue marcando o
 * ponto no mapa como faria de qualquer jeito.
 */
export function useLookupAddress(options?: { silent?: boolean }) {
  const silent = options?.silent ?? false;

  return useMutation({
    mutationFn: (payload: GeocodeAddressRequestDto) => clientIntegration.addresses.lookup(payload),
    onError: (error: unknown) => {
      if (silent) return;
      toast.error('Não foi possível localizar o endereço', getApiErrorMessage(error));
    },
  });
}

/**
 * Converte o ponto do mapa em endereço escrito.
 *
 * <p>Silencioso de propósito: é uma conveniência disparada ao mover o pin, não uma
 * ação que a pessoa pediu. Falhar aqui não deve encher a tela de toast — o
 * cadastro segue com o que ela digitou.
 */
export function useReverseGeocode() {
  return useMutation({
    mutationFn: (payload: ReverseGeocodeRequestDto) =>
      clientIntegration.addresses.reverse(payload),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressRequestDto) => clientIntegration.addresses.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Endereço adicionado!');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao salvar endereço', getApiErrorMessage(error));
    },
  });
}

export function useUpdateAddress(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAddressRequestDto) =>
      clientIntegration.addresses.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Endereço atualizado!');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao atualizar endereço', getApiErrorMessage(error));
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientIntegration.addresses.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Endereço removido!');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao remover endereço', getApiErrorMessage(error));
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientIntegration.addresses.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Endereço padrão atualizado!');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao atualizar endereço padrão', getApiErrorMessage(error));
    },
  });
}
