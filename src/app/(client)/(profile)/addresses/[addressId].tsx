import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { FormField } from '@/components/forms/FormField';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { AddressPinSection } from '@/components/maps/AddressPinSection';
import { Button, Input, Text } from '@/components/ui';
import {
  useAddresses,
  useLookupAddress,
  useReverseGeocode,
  useUpdateAddress,
} from '@/lib/hooks/useAddresses';
import { useAddressPin } from '@/lib/hooks/useAddressPin';
import { compareWithGeocoded, describeFields } from '@/lib/utils/address-fill';
import { maskZipCode, normalizeStateCode, normalizeZipCode } from '@/lib/utils/address-format';
import type { GeocodedAddress } from '@/types/address';
import { colors, spacing } from '@/theme';

/** Espera a pessoa parar de arrastar o pin antes de consultar o endereço. */
const REVERSE_DEBOUNCE_MS = 700;

/** Espera a digitação assentar antes de buscar o endereço sozinho. */
const AUTO_LOOKUP_DEBOUNCE_MS = 900;

function addressKey(parts: string[]): string {
  return parts.join('|').toLowerCase();
}

export default function EditAddressScreen() {
  const router = useRouter();
  const { addressId } = useLocalSearchParams<{ addressId: string }>();
  const addressesQuery = useAddresses();
  const updateAddress = useUpdateAddress(addressId);
  const lookupAddress = useLookupAddress();
  // Busca automática não pede toast: a pessoa não pediu essa consulta.
  const autoSuggest = useLookupAddress({ silent: true });
  const reverseGeocode = useReverseGeocode();
  const pinState = useAddressPin();

  const address = (addressesQuery.data ?? []).find((item) => item.id === addressId);

  const [label, setLabel] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [divergenceWarning, setDivergenceWarning] = useState<string | null>(null);
  const [initializedAddressId, setInitializedAddressId] = useState<string | null>(null);
  const [needsReconfirmation, setNeedsReconfirmation] = useState(false);

  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoLookupKeyRef = useRef<string | null>(null);
  const formRef = useRef({ street, number, district, city, state, zipCode });
  formRef.current = { street, number, district, city, state, zipCode };

  const hydratePin = pinState.hydrate;

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

    // Coordenada antiga entra como ponto de partida no mapa, mas sem procedência:
    // a pessoa precisa reconfirmar antes de conseguir salvar.
    hydratePin(
      address.lat !== null && address.lng !== null ? { lat: address.lat, lng: address.lng } : null,
      address.coordinateSource,
      address.coordinateConfidence,
      address.coordinateAccuracyMeters,
    );
    setNeedsReconfirmation(
      address.lat !== null && address.lng !== null && !address.expressReady,
    );

    // Semeia a chave com o endereço que acabou de ser carregado: abrir a tela não
    // é digitar um endereço novo, então a busca automática não deve disparar aqui.
    lastAutoLookupKeyRef.current = addressKey([
      normalizeZipCode(address.zipCode),
      address.street.trim(),
      address.number.trim(),
      address.district.trim(),
      address.city.trim(),
      normalizeStateCode(address.state),
    ]);

    setDivergenceWarning(null);
    setInitializedAddressId(address.id);
  }, [address, hydratePin, initializedAddressId]);

  const hasRequiredAddressFields =
    normalizeZipCode(zipCode).length === 9 &&
    street.trim().length > 0 &&
    number.trim().length > 0 &&
    district.trim().length > 0 &&
    city.trim().length > 0 &&
    normalizeStateCode(state).length === 2;

  // Mesma regra do `isUsable()` do GeocodeRequest: CEP sozinho basta, ou rua + cidade.
  const canLookup =
    normalizeZipCode(zipCode).length === 9 || (street.trim().length > 0 && city.trim().length > 0);

  const autoLookupKey = hasRequiredAddressFields
    ? addressKey([
        normalizeZipCode(zipCode),
        street.trim(),
        number.trim(),
        district.trim(),
        city.trim(),
        normalizeStateCode(state),
      ])
    : null;

  const coordinatePayload = pinState.toPayload();
  const canSave = label.trim().length > 0 && hasRequiredAddressFields && !!coordinatePayload;

  const saveHint = !coordinatePayload
    ? 'Confirme o ponto no mapa para salvar.'
    : !hasRequiredAddressFields
      ? 'Preencha os campos do endereço para salvar.'
      : null;

  function clearSuggestion() {
    pinState.invalidate();
    setNeedsReconfirmation(true);
    setDivergenceWarning(null);
  }

  function applyGeocodedAddress(result: GeocodedAddress) {
    const { filled, divergent } = compareWithGeocoded(formRef.current, result);

    if (filled.street) setStreet(filled.street);
    if (filled.number) setNumber(filled.number);
    if (filled.district) setDistrict(filled.district);
    if (filled.city) setCity(filled.city);
    if (filled.state) setState(normalizeStateCode(filled.state));
    if (filled.zipCode) setZipCode(maskZipCode(filled.zipCode));

    setDivergenceWarning(
      divergent.length > 0
        ? `O ponto marcado fica em ${describeFields(divergent)} diferente do que você escreveu. Confira antes de salvar.`
        : null,
    );
  }

  function lookupPayload() {
    return {
      zipCode: normalizeZipCode(zipCode) || undefined,
      street: street.trim() || undefined,
      number: number.trim() || undefined,
      complement: complement.trim() || undefined,
      district: district.trim() || undefined,
      city: city.trim() || undefined,
      state: normalizeStateCode(state) || undefined,
    };
  }

  async function handleLookup() {
    if (!canLookup) return;

    try {
      const revision = pinState.getRevision();
      const result = await lookupAddress.mutateAsync(lookupPayload());
      if (!pinState.applySuggestion(result, revision)) return;
      applyGeocodedAddress(result);
      setNeedsReconfirmation(false);
    } catch {
      // O hook ja apresenta o erro via toast.
    }
  }

  /**
   * Editou o endereço escrito? Busca o novo lugar sozinho e reabre o mapa ali — a
   * pessoa só aproxima. Dispara uma vez por endereço distinto, e nunca por cima de
   * um ponto que ela já escolheu pelo GPS ou pelo dedo.
   */
  useEffect(() => {
    if (!autoLookupKey) return;
    if (lastAutoLookupKeyRef.current === autoLookupKey) return;
    if (pinState.origin === 'gps' || pinState.origin === 'manual') return;

    let cancelled = false;
    const revision = pinState.getRevision();
    const timer = setTimeout(() => {
      lastAutoLookupKeyRef.current = autoLookupKey;
      autoSuggest
        .mutateAsync(lookupPayload())
        .then((result) => {
          if (cancelled || !pinState.applySuggestion(result, revision)) return;
          applyGeocodedAddress(result);
          setNeedsReconfirmation(false);
        })
        .catch(() => {
          // Sem sugestão, o mapa continua disponível para marcação manual.
        });
    }, AUTO_LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLookupKey, pinState.origin]);

  function handlePinMoved(coordinates: { lat: number; lng: number }) {
    setDivergenceWarning(null);
    setNeedsReconfirmation(false);

    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
    const revision = pinState.getRevision();
    reverseTimerRef.current = setTimeout(() => {
      reverseGeocode
        .mutateAsync(coordinates)
        .then((result) => {
          if (revision === pinState.getRevision()) applyGeocodedAddress(result);
        })
        .catch(() => {
          // Conveniência, não obrigação: sem endereço reconhecido, segue o que foi digitado.
        });
    }, REVERSE_DEBOUNCE_MS);
  }

  async function handleSave() {
    if (!canSave || !coordinatePayload) return;

    await updateAddress.mutateAsync({
      label: label.trim(),
      zipCode: normalizeZipCode(zipCode),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      district: district.trim(),
      city: city.trim(),
      state: normalizeStateCode(state),
      ...coordinatePayload,
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
        {needsReconfirmation ? (
          <View style={styles.notice}>
            <Text variant="titleSm" color={colors.error}>
              Confirme o ponto deste endereço
            </Text>
            <Text variant="labelLg" color={colors.neutral[600]}>
              O ponto está aproximado ou o endereço foi alterado. Confirme no mapa
              a entrada do local do atendimento para poder usá-lo no Express.
            </Text>
          </View>
        ) : null}

        <FormField label="Apelido (ex: Casa, Trabalho)">
          <Input value={label} onChangeText={setLabel} placeholder="Ex: Casa" />
        </FormField>

        <FormField label="CEP">
          <Input
            value={zipCode}
            onChangeText={(value) => {
              setZipCode(maskZipCode(value));
              clearSuggestion();
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
              clearSuggestion();
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
                  clearSuggestion();
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
              clearSuggestion();
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
                  clearSuggestion();
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
                  clearSuggestion();
                }}
                placeholder="UF"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={2}
              />
            </FormField>
          </View>
        </View>

        <AddressPinSection
          pinState={pinState}
          canLookup={canLookup}
          isLookingUp={lookupAddress.isPending}
          isSuggesting={autoSuggest.isPending}
          onLookup={handleLookup}
          onPinMoved={handlePinMoved}
        />

        {divergenceWarning ? (
          <Text variant="labelLg" color={colors.error}>
            {divergenceWarning}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {saveHint ? (
          <Text variant="labelSm" color={colors.neutral[500]}>
            {saveHint}
          </Text>
        ) : null}
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
  notice: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.neutral[100],
  },
  footer: { paddingTop: spacing[6], gap: spacing[2] },
});
