import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type { UpdateUserRequest } from '@/types/user';
import { useRouter } from 'expo-router';

export function useUser(id: string) {
  return useQuery({
    queryKey: [...queryKeys.user, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return useMutation({
    mutationFn: (payload: UpdateUserRequest) => usersApi.updateMe(payload),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Perfil atualizado.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao atualizar perfil', getApiErrorMessage(error));
    },
  });
}

export function useDeleteAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: async () => {
      await logout();
      queryClient.clear();
      toast.success('Conta enviada para exclusão.');
      router.replace('/(auth)/login');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao excluir conta', getApiErrorMessage(error));
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return useMutation({
    mutationFn: () => usersApi.deleteAvatar(),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Avatar removido.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao remover avatar', getApiErrorMessage(error));
    },
  });
}
