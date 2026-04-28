import { Redirect, Stack } from 'expo-router';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types/user';

export default function AuthLayout() {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  if (isAuthenticated) {
    return (
      <Redirect
        href={user?.role === UserRole.PROFESSIONAL ? '/(professional)/(dashboard)' : '/(client)/(home)'}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
