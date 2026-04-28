import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/lib/hooks/useAddresses';
import { colors, radius, spacing } from '@/theme';

export default function AddressesScreen() {
  const router = useRouter();
  const addressesQuery = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  if (addressesQuery.isLoading) {
    return <LoadingScreen message="Carregando endereços..." />;
  }

  if (addressesQuery.isError) {
    return <ErrorState message="Não foi possível carregar seus endereços." onRetry={() => addressesQuery.refetch()} />;
  }

  const addresses = addressesQuery.data ?? [];

  return (
    <Screen edges={['top']}>
      <Header title="Meus endereços" showBack />

      {addresses.length > 0 ? (
        <View style={styles.list}>
          {addresses.map((address, index) => (
            <View key={address.id}>
              <Pressable
                onPress={() => {
                  if (!address.isDefault) {
                    setDefaultAddress.mutate(address.id);
                  }
                }}
                style={styles.addressCard}
              >
                <View style={styles.iconCol}>
                  <MapPin color={address.isDefault ? colors.primary.default : colors.neutral[400]} size={20} />
                </View>

                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text variant="titleSm">{address.label}</Text>
                    {address.isDefault ? <Badge label="Padrão" variant="default" /> : null}
                  </View>
                  <Text variant="bodySm" color={colors.neutral[600]}>
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ''}
                  </Text>
                  <Text variant="labelLg" color={colors.neutral[500]}>
                    {address.district} · {address.city} - {address.state}
                  </Text>
                  {!address.isDefault ? (
                    <Text variant="labelSm" color={colors.primary.default}>
                      Toque para definir como padrão
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actions}>
                  <Pressable hitSlop={8} onPress={() => setDefaultAddress.mutate(address.id)}>
                    <CheckCircle2 color={colors.neutral[400]} size={18} />
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => deleteAddress.mutate(address.id)}>
                    <Trash2 color={colors.neutral[400]} size={18} />
                  </Pressable>
                </View>
              </Pressable>
              {index < addresses.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={MapPin}
          title="Nenhum endereço cadastrado"
          description="Adicione um endereço com coordenadas para conseguir abrir pedidos Express."
          actionLabel="Adicionar endereço"
          onAction={() => router.push('/(client)/(profile)/addresses/new')}
        />
      )}

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
