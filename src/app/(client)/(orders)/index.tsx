import { StyleSheet, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { colors, layout, radius, shadows, spacing } from '@/theme';

export default function OrdersScreen() {
  return (
    <Screen edges={['top']}>
      <View style={styles.hero}>
        <Text variant="displaySm">Pedidos</Text>
        <Text color={colors.neutral[500]}>
          O fluxo detalhado de pedidos entra em seguida, preservando a linguagem visual da Home.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <ClipboardList color={colors.primary.default} size={22} />
        </View>
        <Text variant="titleSm">Timeline pronta para entrar</Text>
        <Text color={colors.neutral[500]}>
          Esta tab já está ligada ao tab bar e pode receber lista, detalhe, pagamento e checkout sem mudar a estrutura do cliente.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing[2],
    marginBottom: layout.sectionGap,
  },
  card: {
    gap: spacing[3],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    ...shadows.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1E5',
  },
});
