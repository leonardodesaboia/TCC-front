import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { ProfessionalTabBar } from '@/components/layout/ProfessionalTabBar';
import { useLogout } from '@/lib/hooks/useAuth';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';
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
          Esta area esta disponivel apenas para profissionais.
        </Text>
        <Button loading={logout.isPending} onPress={() => logout.mutate()}>
          Sair da conta
        </Button>
      </View>
    </Screen>
  );
}

export default function ProfessionalLayout() {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();
  usePushNotifications();

  if (!isInitialized || isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user?.role && user.role !== UserRole.PROFESSIONAL) return <UnsupportedRoleState />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ProfessionalTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="(dashboard)" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="(orders)" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="conversations" options={{ title: 'Conversas' }} />
      <Tabs.Screen name="(profile)" options={{ title: 'Perfil' }} />
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
