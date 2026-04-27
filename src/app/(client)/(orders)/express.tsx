import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, DollarSign, MapPin, Shield } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const MOCK_ADDRESSES = [
  { id: 'a1', label: 'Casa', address: 'Rua das Flores, 123, Apt 401 - Centro, Fortaleza' },
  { id: 'a2', label: 'Trabalho', address: 'Av. Santos Dumont, 1500 - Aldeota, Fortaleza' },
];

export default function ExpressOrderScreen() {
  const { areaName, categoryName } = useLocalSearchParams<{
    areaId: string;
    categoryId: string;
    areaName: string;
    categoryName: string;
  }>();
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('a1');
  const [addUrgency, setAddUrgency] = useState(false);

  const canSubmit = description.trim().length >= 10 && selectedAddress;

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Novo pedido Express" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Category info */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text>
            <Text variant="titleLg">{categoryName}</Text>
          </View>
          <Badge label="Express" variant="warning" />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text variant="titleSm">Descreva o que você precisa</Text>
          <Text variant="labelLg" color={colors.neutral[500]}>
            Quanto mais detalhes, melhores propostas você receberá
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Preciso trocar duas tomadas na sala e uma na cozinha. A fiação já está pronta."
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.textArea}
          />
          <Text variant="labelSm" color={description.trim().length < 10 ? colors.neutral[400] : colors.success}>
            {description.trim().length}/10 caracteres mínimos
          </Text>
        </View>

        <Divider />

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Endereço do serviço</Text>
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

        <Divider />

        {/* Urgency fee */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Taxa de urgência</Text>
          </View>
          <Pressable
            onPress={() => setAddUrgency(!addUrgency)}
            style={[styles.urgencyCard, addUrgency && styles.urgencyCardSelected]}
          >
            <View style={styles.addressInfo}>
              <Text variant="titleSm">Adicionar urgência</Text>
              <Text variant="labelLg" color={colors.neutral[500]}>
                Seu pedido terá prioridade na fila. Profissionais serão notificados primeiro.
              </Text>
            </View>
            {addUrgency ? (
              <View style={styles.checkCircle}>
                <Check color="#FFFFFF" size={14} />
              </View>
            ) : (
              <View style={styles.emptyCircle} />
            )}
          </Pressable>
          {addUrgency ? (
            <Text variant="labelLg" color={colors.warning}>
              + R$ 15,00 de taxa de urgência
            </Text>
          ) : null}
        </View>

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text variant="titleSm">Como funciona?</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">1</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>Você descreve o que precisa</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">2</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>Profissionais próximos enviam propostas</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">3</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>Você escolhe a melhor proposta</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">4</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>O chat abre e o serviço é realizado</Text>
          </View>
        </View>

        {/* Guarantee */}
        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={20} />
          <Text variant="labelLg" color={colors.neutral[600]} style={styles.guaranteeFlex}>
            Pagamento protegido. O valor só é liberado após a confirmação do serviço.
          </Text>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          onPress={() => router.replace('/(client)/(orders)')}
        >
          Enviar pedido
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  categoryInfo: { gap: spacing[1] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  textArea: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    minHeight: 120,
    fontSize: 14,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
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
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  urgencyCardSelected: { borderColor: colors.warning, backgroundColor: '#FEF3C7' },
  howItWorks: {
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  guaranteeFlex: { flex: 1 },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
