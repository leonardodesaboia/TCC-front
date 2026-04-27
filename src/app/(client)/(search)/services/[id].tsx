import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, Shield, Star } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Button, Divider, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const MOCK_SERVICE = {
  id: 's1',
  title: 'Instalação de tomada',
  description: 'Serviço completo de instalação de tomada simples, dupla ou tripla em qualquer cômodo. Inclui teste de funcionamento e acabamento final. Material não incluso — pode ser adquirido separadamente ou fornecido pelo cliente.',
  price: 'R$ 80,00',
  duration: '30 min',
  category: 'Elétrica',
  professional: {
    id: 'p1',
    name: 'Carlos Mendes',
    profession: 'Eletricista',
    rating: '4.9',
    reviewCount: '127',
    badge: 'Top Pro',
  },
  includes: [
    'Instalação da tomada',
    'Teste de funcionamento',
    'Acabamento e limpeza do local',
  ],
  notIncludes: [
    'Material elétrico (tomada, fios, etc.)',
    'Quebra de parede para passagem de fios',
  ],
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const s = MOCK_SERVICE;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Detalhes do serviço" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title section */}
        <View style={styles.titleSection}>
          <Badge label={s.category} />
          <Text variant="displaySm">{s.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock color={colors.neutral[400]} size={16} />
              <Text variant="bodySm" color={colors.neutral[500]}>{s.duration}</Text>
            </View>
          </View>
          <Text variant="displayMd" color={colors.primary.default}>{s.price}</Text>
        </View>

        <Divider />

        {/* Description */}
        <View style={styles.section}>
          <Text variant="titleSm">Descrição</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>{s.description}</Text>
        </View>

        <Divider />

        {/* Includes */}
        <View style={styles.section}>
          <Text variant="titleSm">O que inclui</Text>
          {s.includes.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.bulletGreen} />
              <Text variant="bodySm" color={colors.neutral[700]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Not includes */}
        <View style={styles.section}>
          <Text variant="titleSm">Não inclui</Text>
          {s.notIncludes.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.bulletGray} />
              <Text variant="bodySm" color={colors.neutral[500]}>{item}</Text>
            </View>
          ))}
        </View>

        <Divider />

        {/* Professional */}
        <View style={styles.section}>
          <Text variant="titleSm">Profissional</Text>
          <View
            style={styles.professionalCard}
          >
            <Avatar name={s.professional.name} size="lg" backgroundColor={colors.primary.default} />
            <View style={styles.professionalInfo}>
              <View style={styles.professionalNameRow}>
                <Text variant="titleSm">{s.professional.name}</Text>
                {s.professional.badge ? <Badge label={s.professional.badge} /> : null}
              </View>
              <Text variant="bodySm" color={colors.neutral[500]}>{s.professional.profession}</Text>
              <View style={styles.ratingRow}>
                <Star color={colors.warning} fill={colors.warning} size={14} />
                <Text variant="labelLg">{s.professional.rating}</Text>
                <Text variant="labelSm" color={colors.neutral[500]}>({s.professional.reviewCount})</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Guarantee */}
        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={24} />
          <View style={styles.guaranteeText}>
            <Text variant="titleSm">Pagamento seguro</Text>
            <Text variant="labelLg" color={colors.neutral[500]}>
              Seu pagamento fica retido até a conclusão do serviço. Se houver qualquer problema, você pode abrir uma disputa.
            </Text>
          </View>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text variant="labelLg" color={colors.neutral[500]}>A partir de</Text>
          <Text variant="titleLg" color={colors.primary.default}>{s.price}</Text>
        </View>
        <View style={styles.ctaBtn}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push(`/(client)/(orders)/checkout/${s.id}` as any)}
          >
            Agendar serviço
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  titleSection: { gap: spacing[2], paddingTop: spacing[2] },
  metaRow: { flexDirection: 'row', gap: spacing[4] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  section: { gap: spacing[3] },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  bulletGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  bulletGray: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neutral[300] },
  professionalCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
  },
  professionalInfo: { flex: 1, gap: spacing[1] },
  professionalNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: spacing[1] },
  guaranteeCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  guaranteeText: { flex: 1, gap: spacing[1] },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  bottomPrice: { gap: 2 },
  ctaBtn: { flex: 1 },
});
