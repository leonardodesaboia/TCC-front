import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, layout, radius, shadows, spacing } from '@/theme';

interface DayOption {
  id: string;
  shortLabel: string;
  dayNumber: string;
  marker?: string;
}

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
}

interface DiscoveryItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  footer: string;
  accentColor: string;
}

const DAY_OPTIONS: DayOption[] = [
  { id: '28', shortLabel: 'SEG', dayNumber: '28', marker: 'Hoje' },
  { id: '29', shortLabel: 'TER', dayNumber: '29' },
  { id: '30', shortLabel: 'QUA', dayNumber: '30' },
  { id: '01', shortLabel: 'QUI', dayNumber: '01', marker: '2' },
  { id: '02', shortLabel: 'SEX', dayNumber: '02' },
];

const TODAY_FLOW: TimelineItem[] = [
  {
    id: 'visit',
    title: 'Visita confirmada',
    subtitle: 'Limpeza residencial com Mariana Costa',
    meta: '14:00 • Rua Silva Jardim, 210',
  },
  {
    id: 'next',
    title: 'Próxima decisão',
    subtitle: 'Revisar o pedido de manutenção do ar-condicionado',
    meta: 'Qui • 09:30',
  },
];

const DISCOVERIES: DiscoveryItem[] = [
  {
    id: 'd1',
    badge: 'Mais contratada',
    title: 'Ana Beatriz',
    subtitle: 'Faxina e organização para apartamentos compactos',
    footer: '4,9 • 128 avaliações',
    accentColor: '#F1B17A',
  },
  {
    id: 'd2',
    badge: 'Resposta rápida',
    title: 'Caio Lima',
    subtitle: 'Elétrica residencial para pequenos reparos e instalação',
    footer: '4,8 • Atende hoje',
    accentColor: '#D97A2B',
  },
];

function DayPill({
  option,
  active,
  onPress,
}: {
  option: DayOption;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.dayPill, active && styles.dayPillActive]}>
      <Text
        variant="labelLg"
        color={active ? colors.neutral[50] : colors.neutral[500]}
      >
        {option.shortLabel}
      </Text>
      <Text
        variant="titleSm"
        color={active ? colors.neutral[50] : colors.secondary.default}
      >
        {option.dayNumber}
      </Text>
      <Text
        variant="labelSm"
        color={active ? '#FFE8D4' : option.marker ? colors.primary.default : colors.neutral[500]}
      >
        {option.marker ?? ' '}
      </Text>
    </Pressable>
  );
}

function TimelineCard({ item, last }: { item: TimelineItem; last?: boolean }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        {!last ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineCard}>
        <Text variant="titleSm">{item.title}</Text>
        <Text color={colors.secondary.light}>{item.subtitle}</Text>
        <Text variant="labelLg" color={colors.neutral[500]}>
          {item.meta}
        </Text>
      </View>
    </View>
  );
}

function DiscoveryCard({
  item,
  onPress,
}: {
  item: DiscoveryItem;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.discoveryCard}>
      <View style={[styles.discoveryHero, { backgroundColor: item.accentColor }]}>
        <View style={styles.discoveryBadge}>
          <Text variant="labelLg" color={colors.secondary.default}>
            {item.badge}
          </Text>
        </View>
        <View style={styles.discoveryAvatar}>
          <Text variant="titleLg" color={colors.neutral[50]}>
            {item.title.slice(0, 1)}
          </Text>
        </View>
      </View>

      <View style={styles.discoveryBody}>
        <Text variant="titleSm">{item.title}</Text>
        <Text color={colors.secondary.light}>{item.subtitle}</Text>
        <View style={styles.discoveryFooter}>
          <Text variant="labelLg" color={colors.neutral[500]}>
            {item.footer}
          </Text>
          <View style={styles.discoveryAction}>
            <Text variant="labelLg" color={colors.primary.default}>
              Conhecer
            </Text>
            <ArrowRight color={colors.primary.default} size={16} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDayId, setSelectedDayId] = useState(DAY_OPTIONS[0]?.id ?? '');

  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Cliente', [user?.name]);

  return (
    <Screen edges={['top']} style={styles.screenContent}>
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <View style={styles.topBar}>
        <View style={styles.topBarText}>
          <Text variant="labelLg" color={colors.primary.default}>
            ALLSET CASA
          </Text>
          <Text variant="displaySm">{firstName}, seu dia está sob controle.</Text>
        </View>

        <Pressable
          onPress={() => router.push('/(client)/(home)/notifications')}
          style={styles.notificationButton}
        >
          <Bell color={colors.primary.default} size={20} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View style={styles.heroHeader}>
          <View style={styles.heroBadge}>
            <Sparkles color={colors.secondary.default} size={14} />
            <Text variant="labelLg" color={colors.secondary.default}>
              PAINEL DO DIA
            </Text>
          </View>
          <Text variant="labelLg" color={colors.secondary.default}>
            Hoje
          </Text>
        </View>

        <Text variant="displayMd" color={colors.secondary.default}>
          14:00
        </Text>
        <Text variant="titleSm">Limpeza residencial com Mariana Costa</Text>

        <View style={styles.heroMeta}>
          <View style={styles.heroMetaItem}>
            <Clock3 color={colors.neutral[500]} size={16} />
            <Text color={colors.neutral[500]}>Duas horas reservadas</Text>
          </View>
          <View style={styles.heroMetaItem}>
            <MapPin color={colors.neutral[500]} size={16} />
            <Text color={colors.neutral[500]}>Rua Silva Jardim, 210</Text>
          </View>
        </View>
      </View>

      <View style={styles.twoColumnSection}>
        <View style={styles.weekCard}>
          <View style={styles.sectionHeaderCompact}>
            <Text variant="titleSm">Semana</Text>
            <CalendarDays color={colors.primary.default} size={18} />
          </View>
          <View style={styles.dayGrid}>
            {DAY_OPTIONS.map((option) => (
              <DayPill
                key={option.id}
                option={option}
                active={option.id === selectedDayId}
                onPress={() => setSelectedDayId(option.id)}
              />
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(client)/(orders)')}
          style={styles.sideActionCard}
        >
          <Text variant="labelLg" color={colors.primary.default}>
            PEDIDOS
          </Text>
          <Text variant="titleSm">Ver linha completa</Text>
          <Text color={colors.neutral[500]}>
            Acompanhe os próximos serviços e mudanças de status.
          </Text>
          <View style={styles.sideActionFooter}>
            <Text variant="labelLg" color={colors.primary.default}>
              Abrir
            </Text>
            <ArrowRight color={colors.primary.default} size={16} />
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLg">Linha do dia</Text>
          <Text variant="labelLg" color={colors.primary.default}>
            foco
          </Text>
        </View>

        <View style={styles.timelineList}>
          {TODAY_FLOW.map((item, index) => (
            <TimelineCard
              key={item.id}
              item={item}
              last={index === TODAY_FLOW.length - 1}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLg">Descobertas</Text>
          <Pressable onPress={() => router.push('/(client)/(search)')}>
            <View style={styles.discoveryHeaderAction}>
              <Compass color={colors.primary.default} size={16} />
              <Text variant="labelLg" color={colors.primary.default}>
                Explorar
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.discoveryList}>
          {DISCOVERIES.map((item) => (
            <DiscoveryCard
              key={item.id}
              item={item}
              onPress={() => router.push('/(client)/(search)')}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: spacing[6],
    paddingBottom: spacing[8],
    backgroundColor: '#FFF7F0',
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -80,
    right: -54,
    width: 210,
    height: 210,
    borderRadius: radius.full,
    backgroundColor: 'rgba(233, 137, 54, 0.10)',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: 120,
    left: -64,
    width: 180,
    height: 180,
    borderRadius: radius.full,
    backgroundColor: 'rgba(92, 47, 18, 0.06)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  topBarText: {
    flex: 1,
    gap: spacing[1],
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    ...shadows.sm,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    gap: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: '#FFE7D2',
    padding: spacing[5],
  },
  heroGlowOne: {
    position: 'absolute',
    top: -30,
    right: -18,
    width: 132,
    height: 132,
    borderRadius: radius.full,
    backgroundColor: 'rgba(233, 137, 54, 0.18)',
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -48,
    left: -28,
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: 'rgba(92, 47, 18, 0.08)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.56)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  heroMeta: {
    gap: spacing[2],
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  twoColumnSection: {
    gap: spacing[3],
  },
  weekCard: {
    gap: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    padding: layout.cardPadding,
    ...shadows.sm,
  },
  sectionHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  dayGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.lg,
    backgroundColor: '#FFF3E8',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  dayPillActive: {
    backgroundColor: colors.primary.default,
  },
  sideActionCard: {
    gap: spacing[2],
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    padding: layout.cardPadding,
    ...shadows.sm,
  },
  sideActionFooter: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  section: {
    gap: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  timelineList: {
    gap: spacing[3],
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'stretch',
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary.default,
    marginTop: spacing[3],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: spacing[1],
    backgroundColor: '#F2D1B6',
  },
  timelineCard: {
    flex: 1,
    gap: spacing[2],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    ...shadows.sm,
  },
  discoveryHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  discoveryList: {
    gap: spacing[4],
  },
  discoveryCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.neutral[50],
    ...shadows.md,
  },
  discoveryHero: {
    minHeight: 132,
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  discoveryBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  discoveryAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.default,
  },
  discoveryBody: {
    gap: spacing[3],
    padding: spacing[4],
  },
  discoveryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  discoveryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
