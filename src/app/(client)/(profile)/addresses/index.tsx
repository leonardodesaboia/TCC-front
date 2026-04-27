import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Edit2, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

interface Address {
  id: string;
  label: string;
  street: string;
  neighborhood: string;
  city: string;
  isDefault: boolean;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'a1',
    label: 'Casa',
    street: 'Rua das Flores, 123, Apt 401',
    neighborhood: 'Centro',
    city: 'Fortaleza - CE',
    isDefault: true,
  },
  {
    id: 'a2',
    label: 'Trabalho',
    street: 'Av. Santos Dumont, 1500, Sala 302',
    neighborhood: 'Aldeota',
    city: 'Fortaleza - CE',
    isDefault: false,
  },
  {
    id: 'a3',
    label: 'Casa da mãe',
    street: 'Rua José Bonifácio, 456',
    neighborhood: 'Benfica',
    city: 'Fortaleza - CE',
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top']}>
      <Header title="Meus endereços" showBack />

      <View style={styles.list}>
        {MOCK_ADDRESSES.map((a, i) => (
          <View key={a.id}>
            <View style={styles.addressCard}>
              <View style={styles.iconCol}>
                <MapPin color={a.isDefault ? colors.primary.default : colors.neutral[400]} size={20} />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.labelRow}>
                  <Text variant="titleSm">{a.label}</Text>
                  {a.isDefault ? <Badge label="Padrão" variant="default" /> : null}
                </View>
                <Text variant="bodySm" color={colors.neutral[600]}>{a.street}</Text>
                <Text variant="labelLg" color={colors.neutral[500]}>{a.neighborhood} · {a.city}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable hitSlop={8} onPress={() => {}}>
                  <Edit2 color={colors.neutral[400]} size={18} />
                </Pressable>
                <Pressable hitSlop={8} onPress={() => {}}>
                  <Trash2 color={colors.neutral[400]} size={18} />
                </Pressable>
              </View>
            </View>
            {i < MOCK_ADDRESSES.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<Plus color={colors.primary.default} size={20} />}
          onPress={() => router.push('/(client)/(profile)/addresses/new')}
        >
          Adicionar endereço
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
  },
  addressCard: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
  },
  iconCol: { paddingTop: 2 },
  addressInfo: { flex: 1, gap: spacing[1] },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  actions: { gap: spacing[3], justifyContent: 'center' },
  footer: { paddingTop: spacing[6] },
});
