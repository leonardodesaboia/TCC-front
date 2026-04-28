import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';

const notificationKeys = {
  all: ['notifications'] as const,
  preferences: ['notifications', 'preferences'] as const,
  pushTokens: ['push-tokens'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.getAll(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notificações marcadas como lidas.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao atualizar notificações', getApiErrorMessage(error));
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: () => notificationsApi.getPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationsEnabled: boolean) =>
      notificationsApi.updatePreferences({ notificationsEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences });
      toast.success('Preferências atualizadas.');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao salvar preferências', getApiErrorMessage(error));
    },
  });
}

export function usePushTokens() {
  return useQuery({
    queryKey: notificationKeys.pushTokens,
    queryFn: () => notificationsApi.getPushTokens(),
  });
}

export function useRegisterPushToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { expoToken: string; platform: 'android' | 'ios' }) =>
      notificationsApi.registerPushToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.pushTokens });
    },
    onError: (error: unknown) => {
      toast.error('Erro ao registrar push token', getApiErrorMessage(error));
    },
  });
}

export function useDeletePushToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deletePushToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.pushTokens });
    },
    onError: (error: unknown) => {
      toast.error('Erro ao remover push token', getApiErrorMessage(error));
    },
  });
}
