import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { ClientTabBar } from '@/components/layout/ClientTabBar';
import { useLogout } from '@/lib/hooks/useAuth';
import { UserRole } from '@/types/user';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/providers/AuthProvider';

function UnsupportedRoleState() {
  const logout = useLogout();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.unsupported}>
        <Text variant="displaySm">Acesso limitado</Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          Esta área está disponível apenas para clientes.
        </Text>
        <Button loading={logout.isPending} onPress={() => logout.mutate()}>
          Sair da conta
        </Button>
      </View>
    </Screen>
  );
}

export default function ClientLayout() {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();

  if (!isInitialized || isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user?.role && user.role !== UserRole.CLIENT) return <UnsupportedRoleState />;

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
      <Tabs.Screen name="conversations" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  unsupported: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[4],
  },
});
