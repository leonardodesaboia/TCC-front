import { StyleSheet, View } from 'react-native';
import { Bell, CalendarClock, ReceiptText } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Text } from '@/components/ui';
import { EmptyState } from '@/components/feedback/EmptyState';
import { colors, radius, spacing } from '@/theme';

const NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Visita confirmada',
    body: 'Mariana Costa confirmou presença para o atendimento das 14:00.',
    time: '2h atrás',
    icon: CalendarClock,
    unread: true,
  },
  {
    id: 'n-2',
    title: 'Pedido atualizado',
    body: 'Seu agendamento de manutenção foi ajustado para 09:30.',
    time: '5h atrás',
    icon: ReceiptText,
    unread: false,
  },
];

export default function NotificationsScreen() {
  return (
    <Screen edges={['top']}>
      <Header title="Notificações" showBack />

      <View style={styles.list}>
        {NOTIFICATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.id} style={[styles.card, item.unread && styles.cardUnread]}>
              <View style={styles.iconWrap}>
                <Icon color={colors.primary.default} size={18} />
              </View>
              <View style={styles.cardText}>
                <View style={styles.cardTitleRow}>
                  <Text variant="titleSm" style={styles.cardTitle}>{item.title}</Text>
                  <Text variant="labelSm" color={colors.neutral[400]}>{item.time}</Text>
                </View>
                <Text variant="bodySm" color={colors.neutral[500]}>{item.body}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <EmptyState
        icon={Bell}
        title="Tudo em dia"
        description="Novas notificações aparecerão conforme seus pedidos avançarem."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
  cardTitle: {
    flex: 1,
  },
});
