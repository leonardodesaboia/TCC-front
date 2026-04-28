import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type { CreateAddressRequestDto, UpdateAddressRequestDto } from '@/types/address';

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: () => clientIntegration.addresses.getAll(),
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
