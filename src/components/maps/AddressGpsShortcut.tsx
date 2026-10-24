import { StyleSheet, View } from 'react-native';
import { Crosshair } from 'lucide-react-native';
import { Button, Text } from '@/components/ui';
import type { CurrentPositionStatus } from '@/lib/hooks/useCurrentPosition';
import { colors, radius, spacing } from '@/theme';

interface AddressGpsShortcutProps {
  onPress: () => void;
  loading: boolean;
  gpsStatus: CurrentPositionStatus;
  /** `true` depois que o GPS preencheu o formulário. */
  filled: boolean;
}

/**
 * Atalho no topo do formulário de endereço: quem está no local do atendimento marca
 * o ponto e preenche os campos de uma vez, em vez de digitar tudo e só depois achar
 * o botão lá embaixo.
 */
export function AddressGpsShortcut({ onPress, loading, gpsStatus, filled }: AddressGpsShortcutProps) {
  return (
    <View style={styles.card}>
      <Text variant="titleSm">Está no local do atendimento?</Text>
      <Text variant="labelLg" color={colors.neutral[500]}>
        Use sua localização para marcar o ponto no mapa e preencher o endereço.
      </Text>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<Crosshair color={colors.primary.default} size={18} />}
        onPress={onPress}
        loading={loading}
      >
        Usar minha localização
      </Button>

      {filled ? (
        <Text variant="labelLg" color={colors.success}>
          Preenchemos o que encontramos. Confira o número e o complemento.
        </Text>
      ) : null}

      {gpsStatus === 'denied' ? (
        <Text variant="labelLg" color={colors.neutral[500]}>
          Sem acesso à localização. Sem problema: preencha os campos e marque o ponto no mapa abaixo.
        </Text>
      ) : null}

      {gpsStatus === 'error' ? (
        <Text variant="labelLg" color={colors.neutral[500]}>
          Não foi possível ler o GPS agora. Preencha os campos e marque o ponto no mapa abaixo.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.light,
  },
});
