import { Redirect, Stack } from 'expo-router';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthLayout() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(client)/(home)" />;
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
