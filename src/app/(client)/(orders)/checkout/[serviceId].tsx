import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Check, Clock, MapPin, Shield } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Divider, Text } from '@/components/ui';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useProfessional } from '@/lib/hooks/useProfessionals';
import { useProfessionalService } from '@/lib/hooks/useServices';
import { colors, radius, spacing } from '@/theme';

const MOCK_DATES = [
  { id: 'd1', label: 'Hoje', sublabel: '27 Abr', available: true },
  { id: 'd2', label: 'Amanhã', sublabel: '28 Abr', available: true },
  { id: 'd3', label: 'Qua', sublabel: '29 Abr', available: true },
  { id: 'd4', label: 'Qui', sublabel: '30 Abr', available: false },
  { id: 'd5', label: 'Sex', sublabel: '01 Mai', available: true },
];

const MOCK_TIMES = [
  { id: 't1', label: '08:00', available: true },
  { id: 't2', label: '09:00', available: true },
  { id: 't3', label: '10:00', available: false },
  { id: 't4', label: '11:00', available: true },
  { id: 't5', label: '14:00', available: true },
  { id: 't6', label: '15:00', available: true },
  { id: 't7', label: '16:00', available: true },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDuration(minutes?: number) {
  if (!minutes) return 'Sob consulta';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}min` : `${hours}h`;
}

export default function CheckoutScreen() {
  const { serviceId, professionalId } = useLocalSearchParams<{ serviceId: string; professionalId?: string }>();
  const router = useRouter();

  const serviceQuery = useProfessionalService(professionalId ?? '', serviceId);
  const professionalQuery = useProfessional(professionalId ?? '');
  const addressesQuery = useAddresses();

  const [selectedDate, setSelectedDate] = useState('d1');
  const [selectedTime, setSelectedTime] = useState('t1');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const addresses = addressesQuery.data ?? [];

  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      setSelectedAddress(addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? null);
    }
  }, [addresses, selectedAddress]);

  if (!professionalId) {
    return <ErrorState message="Abra o checkout a partir da tela do profissional." />;
  }

  if (serviceQuery.isLoading || professionalQuery.isLoading || addressesQuery.isLoading) {
    return <LoadingScreen message="Carregando checkout..." />;
  }

  if (serviceQuery.isError || professionalQuery.isError || addressesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar esse checkout."
        onRetry={() => {
          void serviceQuery.refetch();
          void professionalQuery.refetch();
          void addressesQuery.refetch();
        }}
      />
    );
  }

  const service = serviceQuery.data;
  const professional = professionalQuery.data;

  if (!service || !professional) {
    return <ErrorState message="Serviço ou profissional não encontrado." />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Agendar serviço" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.serviceCard}>
          <Avatar name={professional.name} size="md" backgroundColor={colors.primary.default} />
          <View style={styles.serviceInfo}>
            <Text variant="titleSm">{service.name}</Text>
            <Text variant="bodySm" color={colors.neutral[500]}>
              {professional.name} · {formatDuration(service.durationInMinutes)}
            </Text>
          </View>
          <Text variant="titleSm" color={colors.primary.default}>{formatMoney(service.price)}</Text>
        </View>

        {USE_MOCKS_ENABLED ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar color={colors.neutral[700]} size={18} />
                <Text variant="titleSm">Escolha a data</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {MOCK_DATES.map((d) => (
                  <Pressable
                    key={d.id}
                    disabled={!d.available}
                    onPress={() => setSelectedDate(d.id)}
                    style={[
                      styles.dateChip,
                      selectedDate === d.id && styles.dateChipSelected,
                      !d.available && styles.chipDisabled,
                    ]}
                  >
                    <Text
                      variant="labelLg"
                      color={selectedDate === d.id ? '#FFFFFF' : d.available ? colors.neutral[700] : colors.neutral[400]}
                    >
                      {d.label}
                    </Text>
                    <Text
                      variant="labelSm"
                      color={selectedDate === d.id ? '#FFFFFF' : d.available ? colors.neutral[500] : colors.neutral[300]}
                    >
                      {d.sublabel}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock color={colors.neutral[700]} size={18} />
                <Text variant="titleSm">Escolha o horário</Text>
              </View>
              <View style={styles.timeGrid}>
                {MOCK_TIMES.map((t) => (
                  <Pressable
                    key={t.id}
                    disabled={!t.available}
                    onPress={() => setSelectedTime(t.id)}
                    style={[
                      styles.timeChip,
                      selectedTime === t.id && styles.timeChipSelected,
                      !t.available && styles.chipDisabled,
                    ]}
                  >
                    <Text
                      variant="labelLg"
                      color={selectedTime === t.id ? '#FFFFFF' : t.available ? colors.neutral[700] : colors.neutral[400]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          <EmptyState
            icon={Calendar}
            title="Fluxo on-demand ainda não disponível"
            description="O backend atual documentado ainda não expõe o checkout/agendamento direto para serviços on-demand."
          />
        )}

        <Divider />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Endereço</Text>
          </View>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Pressable
                key={address.id}
                onPress={() => setSelectedAddress(address.id)}
                style={[styles.addressCard, selectedAddress === address.id && styles.addressCardSelected]}
              >
                <View style={styles.addressInfo}>
                  <Text variant="titleSm">{address.label}</Text>
                  <Text variant="labelLg" color={colors.neutral[500]} numberOfLines={2}>
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ''} - {address.district}, {address.city}
                  </Text>
                </View>
                {selectedAddress === address.id ? (
                  <View style={styles.checkCircle}>
                    <Check color="#FFFFFF" size={14} />
                  </View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </Pressable>
            ))
          ) : (
            <EmptyState
              icon={MapPin}
              title="Sem endereço cadastrado"
              description="Cadastre um endereço antes de continuar."
              actionLabel="Cadastrar endereço"
              onAction={() => router.push('/(client)/(profile)/addresses/new')}
            />
          )}
        </View>

        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={20} />
          <Text variant="labelLg" color={colors.neutral[600]} style={styles.guaranteeText}>
            Pagamento protegido. O valor só é liberado após a conclusão do serviço.
          </Text>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text variant="labelLg" color={colors.neutral[500]}>Total</Text>
          <Text variant="titleLg" color={colors.primary.default}>{formatMoney(service.price)}</Text>
        </View>
        <View style={styles.ctaBtn}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.back()}
            disabled={!USE_MOCKS_ENABLED || !selectedAddress}
          >
            {USE_MOCKS_ENABLED ? 'Confirmar agendamento' : 'Indisponível no backend atual'}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
  },
  serviceInfo: { flex: 1, gap: 2 },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  chipScroll: { gap: spacing[2] },
  dateChip: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    minWidth: 72,
  },
  dateChipSelected: { backgroundColor: colors.neutral[900] },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  timeChip: {
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  timeChipSelected: { backgroundColor: colors.neutral[900] },
  chipDisabled: { opacity: 0.4 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  addressCardSelected: { borderColor: colors.primary.default, backgroundColor: colors.primary.light },
  addressInfo: { flex: 1, gap: spacing[1] },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  guaranteeCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  guaranteeText: { flex: 1 },
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
