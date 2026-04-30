import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, CalendarClock, CheckCheck, MessageCircle, ReceiptText, ShieldAlert, Star } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Text } from '@/components/ui';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/lib/hooks/useNotifications';
import type { NotificationType } from '@/types/notification';
import { colors, radius, spacing } from '@/theme';

const ICON_BY_TYPE: Record<NotificationType, typeof Bell> = {
  new_request: ReceiptText,
  request_accepted: CalendarClock,
  request_rejected: ShieldAlert,
  request_status_update: ReceiptText,
  new_message: MessageCircle,
  payment_released: ReceiptText,
  dispute_opened: ShieldAlert,
  dispute_resolved: ShieldAlert,
  verification_result: Star,
};

function formatDate(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function NotificationsScreen() {
  const router = useRouter();
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (notificationsQuery.isLoading) {
    return <LoadingScreen message="Carregando notificações..." />;
  }

  if (notificationsQuery.isError) {
    return <ErrorState message="Não foi possível carregar notificações." onRetry={() => notificationsQuery.refetch()} />;
  }

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const isRefreshing = notificationsQuery.isFetching && !notificationsQuery.isLoading;

  return (
    <Screen
      edges={['top']}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => notificationsQuery.refetch()} />
      }
    >
      <Header title="Notificações" showBack />

      {unreadCount > 0 ? (
        <View style={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            fullWidth={false}
            leftIcon={<CheckCheck color={colors.primary.default} size={16} />}
            onPress={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            Marcar todas como lidas
          </Button>
        </View>
      ) : null}

      {notifications.length > 0 ? (
        <View style={styles.list}>
          {notifications.map((item) => {
            const Icon = ICON_BY_TYPE[item.type] ?? Bell;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (!item.readAt) {
                    markRead.mutate(item.id);
                  }

                  const orderId = typeof item.data?.orderId === 'string' ? item.data.orderId : undefined;
                  if (orderId) {
                    router.push(`/(client)/(orders)/${orderId}` as any);
                  }
                }}
                style={({ pressed }) => [
                  styles.card,
                  !item.readAt && styles.cardUnread,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.iconWrap}>
                  <Icon color={colors.primary.default} size={18} />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.cardTitleRow}>
                    <Text variant="titleSm" style={styles.cardTitle}>{item.title}</Text>
                    <Text variant="labelSm" color={colors.neutral[400]}>
                      {formatDate(item.sentAt ?? item.createdAt)}
                    </Text>
                  </View>
                  <Text variant="bodySm" color={colors.neutral[500]}>{item.body}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={Bell}
          title="Tudo em dia"
          description="Novas notificações aparecerão conforme seus pedidos avançarem."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'flex-end',
    marginTop: spacing[2],
  },
  list: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  cardUnread: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.light,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
  cardText: {
    flex: 1,
    gap: spacing[1],
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardTitle: {
    flex: 1,
  },
});
