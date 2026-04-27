import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, MessageCircle, Phone, Star } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Button, Divider, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

const MOCK_PROFESSIONAL = {
  id: '1',
  name: 'Carlos Mendes',
  profession: 'Eletricista',
  bio: 'Eletricista certificado com mais de 10 anos de experiência em instalações residenciais e comerciais. Especialista em projetos elétricos, manutenção preventiva e corretiva.',
  rating: '4.9',
  reviewCount: '127',
  neighborhood: 'Centro, Fortaleza',
  availability: 'Disponível hoje',
  badge: 'Top Pro',
  accentColor: colors.primary.default,
  completedJobs: '340',
  responseTime: '~15 min',
};

const MOCK_SERVICES: Service[] = [
  { id: 's1', title: 'Instalação de tomada', description: 'Instalação de tomada simples ou tripla', price: 'R$ 80,00', duration: '30 min' },
  { id: 's2', title: 'Troca de disjuntor', description: 'Troca de disjuntor mono, bi ou trifásico', price: 'R$ 120,00', duration: '45 min' },
  { id: 's3', title: 'Revisão elétrica completa', description: 'Inspeção completa da rede elétrica residencial', price: 'R$ 250,00', duration: '2h' },
  { id: 's4', title: 'Instalação de chuveiro', description: 'Instalação ou troca de chuveiro elétrico', price: 'R$ 100,00', duration: '40 min' },
];

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', clientName: 'Ana Paula', rating: 5, comment: 'Excelente profissional! Pontual, educado e fez um trabalho impecável. Recomendo!', date: '2 dias atrás' },
  { id: 'r2', clientName: 'Ricardo Lima', rating: 5, comment: 'Muito competente, resolveu o problema rapidamente. Preço justo.', date: '1 semana atrás' },
  { id: 'r3', clientName: 'Mariana Costa', rating: 4, comment: 'Bom serviço, chegou no horário combinado. Só demorou um pouco mais que o previsto.', date: '2 semanas atrás' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          color={colors.warning}
          fill={i <= rating ? colors.warning : 'transparent'}
          size={14}
        />
      ))}
    </View>
  );
}

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = MOCK_PROFESSIONAL;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Profissional" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <Avatar name={p.name} size="xl" backgroundColor={p.accentColor} />
          <Text variant="titleLg">{p.name}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{p.profession}</Text>
          <View style={styles.ratingRow}>
            <Star color={colors.warning} fill={colors.warning} size={16} />
            <Text variant="titleSm">{p.rating}</Text>
            <Text variant="bodySm" color={colors.neutral[500]}>({p.reviewCount} avaliações)</Text>
          </View>
          {p.badge ? <Badge label={p.badge} /> : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text variant="titleLg">{p.completedJobs}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>Serviços</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text variant="titleLg">{p.rating}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>Avaliação</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text variant="titleLg">{p.responseTime}</Text>
            <Text variant="labelSm" color={colors.neutral[500]}>Resposta</Text>
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin color={colors.neutral[400]} size={16} />
            <Text variant="bodySm" color={colors.neutral[600]}>{p.neighborhood}</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock color={colors.primary.default} size={16} />
            <Text variant="bodySm" color={colors.primary.default}>{p.availability}</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text variant="titleSm">Sobre</Text>
          <Text variant="bodySm" color={colors.neutral[600]}>{p.bio}</Text>
        </View>

        <Divider />

        {/* Services */}
        <View style={styles.section}>
          <Text variant="titleSm">Serviços</Text>
          <View style={styles.servicesList}>
            {MOCK_SERVICES.map((s) => (
              <View key={s.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text variant="titleSm">{s.title}</Text>
                  <Text variant="labelLg" color={colors.neutral[500]}>{s.description}</Text>
                  <View style={styles.serviceMeta}>
                    <Clock color={colors.neutral[400]} size={12} />
                    <Text variant="labelSm" color={colors.neutral[500]}>{s.duration}</Text>
                  </View>
                </View>
                <View style={styles.serviceRight}>
                  <Text variant="titleSm" color={colors.primary.default}>{s.price}</Text>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => router.push(`/(client)/(orders)/checkout/${s.id}` as any)}
                  >
                    Agendar
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleSm">Avaliações</Text>
            <Text variant="labelLg" color={colors.primary.default}>Ver todas</Text>
          </View>
          <View style={styles.reviewsList}>
            {MOCK_REVIEWS.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Avatar name={r.clientName} size="sm" />
                  <View style={styles.reviewInfo}>
                    <Text variant="titleSm">{r.clientName}</Text>
                    <StarRating rating={r.rating} />
                  </View>
                  <Text variant="labelSm" color={colors.neutral[400]}>{r.date}</Text>
                </View>
                <Text variant="bodySm" color={colors.neutral[600]}>{r.comment}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          variant="secondary"
          size="lg"
          fullWidth={false}
          leftIcon={<MessageCircle color={colors.primary.default} size={20} />}
          onPress={() => {}}
        >
          Mensagem
        </Button>
        <View style={styles.ctaMain}>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Phone color="#FFFFFF" size={20} />}
            onPress={() => {}}
          >
            Contratar
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  profileHeader: { alignItems: 'center', gap: spacing[2], paddingTop: spacing[2] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingVertical: spacing[4],
  },
  stat: { alignItems: 'center', gap: spacing[1] },
  statDivider: { width: 1, height: 32, backgroundColor: colors.neutral[200] },
  infoRow: { flexDirection: 'row', gap: spacing[4], justifyContent: 'center' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  servicesList: { gap: spacing[2] },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
    gap: spacing[3],
  },
  serviceInfo: { flex: 1, gap: spacing[1] },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: spacing[1] },
  serviceRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  reviewsList: { gap: spacing[3] },
  reviewCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
    gap: spacing[2],
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  reviewInfo: { flex: 1, gap: 2 },
  starRow: { flexDirection: 'row', gap: 2 },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  ctaMain: { flex: 1 },
});
