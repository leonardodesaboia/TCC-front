import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '../../components/layout/BrandMark';
import { SectionHeader } from '../../components/layout/SectionHeader';

export function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <BrandMark compact />

        <View className="mt-8 gap-4">
          <SectionHeader
            eyebrow="Explorar"
            description="Espaco reservado para busca, filtros, categorias e lista de profissionais."
            title="Modulo preparado para a proxima sprint"
          />

          <View className="rounded-card border border-gray-2 bg-white p-5">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Ionicons color="#D77219" name="search-outline" size={28} />
            </View>
            <Text className="text-body-lg font-bold text-brown">Busca e catalogo</Text>
            <Text className="mt-2 text-body-sm text-brown-light">
              Aqui entram filtros por avaliacao, preco, distancia, disponibilidade e tipo de servico.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
