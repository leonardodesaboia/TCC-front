import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, CalendarClock, ReceiptText } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { colors, layout, radius, shadows, spacing } from '@/theme';

const NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Visita confirmada para hoje',
    body: 'Mariana Costa confirmou presença para o atendimento das 14:00.',
    icon: CalendarClock,
  },
  {
    id: 'n-2',
    title: 'Pedido atualizado',
    body: 'Seu agendamento de manutenção teve o horário ajustado para 09:30.',
    icon: ReceiptText,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.secondary.default} size={20} />
        </Pressable>
        <View style={styles.headerText}>
          <Text variant="displaySm">Notificações</Text>
          <Text color={colors.neutral[500]}>
            Atualizações relevantes para sua rotina de serviços.
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {NOTIFICATIONS.map((item) => {
          const Icon = item.icon;

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconWrap}>
                <Icon color={colors.primary.default} size={18} />
              </View>
              <View style={styles.cardText}>
                <Text variant="titleSm">{item.title}</Text>
                <Text color={colors.neutral[500]}>{item.body}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.emptyCard}>
          <Bell color={colors.neutral[500]} size={20} />
          <Text variant="titleSm">Tudo em ordem por aqui.</Text>
          <Text color={colors.neutral[500]}>
            Novas notificações vão aparecer conforme seus pedidos avançarem.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing[4],
    marginBottom: layout.sectionGap,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  headerText: {
    gap: spacing[2],
  },
  list: {
    gap: spacing[3],
  },
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    padding: layout.cardPadding,
    ...shadows.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1E5',
  },
  cardText: {
    flex: 1,
    gap: spacing[1],
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
  },
});
