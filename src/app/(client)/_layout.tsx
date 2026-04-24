import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { ClientTabBar } from '@/components/layout/ClientTabBar';
import { useLogout } from '@/lib/hooks/useAuth';
import { UserRole } from '@/types/user';
import { colors, layout, radius, shadows, spacing } from '@/theme';
import { useAuth } from '@/providers/AuthProvider';

function UnsupportedRoleState() {
  const logout = useLogout();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.unsupportedShell}>
        <View style={styles.unsupportedCard}>
          <Text variant="labelLg" color={colors.primary.default}>
            ACESSO LIMITADO
          </Text>
          <Text variant="displaySm" style={styles.unsupportedTitle}>
            Esta área do rewrite está liberada apenas para clientes.
          </Text>
          <Text color={colors.neutral[500]} style={styles.unsupportedBody}>
            Seu usuário foi autenticado, mas não corresponde ao perfil atendido por este fluxo inicial.
          </Text>
          <Button loading={logout.isPending} onPress={() => logout.mutate()}>
            Sair da conta
          </Button>
        </View>
      </View>
    </Screen>
  );
}

export default function ClientLayout() {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Carregando sua área..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role && user.role !== UserRole.CLIENT) {
    return <UnsupportedRoleState />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ClientTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="(home)" options={{ title: 'Início' }} />
      <Tabs.Screen name="(search)" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="(orders)" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="(profile)" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  unsupportedShell: {
    flex: 1,
    justifyContent: 'center',
  },
  unsupportedCard: {
    gap: layout.formGap,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    ...shadows.md,
  },
  unsupportedTitle: {
    color: colors.secondary.default,
  },
  unsupportedBody: {
    marginTop: -spacing[2],
  },
});
