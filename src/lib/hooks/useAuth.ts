import { AUTH_BYPASS_ENABLED } from '@/lib/constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api/auth';
import { createBypassUser, useAuthStore } from '@/lib/stores/auth-store';
import { toast } from '@/lib/utils/toast';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { queryKeys } from '@/lib/constants/query-keys';
import { UserRole } from '@/types/user';
import type { LoginRequest, RegisterClientRequest, RegisterProfessionalRequest, User } from '@/types/user';

function getPostAuthRoute(user: User): '/(client)/(home)' | '/(professional)/(dashboard)' {
  return user.role === UserRole.PROFESSIONAL
    ? '/(professional)/(dashboard)'
    : '/(client)/(home)';
}

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation<User, unknown, LoginRequest>({
    mutationFn: async (data) => {
      if (AUTH_BYPASS_ENABLED) {
        return createBypassUser();
      }

      await authApi.login(data);
      return authApi.getProfile();
    },
    onSuccess: async (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Bem-vindo!', `Olá, ${user.name ?? ''}`);
      router.replace(getPostAuthRoute(user));
    },
    onError: (error: unknown) => {
      toast.error('Erro ao fazer login', getApiErrorMessage(error));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation<User, unknown, RegisterClientRequest>({
    mutationFn: async (data) => {
      if (AUTH_BYPASS_ENABLED) {
        return createBypassUser();
      }

      await authApi.register(data);
      return authApi.getProfile();
    },
    onSuccess: async (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Conta criada!', `Bem-vindo, ${user.name ?? ''}`);
      router.replace('/(client)/(home)');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao criar conta', getApiErrorMessage(error));
    },
  });
}

export function useRegisterProfessional() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation<User, unknown, RegisterProfessionalRequest>({
    mutationFn: async (data) => {
      if (AUTH_BYPASS_ENABLED) {
        return {
          ...createBypassUser(),
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: UserRole.PROFESSIONAL,
        };
      }

      await authApi.registerProfessional(data);
      return authApi.getProfile();
    },
    onSuccess: async (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Conta profissional criada!', `Bem-vindo, ${user.name ?? ''}`);
      router.replace(getPostAuthRoute(user));
    },
    onError: (error: unknown) => {
      toast.error('Erro ao criar conta profissional', getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/(auth)/login');
      toast.info('Até logo!', 'Você saiu da sua conta');
    },
  });
}
