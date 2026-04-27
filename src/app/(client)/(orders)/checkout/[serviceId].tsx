import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Check, Clock, MapPin, Shield } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Divider, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const MOCK_SERVICE = {
  title: 'Instalação de tomada',
  price: 'R$ 80,00',
  duration: '30 min',
  professional: {
    name: 'Carlos Mendes',
    profession: 'Eletricista',
  },
};

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

const MOCK_ADDRESSES = [
  { id: 'a1', label: 'Casa', address: 'Rua das Flores, 123, Apt 401 - Centro, Fortaleza' },
  { id: 'a2', label: 'Trabalho', address: 'Av. Santos Dumont, 1500 - Aldeota, Fortaleza' },
];

export default function CheckoutScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('d1');
  const [selectedTime, setSelectedTime] = useState('t1');
  const [selectedAddress, setSelectedAddress] = useState('a1');
  const [notes, setNotes] = useState('');

  const s = MOCK_SERVICE;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Agendar serviço" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Service summary */}
        <View style={styles.serviceCard}>
          <Avatar name={s.professional.name} size="md" backgroundColor={colors.primary.default} />
          <View style={styles.serviceInfo}>
            <Text variant="titleSm">{s.title}</Text>
            <Text variant="bodySm" color={colors.neutral[500]}>{s.professional.name} · {s.duration}</Text>
          </View>
          <Text variant="titleSm" color={colors.primary.default}>{s.price}</Text>
        </View>

        {/* Date selection */}
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

        {/* Time selection */}
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

        <Divider />

        {/* Address selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Endereço</Text>
          </View>
          {MOCK_ADDRESSES.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => setSelectedAddress(a.id)}
              style={[styles.addressCard, selectedAddress === a.id && styles.addressCardSelected]}
            >
              <View style={styles.addressInfo}>
                <Text variant="titleSm">{a.label}</Text>
                <Text variant="labelLg" color={colors.neutral[500]} numberOfLines={2}>{a.address}</Text>
              </View>
              {selectedAddress === a.id ? (
                <View style={styles.checkCircle}>
                  <Check color="#FFFFFF" size={14} />
                </View>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Guarantee */}
        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={20} />
          <Text variant="labelLg" color={colors.neutral[600]} style={styles.guaranteeText}>
            Pagamento protegido. O valor só é liberado após a conclusão do serviço.
          </Text>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text variant="labelLg" color={colors.neutral[500]}>Total</Text>
          <Text variant="titleLg" color={colors.primary.default}>{s.price}</Text>
        </View>
        <View style={styles.ctaBtn}>
          <Button variant="primary" size="lg" onPress={() => router.back()}>
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
