import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Clock, Shield, User } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export default function SearchCategoryChoiceScreen() {
  const router = useRouter();
  const { categoryId, areaId, areaName, categoryName } = useLocalSearchParams<{
    categoryId: string;
    areaId?: string;
    areaName?: string;
    categoryName?: string;
  }>();

  const resolvedCategoryName = categoryName ?? 'Categoria selecionada';
  const resolvedAreaName = areaName ?? 'Buscar';

  function goToExpress() {
    if (!areaId || !categoryId) return;

    router.push({
      pathname: '/(client)/(orders)/express',
      params: {
        areaId,
        categoryId,
        areaName: resolvedAreaName,
        categoryName: resolvedCategoryName,
      },
    });
  }

  function goToProfessionals() {
    if (!areaId || !categoryId) return;

    router.push({
      pathname: '/(client)/(search)/professionals',
      params: {
        areaId,
        categoryId,
        areaName: resolvedAreaName,
        categoryName: resolvedCategoryName,
      },
    });
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Como deseja continuar?" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Badge label={resolvedAreaName} />
          <Text variant="displaySm">{resolvedCategoryName}</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>
            Escolha entre abrir um pedido rápido para receber propostas ou selecionar quem vai atender você.
          </Text>
        </View>

        <View style={styles.optionList}>
          <View style={[styles.optionCard, styles.optionCardExpress]}>
            <View style={styles.optionHeader}>
              <View style={[styles.iconWrap, styles.iconWrapExpress]}>
                <Clock color={colors.primary.dark} size={20} />
              </View>
              <Badge label="Express" variant="warning" />
            </View>
            <Text variant="titleLg">Pedido rápido</Text>
            <Text variant="bodySm" color={colors.neutral[700]}>
              Descreva o problema e receba propostas de profissionais próximos em poucos minutos.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text variant="labelLg" color={colors.neutral[700]}>
                  Ideal para urgências e demandas abertas
                </Text>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text variant="labelLg" color={colors.neutral[700]}>
                  Você escolhe a melhor proposta depois
                </Text>
              </View>
            </View>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight color="#FFFFFF" size={18} />}
              onPress={goToExpress}
            >
              Abrir pedido Express
            </Button>
          </View>

          <View style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <View style={styles.iconWrap}>
                <User color={colors.info} size={20} />
              </View>
              <Badge label="Sob demanda" variant="info" />
            </View>
            <Text variant="titleLg">Escolher profissional</Text>
            <Text variant="bodySm" color={colors.neutral[700]}>
              Veja avaliações, disponibilidade e escolha quem vai realizar o serviço antes do agendamento.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <View style={[styles.featureDot, styles.featureDotInfo]} />
                <Text variant="labelLg" color={colors.neutral[700]}>
                  Compare perfis e avaliações da categoria
                </Text>
              </View>
              <View style={styles.featureRow}>
                <View style={[styles.featureDot, styles.featureDotInfo]} />
                <Text variant="labelLg" color={colors.neutral[700]}>
                  Siga direto para o serviço e agendamento
                </Text>
              </View>
            </View>
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight color={colors.primary.default} size={18} />}
              onPress={goToProfessionals}
            >
              Ver profissionais
            </Button>
          </View>
        </View>

        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={20} />
          <Text variant="labelLg" color={colors.neutral[700]} style={styles.guaranteeText}>
            Em ambos os fluxos, o pedido segue com pagamento protegido e histórico no app.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: {
    gap: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  hero: {
    gap: spacing[2],
  },
  optionList: {
    gap: spacing[4],
  },
  optionCard: {
    gap: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[5],
  },
  optionCardExpress: {
    backgroundColor: colors.primary.light,
    borderColor: '#F7C59A',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
  },
  iconWrapExpress: {
    backgroundColor: '#FDE7D1',
  },
  featureList: {
    gap: spacing[2],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary.default,
  },
  featureDotInfo: {
    backgroundColor: colors.info,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  guaranteeText: {
    flex: 1,
  },
});
