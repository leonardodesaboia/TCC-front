import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LocateFixed, MapPin } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { FormField } from '@/components/forms/FormField';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { PinLocationPicker, type Coordinates } from '@/components/maps/PinLocationPicker';
import { Button, Input, Text } from '@/components/ui';
import { useAddresses, useLookupAddress, useUpdateAddress } from '@/lib/hooks/useAddresses';
import { maskZipCode, normalizeStateCode, normalizeZipCode } from '@/lib/utils/address-format';
import { colors, spacing } from '@/theme';

const DEFAULT_PIN: Coordinates = {
  lat: -3.731862,
  lng: -38.526669,
};

export default function EditAddressScreen() {
  const router = useRouter();
  const { addressId } = useLocalSearchParams<{ addressId: string }>();
  const addressesQuery = useAddresses();
  const updateAddress = useUpdateAddress(addressId);
  const lookupAddress = useLookupAddress();

  const address = (addressesQuery.data ?? []).find((item) => item.id === addressId);

  const [label, setLabel] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState<Coordinates | null>(null);
  const [lookupDisplayName, setLookupDisplayName] = useState<string | null>(null);
  const [initializedAddressId, setInitializedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (!address || initializedAddressId === address.id) return;

    setLabel(address.label);
    setZipCode(address.zipCode);
    setStreet(address.street);
    setNumber(address.number);
    setComplement(address.complement ?? '');
    setDistrict(address.district);
    setCity(address.city);
    setState(address.state);
    setPin(
      address.lat !== null && address.lng !== null
        ? { lat: address.lat, lng: address.lng }
        : null,
    );
    setLookupDisplayName(null);
    setInitializedAddressId(address.id);
  }, [address, initializedAddressId]);

  const hasRequiredAddressFields =
    normalizeZipCode(zipCode).length === 9 &&
    street.trim().length > 0 &&
    number.trim().length > 0 &&
    district.trim().length > 0 &&
    city.trim().length > 0 &&
    normalizeStateCode(state).length === 2;

  const canSave =
    label.trim().length > 0 &&
    hasRequiredAddressFields &&
    !!pin &&
    Number.isFinite(pin.lat) &&
    Number.isFinite(pin.lng);

  function clearLookupResult() {
    setLookupDisplayName(null);
  }

  function handleChooseOnMap() {
    setPin((current) => current ?? DEFAULT_PIN);
    clearLookupResult();
  }

  async function handleLookup() {
    if (!hasRequiredAddressFields) return;

    try {
      const result = await lookupAddress.mutateAsync({
        zipCode: normalizeZipCode(zipCode),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim() || undefined,
        district: district.trim(),
        city: city.trim(),
        state: normalizeStateCode(state),
      });

      setPin({ lat: result.lat, lng: result.lng });
      setLookupDisplayName(result.displayName ?? null);
    } catch {
      // O hook ja apresenta o erro via toast.
    }
  }

  async function handleSave() {
    if (!canSave || !pin) return;

    await updateAddress.mutateAsync({
      label: label.trim(),
      zipCode: normalizeZipCode(zipCode),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      district: district.trim(),
      city: city.trim(),
      state: normalizeStateCode(state),
      lat: pin.lat,
      lng: pin.lng,
    });

    router.back();
  }

  if (addressesQuery.isLoading) {
    return <LoadingScreen message="Carregando endereço..." />;
  }

  if (addressesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar o endereço."
        onRetry={() => addressesQuery.refetch()}
      />
    );
  }

  if (!address) {
    return <ErrorState message="Endereço não encontrado." onRetry={() => router.back()} />;
  }

  return (
    <Screen edges={['top']}>
      <Header title="Editar endereço" showBack />

      <View style={styles.form}>
        <FormField label="Apelido (ex: Casa, Trabalho)">
          <Input value={label} onChangeText={setLabel} placeholder="Ex: Casa" />
        </FormField>

        <FormField label="CEP">
          <Input
            value={zipCode}
            onChangeText={(value) => {
              setZipCode(maskZipCode(value));
              clearLookupResult();
            }}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
          />
        </FormField>

        <FormField label="Rua">
          <Input
            value={street}
            onChangeText={(value) => {
              setStreet(value);
              clearLookupResult();
            }}
            placeholder="Nome da rua"
          />
        </FormField>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <FormField label="Número">
              <Input
                value={number}
                onChangeText={(value) => {
                  setNumber(value);
                  clearLookupResult();
                }}
                placeholder="Nº"
              />
            </FormField>
          </View>
          <View style={styles.flex2}>
            <FormField label="Complemento">
              <Input value={complement} onChangeText={setComplement} placeholder="Apto, bloco..." />
            </FormField>
          </View>
        </View>

        <FormField label="Bairro">
          <Input
            value={district}
            onChangeText={(value) => {
              setDistrict(value);
              clearLookupResult();
            }}
            placeholder="Bairro"
          />
        </FormField>

        <View style={styles.row}>
          <View style={styles.flex2}>
            <FormField label="Cidade">
              <Input
                value={city}
                onChangeText={(value) => {
                  setCity(value);
                  clearLookupResult();
                }}
                placeholder="Cidade"
              />
            </FormField>
          </View>
          <View style={styles.flex1}>
            <FormField label="Estado">
              <Input
                value={state}
                onChangeText={(value) => {
                  setState(normalizeStateCode(value));
                  clearLookupResult();
                }}
                placeholder="UF"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={2}
              />
            </FormField>
          </View>
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <MapPin color={colors.neutral[700]} size={18} />
            <View style={styles.flex1}>
              <Text variant="titleSm">Localização no mapa</Text>
              <Text variant="labelLg" color={colors.neutral[500]}>
                Ajuste o pin salvo ou use a API apenas para sugerir outro ponto.
              </Text>
            </View>
          </View>

          <View style={styles.mapActions}>
            <View style={styles.flex1}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<MapPin color={colors.primary.default} size={18} />}
                onPress={handleChooseOnMap}
              >
                Escolher no mapa
              </Button>
            </View>
            <View style={styles.flex1}>
              <Button
                variant="ghost"
                size="md"
                leftIcon={<LocateFixed color={colors.primary.default} size={18} />}
                onPress={handleLookup}
                disabled={!hasRequiredAddressFields}
                loading={lookupAddress.isPending}
              >
                Usar API
              </Button>
            </View>
          </View>

          {pin ? (
            <View style={styles.mapResult}>
              <PinLocationPicker value={pin} onChange={setPin} />
              {lookupDisplayName ? (
                <Text variant="labelSm" color={colors.neutral[500]}>
                  Resultado aproximado: {lookupDisplayName}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyMap}>
              <MapPin color={colors.neutral[400]} size={22} />
              <Text variant="labelLg" color={colors.neutral[500]}>
                Abra o mapa e toque no ponto exato do atendimento.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleSave}
          disabled={!canSave}
          loading={updateAddress.isPending}
        >
          Salvar alterações
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[3] },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  mapSection: {
    gap: spacing[3],
    paddingTop: spacing[2],
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  mapResult: {
    gap: spacing[2],
  },
  mapActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  emptyMap: {
    minHeight: 128,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.neutral[300],
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
  },
  footer: { paddingTop: spacing[6] },
});
