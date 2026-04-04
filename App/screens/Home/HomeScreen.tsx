import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/button/Button';
import { FeatureCard } from '../../components/cards/FeatureCard';
import { ProfessionalHighlightCard } from '../../components/cards/ProfessionalHighlightCard';
import { ServiceCategoryCard } from '../../components/cards/ServiceCategoryCard';
import { StepCard } from '../../components/cards/StepCard';
import { BrandMark } from '../../components/layout/BrandMark';
import { SectionHeader } from '../../components/layout/SectionHeader';
import {
  featuredProfessionals,
  heroHighlights,
  howItWorksSteps,
  serviceCategories,
  trustPoints,
} from '../../constants/home';

export function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-8 pt-3">
          <View className="mb-6 flex-row items-start justify-between gap-4">
            <View className="gap-1">
              <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Front mobile MVP</Text>
              <BrandMark />
            </View>

            <Pressable
              className="flex-row items-center gap-2 rounded-full border border-gray-2 bg-white px-4 py-3"
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons color="#D77219" name="person-circle-outline" size={22} />
              <Text className="text-body-sm font-bold text-brown">Login</Text>
            </Pressable>
          </View>

          <View className="overflow-hidden rounded-card bg-primary px-5 pb-6 pt-6">
            <View className="absolute -right-8 -top-6 h-28 w-28 rounded-full bg-primary-soft/40" />
            <View className="absolute -bottom-8 left-0 h-24 w-24 rounded-full bg-primary-deep/20" />

            <Text className="mb-3 text-label-lg font-bold uppercase tracking-[1.2px] text-white/80">Express + agendamento</Text>
            <Text className="text-display-md font-extrabold text-white">
              Conectamos quem precisa de um servico com quem sabe fazer.
            </Text>
            <Text className="mt-3 text-body-lg text-white/90">
              Clientes contratam com rapidez. Profissionais recebem demandas verificadas e pagamento protegido.
            </Text>

            <View className="mt-5 flex-row flex-wrap gap-2">
              {heroHighlights.map((item) => (
                <View className="rounded-full bg-white/15 px-3 py-2" key={item}>
                  <Text className="text-label-lg font-bold text-white">{item}</Text>
                </View>
              ))}
            </View>

            <View className="mt-6 gap-3">
              <Button fullWidth label="Contratar servico" variant="inverse" />
              <Button fullWidth label="Oferecer servico" variant="outline-light" />
            </View>
          </View>

          <View className="mt-5 rounded-card border border-gray-2 bg-white p-5">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt">
                <Ionicons color="#D77219" name="person-circle-outline" size={24} />
              </View>

              <View className="flex-1">
                <Text className="text-body-lg font-bold text-brown">Entrar ficou mais fácil</Text>
                <Text className="mt-2 text-body-sm text-brown-light">
                  Acesse a aba Conta para fazer login com e-mail e senha, acompanhar pedidos ou gerenciar sua atuação como profissional.
                </Text>
              </View>
            </View>

            <View className="mt-4">
              <Button fullWidth label="Abrir minha conta" onPress={() => navigation.navigate('Profile')} />
            </View>
          </View>

          <View className="mt-8 gap-4">
            <SectionHeader
              eyebrow="Categorias mais buscadas"
              description="Direcao visual reaproveitada do MVP web, agora pensada para uma navegacao mobile mais direta."
              title="Comece pelas demandas mais comuns"
            />

            <View className="gap-3">
              {serviceCategories.map((category) => (
                <ServiceCategoryCard
                  description={category.description}
                  icon={category.icon}
                  key={category.title}
                  title={category.title}
                  tone={category.tone}
                />
              ))}
            </View>
          </View>

          <View className="mt-8 gap-4">
            <SectionHeader
              eyebrow="Valor do produto"
              description="Os blocos abaixo traduzem a proposta central do AllSet para a primeira sprint do app."
              title="Por que o AllSet existe"
            />

            <View className="gap-3">
              {trustPoints.map((point) => (
                <FeatureCard
                  description={point.description}
                  icon={point.icon}
                  key={point.title}
                  title={point.title}
                  tone={point.tone}
                />
              ))}
            </View>
          </View>

          <View className="mt-8 gap-4">
            <SectionHeader
              eyebrow="Como funciona"
              description="O fluxo foi resumido em quatro passos para manter a leitura clara no mobile."
              title="Jornada base do MVP"
            />

            <View className="gap-3">
              {howItWorksSteps.map((step) => (
                <StepCard description={step.description} key={step.step} step={step.step} title={step.title} />
              ))}
            </View>
          </View>

          <View className="mt-8 gap-4">
            <SectionHeader
              eyebrow="Profissionais em destaque"
              description="Cards iniciais para comunicar o tipo de curadoria e densidade de informacao esperada."
              title="Preview da experiencia de descoberta"
            />

            <View className="gap-3">
              {featuredProfessionals.map((professional) => (
                <ProfessionalHighlightCard
                  availability={professional.availability}
                  key={professional.name}
                  name={professional.name}
                  price={professional.price}
                  rating={professional.rating}
                  role={professional.role}
                  tags={professional.tags}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
