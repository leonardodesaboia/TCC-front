import { Redirect } from 'expo-router';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAuth } from '@/providers/AuthProvider';

export default function IndexScreen() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }

  return <Redirect href={isAuthenticated ? '/(client)/(home)' : '/(auth)/login'} />;
}
