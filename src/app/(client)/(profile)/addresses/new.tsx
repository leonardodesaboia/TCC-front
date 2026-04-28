import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { useCreateAddress } from '@/lib/hooks/useAddresses';
import { spacing, colors } from '@/theme';

export default function NewAddressScreen() {
  const router = useRouter();
  const createAddress = useCreateAddress();

  const [label, setLabel] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const parsedLat = useMemo(() => Number(lat.replace(',', '.')), [lat]);
  const parsedLng = useMemo(() => Number(lng.replace(',', '.')), [lng]);

  const canSave =
    label.trim().length > 0 &&
    zipCode.trim().length > 0 &&
    street.trim().length > 0 &&
    number.trim().length > 0 &&
    district.trim().length > 0 &&
    city.trim().length > 0 &&
    state.trim().length === 2 &&
    lat.trim().length > 0 &&
    lng.trim().length > 0 &&
    !Number.isNaN(parsedLat) &&
    !Number.isNaN(parsedLng);

  async function handleSave() {
    if (!canSave) return;

    await createAddress.mutateAsync({
      label: label.trim(),
      zipCode: zipCode.trim(),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      district: district.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      lat: parsedLat,
      lng: parsedLng,
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
          <Input value={zipCode} onChangeText={setZipCode} placeholder="00000-000" keyboardType="numeric" />
        </FormField>

        <FormField label="Rua">
          <Input value={street} onChangeText={setStreet} placeholder="Nome da rua" />
        </FormField>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <FormField label="Número">
              <Input value={number} onChangeText={setNumber} placeholder="Nº" />
            </FormField>
          </View>
          <View style={styles.flex2}>
            <FormField label="Complemento">
              <Input value={complement} onChangeText={setComplement} placeholder="Apto, bloco..." />
            </FormField>
          </View>
        </View>

        <FormField label="Bairro">
          <Input value={district} onChangeText={setDistrict} placeholder="Bairro" />
        </FormField>

        <View style={styles.row}>
          <View style={styles.flex2}>
            <FormField label="Cidade">
              <Input value={city} onChangeText={setCity} placeholder="Cidade" />
            </FormField>
          </View>
          <View style={styles.flex1}>
            <FormField label="Estado">
              <Input value={state} onChangeText={setState} placeholder="UF" autoCapitalize="characters" maxLength={2} />
            </FormField>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <FormField label="Latitude">
              <Input value={lat} onChangeText={setLat} placeholder="-3.731862" keyboardType="decimal-pad" />
            </FormField>
          </View>
          <View style={styles.flex1}>
            <FormField label="Longitude">
              <Input value={lng} onChangeText={setLng} placeholder="-38.526669" keyboardType="decimal-pad" />
            </FormField>
          </View>
        </View>

        <Text variant="labelSm" color={colors.neutral[500]}>
          O backend exige latitude e longitude para pedidos Express.
        </Text>
      </View>

      <View style={styles.footer}>
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
  footer: { paddingTop: spacing[6] },
});
