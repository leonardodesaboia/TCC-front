import { StyleSheet, View } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { colors, layout, radius, shadows, spacing } from '@/theme';

export default function ProfileScreen() {
  return (
    <Screen edges={['top']}>
      <View style={styles.hero}>
        <Text variant="displaySm">Perfil</Text>
        <Text color={colors.neutral[500]}>
          A base visual para dados pessoais, endereços e configurações já está no lugar.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <UserRound color={colors.primary.default} size={22} />
        </View>
        <Text variant="titleSm">Espaço reservado para sua conta</Text>
        <Text color={colors.neutral[500]}>
          Aqui entram os dados do usuário, edição de perfil, endereços e preferências mantendo o mesmo sistema de cartões e tipografia.
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
