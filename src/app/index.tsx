import { Redirect } from 'expo-router';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types/user';

export default function IndexScreen() {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === UserRole.PROFESSIONAL) {
    return <Redirect href="/(professional)/(dashboard)" />;
  }

  return <Redirect href="/(client)/(home)" />;
}
