import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Check, Clock, MapPin, Shield } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Divider, Input, Text } from '@/components/ui';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useCreateOnDemandOrder } from '@/lib/hooks/useOrders';
import { useProfessional } from '@/lib/hooks/useProfessionals';
import { useProfessionalService } from '@/lib/hooks/useServices';
import { colors, radius, spacing } from '@/theme';

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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function CheckoutScreen() {
  const { serviceId, professionalId } = useLocalSearchParams<{ serviceId: string; professionalId?: string }>();
  const router = useRouter();

  const serviceQuery = useProfessionalService(professionalId ?? '', serviceId);
  const professionalQuery = useProfessional(professionalId ?? '');
  const addressesQuery = useAddresses();
  const createOnDemand = useCreateOnDemandOrder();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const [scheduledDate, setScheduledDate] = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [description, setDescription] = useState('');
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

  const canSubmit = !!selectedAddress && description.trim().length > 0 && scheduledDate > new Date();

  function handleSubmit() {
    if (!selectedAddress || !description.trim()) return;

    createOnDemand.mutate({
      serviceId,
      description: description.trim(),
      addressId: selectedAddress,
      scheduledAt: scheduledDate.toISOString(),
    });
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
          <Text variant="titleSm" color={colors.primary.default}>{formatMoney(service.effectivePrice)}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text variant="titleSm">Descreva o que você precisa</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Preciso trocar 3 tomadas na sala..."
            multiline
            numberOfLines={4}
            maxLength={2000}
            style={styles.descriptionInput}
          />
          <Text variant="labelSm" color={colors.neutral[400]}>
            {description.length}/2000
          </Text>
        </View>

        <Divider />

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Data e horário</Text>
          </View>

          <View style={styles.dateTimeRow}>
            <Pressable style={styles.dateTimeChip} onPress={() => setShowDatePicker(true)}>
              <Calendar color={colors.primary.default} size={16} />
              <Text variant="labelLg" color={colors.neutral[700]}>
                {formatDate(scheduledDate)}
              </Text>
            </Pressable>

            <Pressable style={styles.dateTimeChip} onPress={() => setShowTimePicker(true)}>
              <Clock color={colors.primary.default} size={16} />
              <Text variant="labelLg" color={colors.neutral[700]}>
                {formatTime(scheduledDate)}
              </Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(_event, date) => {
                setShowDatePicker(false);
                if (date) {
                  const updated = new Date(scheduledDate);
                  updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                  setScheduledDate(updated);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="time"
              is24Hour
              minuteInterval={30}
              onChange={(_event, date) => {
                setShowTimePicker(false);
                if (date) {
                  const updated = new Date(scheduledDate);
                  updated.setHours(date.getHours(), date.getMinutes());
                  setScheduledDate(updated);
                }
              }}
            />
          )}
        </View>

        <Divider />

        {/* Address */}
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
          <Text variant="titleLg" color={colors.primary.default}>{formatMoney(service.effectivePrice)}</Text>
        </View>
        <View style={styles.ctaBtn}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={createOnDemand.isPending}
          >
            Confirmar agendamento
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
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  dateTimeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
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
