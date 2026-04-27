import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DollarSign, MapPin, MessageCircle, Phone, Star } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Button, Divider, Text } from '@/components/ui';
import { OrderStatusBadge } from '@/components/client/orders/OrderStatusBadge';
import { colors, radius, spacing } from '@/theme';

interface TimelineStep {
  label: string;
  date: string;
  completed: boolean;
  active: boolean;
}

interface Proposal {
  id: string;
  professionalName: string;
  rating: string;
  reviewCount: string;
  proposedAmount: string;
  respondedAt: string;
}

const MOCK_ORDER = {
  id: 'ORD-001',
  categoryName: 'Eletricista',
  areaName: 'Elétrica',
  description: 'Preciso trocar duas tomadas na sala e instalar uma nova na cozinha. A fiação já está pronta.',
  status: 'pending' as const,
  address: 'Rua das Flores, 123, Apt 401 - Centro, Fortaleza - CE',
  createdAt: '27 de Abril, 2026 às 10:30',
  professional: null as { name: string; profession: string } | null,
  totalAmount: null as string | null,
};

const MOCK_PROPOSALS: Proposal[] = [
  { id: 'p1', professionalName: 'Carlos Mendes', rating: '4.9', reviewCount: '127', proposedAmount: 'R$ 150,00', respondedAt: 'Há 5 min' },
  { id: 'p2', professionalName: 'João Silva', rating: '4.7', reviewCount: '85', proposedAmount: 'R$ 130,00', respondedAt: 'Há 12 min' },
  { id: 'p3', professionalName: 'André Costa', rating: '4.5', reviewCount: '42', proposedAmount: 'R$ 170,00', respondedAt: 'Há 18 min' },
];

const MOCK_TIMELINE: TimelineStep[] = [
  { label: 'Pedido criado', date: '27/04 às 10:30', completed: true, active: false },
  { label: 'Buscando profissionais', date: '', completed: false, active: true },
  { label: 'Proposta aceita', date: '', completed: false, active: false },
  { label: 'Serviço realizado', date: '', completed: false, active: false },
  { label: 'Confirmado pelo cliente', date: '', completed: false, active: false },
];

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <View style={styles.infoText}>
        <Text variant="labelLg" color={colors.neutral[500]}>{label}</Text>
        <Text variant="bodySm">{value}</Text>
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const o = MOCK_ORDER;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Detalhes do pedido" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <View style={styles.statusSection}>
          <OrderStatusBadge status={o.status} />
          <Text variant="titleLg">{o.categoryName}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{o.description}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text variant="titleSm">Acompanhamento</Text>
          <View style={styles.timeline}>
            {MOCK_TIMELINE.map((step, i) => (
              <View key={i} style={styles.timelineStep}>
                <View style={styles.timelineDotCol}>
                  <View style={[
                    styles.timelineDot,
                    step.completed && styles.timelineDotCompleted,
                    step.active && styles.timelineDotActive,
                  ]} />
                  {i < MOCK_TIMELINE.length - 1 ? (
                    <View style={[
                      styles.timelineLine,
                      step.completed && styles.timelineLineCompleted,
                    ]} />
                  ) : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    variant={step.active ? 'titleSm' : 'bodySm'}
                    color={step.completed || step.active ? colors.neutral[900] : colors.neutral[400]}
                  >
                    {step.label}
                  </Text>
                  {step.date ? (
                    <Text variant="labelSm" color={colors.neutral[400]}>{step.date}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* Proposals (shown when status is pending) */}
        {o.status === 'pending' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleSm">Propostas recebidas</Text>
              <Badge label={`${MOCK_PROPOSALS.length}`} variant="default" />
            </View>
            {MOCK_PROPOSALS.length === 0 ? (
              <View style={styles.waitingCard}>
                <Text variant="bodySm" color={colors.neutral[500]} style={styles.centered}>
                  Aguardando propostas de profissionais próximos...
                </Text>
              </View>
            ) : (
              <View style={styles.proposalList}>
                {MOCK_PROPOSALS.map((p) => (
                  <View key={p.id} style={styles.proposalCard}>
                    <View style={styles.proposalTop}>
                      <Avatar name={p.professionalName} size="md" backgroundColor={colors.primary.default} />
                      <View style={styles.proposalInfo}>
                        <Text variant="titleSm">{p.professionalName}</Text>
                        <View style={styles.ratingRow}>
                          <Star color={colors.warning} fill={colors.warning} size={12} />
                          <Text variant="labelLg">{p.rating}</Text>
                          <Text variant="labelSm" color={colors.neutral[500]}>({p.reviewCount})</Text>
                        </View>
                      </View>
                      <View style={styles.proposalPrice}>
                        <Text variant="titleSm" color={colors.primary.default}>{p.proposedAmount}</Text>
                        <Text variant="labelSm" color={colors.neutral[400]}>{p.respondedAt}</Text>
                      </View>
                    </View>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => {}}
                    >
                      Aceitar proposta
                    </Button>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* Professional (shown when accepted) */}
        {o.professional ? (
          <>
            <View style={styles.section}>
              <Text variant="titleSm">Profissional</Text>
              <View style={styles.professionalCard}>
                <Avatar name={o.professional.name} size="lg" backgroundColor={colors.primary.default} />
                <View style={styles.professionalInfo}>
                  <Text variant="titleSm">{o.professional.name}</Text>
                  <Text variant="bodySm" color={colors.neutral[500]}>{o.professional.profession}</Text>
                </View>
                <View style={styles.contactBtns}>
                  <Pressable style={styles.iconBtn}>
                    <Phone color={colors.primary.default} size={18} />
                  </Pressable>
                  <Pressable style={styles.iconBtn}>
                    <MessageCircle color={colors.primary.default} size={18} />
                  </Pressable>
                </View>
              </View>
            </View>
            <Divider />
          </>
        ) : null}

        {/* Details */}
        <View style={styles.section}>
          <Text variant="titleSm">Detalhes</Text>
          <InfoRow
            icon={<MapPin color={colors.neutral[400]} size={18} />}
            label="Endereço"
            value={o.address}
          />
        </View>

        {/* Payment (when total is known) */}
        {o.totalAmount ? (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="titleSm">Pagamento</Text>
              <View style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Valor proposto</Text>
                  <Text variant="bodySm">{o.totalAmount}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text variant="bodySm" color={colors.neutral[600]}>Taxa da plataforma</Text>
                  <Text variant="bodySm" color={colors.neutral[500]}>Inclusa</Text>
                </View>
                <Divider />
                <View style={styles.paymentRow}>
                  <Text variant="titleSm">Total</Text>
                  <Text variant="titleSm" color={colors.primary.default}>{o.totalAmount}</Text>
                </View>
                <View style={styles.paymentMethod}>
                  <DollarSign color={colors.neutral[400]} size={16} />
                  <Text variant="labelLg" color={colors.neutral[500]}>Pix</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <Button variant="secondary" size="lg" onPress={() => {}}>
          Cancelar pedido
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  statusSection: { alignItems: 'center', gap: spacing[2], paddingTop: spacing[2] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  centered: { textAlign: 'center' },
  timeline: { gap: 0 },
  timelineStep: { flexDirection: 'row', minHeight: 44 },
  timelineDotCol: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  timelineDotCompleted: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  timelineDotActive: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.light,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.neutral[200],
    marginVertical: 2,
  },
  timelineLineCompleted: { backgroundColor: colors.primary.default },
  timelineContent: { flex: 1, paddingLeft: spacing[2], paddingBottom: spacing[3] },
  waitingCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[6],
  },
  proposalList: { gap: spacing[3] },
  proposalCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  proposalTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  proposalInfo: { flex: 1, gap: 2 },
  proposalPrice: { alignItems: 'flex-end', gap: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
  },
  professionalInfo: { flex: 1, gap: 2 },
  contactBtns: { flexDirection: 'row', gap: spacing[2] },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  infoText: { flex: 1, gap: 2 },
  paymentCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    gap: spacing[3],
  },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
