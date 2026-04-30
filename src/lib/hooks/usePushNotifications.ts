import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRegisterPushToken } from './useNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types/user';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const registerToken = useRegisterPushToken();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || registeredRef.current) return;
    registeredRef.current = true;

    void (async () => {
      try {
        if (!Device.isDevice) return;
        if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          (Constants.easConfig as { projectId?: string } | undefined)?.projectId;
        const tokenResponse = projectId
          ? await Notifications.getExpoPushTokenAsync({ projectId })
          : await Notifications.getExpoPushTokenAsync();

        registerToken.mutate({
          expoToken: tokenResponse.data,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
      } catch (error) {
        // Silenciar — não bloqueia o app se o push falhar
      }
    })();
  }, [isAuthenticated, user, registerToken]);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['professional-orders'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data as { orderId?: string } | undefined;
      const orderId = typeof data?.orderId === 'string' ? data.orderId : undefined;
      if (!orderId) return;

      if (user?.role === UserRole.PROFESSIONAL) {
        router.push(`/(professional)/(orders)/${orderId}` as never);
      } else {
        router.push(`/(client)/(orders)/${orderId}` as never);
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [queryClient, router, user?.role]);
}
