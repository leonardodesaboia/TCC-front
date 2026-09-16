import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { AddressPinSection } from '@/components/maps/AddressPinSection';
import { useCreateAddress, useLookupAddress, useReverseGeocode } from '@/lib/hooks/useAddresses';
import { useAddressPin } from '@/lib/hooks/useAddressPin';
import { compareWithGeocoded, describeFields } from '@/lib/utils/address-fill';
import { maskZipCode, normalizeStateCode, normalizeZipCode } from '@/lib/utils/address-format';
import type { GeocodedAddress } from '@/types/address';
import { spacing, colors } from '@/theme';

/** Espera a pessoa parar de arrastar o pin antes de consultar o endereço. */
const REVERSE_DEBOUNCE_MS = 700;

/** Espera a digitação assentar antes de buscar o endereço sozinho. */
const AUTO_LOOKUP_DEBOUNCE_MS = 900;

export default function NewAddressScreen() {
  const router = useRouter();
  const createAddress = useCreateAddress();
  const lookupAddress = useLookupAddress();
  // Busca automática não pede toast: a pessoa não pediu essa consulta.
  const autoSuggest = useLookupAddress({ silent: true });
  const reverseGeocode = useReverseGeocode();
  const pinState = useAddressPin();

  const [label, setLabel] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [divergenceWarning, setDivergenceWarning] = useState<string | null>(null);

  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoLookupKeyRef = useRef<string | null>(null);
  const formRef = useRef({ street, number, district, city, state, zipCode });
  formRef.current = { street, number, district, city, state, zipCode };

  const hasRequiredAddressFields =
    normalizeZipCode(zipCode).length === 9 &&
    street.trim().length > 0 &&
    number.trim().length > 0 &&
    district.trim().length > 0 &&
    city.trim().length > 0 &&
    normalizeStateCode(state).length === 2;

  // Mesma regra do `isUsable()` do GeocodeRequest: CEP sozinho basta, ou rua + cidade.
  // O botão fica disponível bem antes do formulário completo, para quem quer ver
  // onde fica antes de digitar o resto.
  const canLookup =
    normalizeZipCode(zipCode).length === 9 || (street.trim().length > 0 && city.trim().length > 0);

  // A busca automática só entra com o formulário completo, e uma vez por endereço.
  const autoLookupKey = hasRequiredAddressFields
    ? [normalizeZipCode(zipCode), street.trim(), number.trim(), district.trim(), city.trim(), normalizeStateCode(state)]
        .join('|')
        .toLowerCase()
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
    setDivergenceWarning(null);
  }

  /**
   * Aplica o endereço vindo do mapa: preenche só o que está vazio e avisa sobre
   * divergências. Nunca troca o que a pessoa digitou.
   */
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
    } catch {
      // O hook ja apresenta o erro via toast.
    }
  }

  /**
   * Assim que o formulário fica completo, busca sozinho e abre o mapa no lugar
   * certo — a pessoa só aproxima. Não é autocomplete: dispara uma vez por endereço
   * distinto, e só quando já há dados suficientes.
   *
   * Não roda quando a pessoa já escolheu o ponto pelo GPS ou pelo dedo: sugestão
   * não sobrescreve decisão de quem estava lá.
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

    await createAddress.mutateAsync({
      label: label.trim(),
      zipCode: normalizeZipCode(zipCode),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      district: district.trim(),
      city: city.trim(),
      state: normalizeStateCode(state),
      ...coordinatePayload,
      isDefault: false,
    });

    router.back();
  }

  return (
    <Screen edges={['top']}>
      <Header title="Novo endereço" showBack />

      <View style={styles.form}>
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
          loading={createAddress.isPending}
        >
          Salvar endereço
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
  footer: { paddingTop: spacing[6], gap: spacing[2] },
});
