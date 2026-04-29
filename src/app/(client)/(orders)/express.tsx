import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, DollarSign, MapPin, Shield } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { colors, radius, spacing } from '@/theme';

export default function ExpressOrderScreen() {
  const { areaId, categoryId, areaName, categoryName } = useLocalSearchParams<{
    areaId: string;
    categoryId: string;
    areaName: string;
    categoryName: string;
  }>();
  const router = useRouter();

  const addressesQuery = useAddresses();
  const createOrder = useCreateOrder();

  const [description, setDescription] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addUrgency, setAddUrgency] = useState(false);

  const addresses = addressesQuery.data ?? [];

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? null);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const canSubmit =
    description.trim().length >= 10 &&
    !!selectedAddress &&
    !!areaId &&
    !!categoryId &&
    Number.isFinite(selectedAddress.lat) &&
    Number.isFinite(selectedAddress.lng);

  async function handleSubmit() {
    if (!canSubmit || !selectedAddressId || !areaId || !categoryId) return;

    try {
      await createOrder.mutateAsync({
        areaId,
        categoryId,
        description: description.trim(),
        addressId: selectedAddressId,
        urgencyFee: addUrgency ? 15 : undefined,
      });
    } catch {
      // A mutation already surfaces the API message via toast.
    }
  }

  if (addressesQuery.isLoading) {
    return <LoadingScreen message="Carregando endereços..." />;
  }

  if (addressesQuery.isError) {
    return <ErrorState message="Não foi possível carregar seus endereços." onRetry={() => addressesQuery.refetch()} />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Novo pedido Express" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text>
            <Text variant="titleLg">{categoryName}</Text>
          </View>
          <Badge label="Express" variant="warning" />
        </View>

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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Endereço do serviço</Text>
          </View>

          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Pressable
                key={address.id}
                onPress={() => setSelectedAddressId(address.id)}
                style={[styles.addressCard, selectedAddressId === address.id && styles.addressCardSelected]}
              >
                <View style={styles.addressInfo}>
                  <Text variant="titleSm">{address.label}</Text>
                  <Text variant="labelLg" color={colors.neutral[500]} numberOfLines={2}>
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ''} - {address.district}, {address.city}
                  </Text>
                  {!Number.isFinite(address.lat) || !Number.isFinite(address.lng) ? (
                    <Text variant="labelSm" color={colors.error}>
                      Este endereço não possui coordenadas e não serve para Express.
                    </Text>
                  ) : null}
                </View>
                {selectedAddressId === address.id ? (
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
              title="Nenhum endereço disponível"
              description="Cadastre um endereço com latitude e longitude antes de abrir um pedido Express."
              actionLabel="Cadastrar endereço"
              onAction={() => router.push('/(client)/(profile)/addresses/new')}
            />
          )}
        </View>

        <Divider />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Taxa de urgência</Text>
          </View>
          <Pressable
            onPress={() => setAddUrgency((value) => !value)}
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

        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={20} />
          <Text variant="labelLg" color={colors.neutral[600]} style={styles.guaranteeFlex}>
            Pagamento protegido. O valor só é liberado após a confirmação do serviço.
          </Text>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          loading={createOrder.isPending}
          onPress={handleSubmit}
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
