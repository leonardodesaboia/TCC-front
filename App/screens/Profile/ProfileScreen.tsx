import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/button/Button';
import { BrandMark } from '../../components/layout/BrandMark';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { useThemeContext } from '../../../contexts/ui/ThemeContext';

export function ProfileScreen() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <BrandMark compact />

        <View className="mt-8 gap-4">
          <SectionHeader
            eyebrow="Perfil"
            description="Espaco inicial para login, cadastro e preferencias da conta."
            title="Modulo de conta preparado"
          />

          <View className="rounded-card border border-gray-2 bg-white p-5">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-surface-alt">
              <Ionicons color="#AF5D1F" name="person-circle-outline" size={30} />
            </View>
            <Text className="text-body-lg font-bold text-brown">Tema atual: {theme}</Text>
            <Text className="mt-2 text-body-sm text-brown-light">
              O ThemeContext foi mantido para seguir a base do boilerplate e abrir caminho para ajustes de UI nas proximas telas.
            </Text>

            <View className="mt-5">
              <Button fullWidth label="Alternar tema" onPress={toggleTheme} variant="outline" />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
