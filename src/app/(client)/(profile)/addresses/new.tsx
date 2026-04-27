import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { spacing } from '@/theme';

export default function NewAddressScreen() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  return (
    <Screen edges={['top']}>
      <Header title="Novo endereço" showBack />

      <View style={styles.form}>
        <FormField label="Apelido (ex: Casa, Trabalho)">
          <Input
            value={label}
            onChangeText={setLabel}
            placeholder="Ex: Casa"
          />
        </FormField>

        <FormField label="CEP">
          <Input
            value={cep}
            onChangeText={setCep}
            placeholder="00000-000"
            keyboardType="numeric"
          />
        </FormField>

        <FormField label="Rua">
          <Input
            value={street}
            onChangeText={setStreet}
            placeholder="Nome da rua"
          />
        </FormField>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <FormField label="Número">
              <Input
                value={number}
                onChangeText={setNumber}
                placeholder="Nº"
                keyboardType="numeric"
              />
            </FormField>
          </View>
          <View style={styles.flex2}>
            <FormField label="Complemento">
              <Input
                value={complement}
                onChangeText={setComplement}
                placeholder="Apt, bloco..."
              />
            </FormField>
          </View>
        </View>

        <FormField label="Bairro">
          <Input
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Bairro"
          />
        </FormField>

        <View style={styles.row}>
          <View style={styles.flex2}>
            <FormField label="Cidade">
              <Input
                value={city}
                onChangeText={setCity}
                placeholder="Cidade"
              />
            </FormField>
          </View>
          <View style={styles.flex1}>
            <FormField label="Estado">
              <Input
                value={state}
                onChangeText={setState}
                placeholder="UF"
                autoCapitalize="characters"
              />
            </FormField>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={() => router.back()}>
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
