import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Raleway_700Bold } from '@expo-google-fonts/raleway';
import { AppProvider } from '@/providers/AppProvider';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';

if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Raleway-Bold': Raleway_700Bold,
  });

  useEffect(() => {
    if (Platform.OS !== 'web' && (fontsLoaded || fontError)) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (fontError && Platform.OS !== 'web') {
    throw fontError;
  }

  if (Platform.OS !== 'web' && !fontsLoaded) {
    return <LoadingScreen message="Carregando fontes..." />;
  }

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Slot />
    </AppProvider>
  );
}
