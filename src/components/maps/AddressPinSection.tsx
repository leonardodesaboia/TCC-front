import { StyleSheet, View } from 'react-native';
import { Crosshair, LocateFixed, MapPin } from 'lucide-react-native';
import { Button, Text } from '@/components/ui';
import { PinLocationPicker } from '@/components/maps/PinLocationPicker';
import type { useAddressPin } from '@/lib/hooks/useAddressPin';
import { colors, spacing } from '@/theme';

interface AddressPinSectionProps {
  pinState: ReturnType<typeof useAddressPin>;
  /** Habilita o botão de sugestão. Basta CEP, ou rua + cidade — é o que a API exige. */
  canLookup: boolean;
  isLookingUp: boolean;
  /** `true` enquanto a busca automática (formulário completo) está rodando. */
  isSuggesting?: boolean;
  onLookup: () => void;
  onPinMoved?: (coordinates: { lat: number; lng: number }) => void;
}

/**
 * Seção de escolha do ponto no mapa, compartilhada pelas telas de novo endereço e
 * de edição.
 *
 * <p>Ordem dos botões é intencional: o GPS vem primeiro porque acerta o local sem
 * pedir nada da pessoa; a sugestão pelo endereço escrito vem por último porque é
 * a menos confiável das três — e agora diz quando o resultado é aproximado, em vez
 * de apresentar um chute como se fosse endereço confirmado.
 *
 * <p>Com o formulário completo, a sugestão já veio sozinha e o mapa abriu no lugar
 * certo. O botão continua existindo para quem digitou só o CEP e não quer preencher
 * o resto antes de ver onde fica, e para pedir a sugestão de novo depois de editar.
 */
export function AddressPinSection({
  pinState,
  canLookup,
  isLookingUp,
  isSuggesting = false,
  onLookup,
  onPinMoved,
}: AddressPinSectionProps) {
  const { pin, mapCenter, isMapOpen, origin } = pinState;

  function handlePinChange(coordinates: { lat: number; lng: number }) {
    pinState.moveTo(coordinates);
    onPinMoved?.(coordinates);
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <MapPin color={colors.neutral[700]} size={18} />
        <View style={styles.flex1}>
          <Text variant="titleSm">Localização no mapa</Text>
          <Text variant="labelLg" color={colors.neutral[500]}>
            Este ponto define quais profissionais são avisados num raio de 300 metros.
            Marque a entrada do local do atendimento.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<Crosshair color={colors.primary.default} size={18} />}
          onPress={() => void pinState.captureFromGps()}
          loading={pinState.isCapturingGps}
        >
          Usar minha localização
        </Button>

        <View style={styles.secondaryActions}>
          <View style={styles.flex1}>
            <Button variant="ghost" size="md" onPress={pinState.openMap}>
              {isMapOpen ? 'Ajustar no mapa' : 'Escolher no mapa'}
            </Button>
          </View>
          <View style={styles.flex1}>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<LocateFixed color={colors.primary.default} size={18} />}
              onPress={onLookup}
              disabled={!canLookup}
              loading={isLookingUp}
            >
              Sugerir pelo endereço
            </Button>
          </View>
        </View>
      </View>

      {isSuggesting ? (
        <Text variant="labelSm" color={colors.neutral[500]}>
          Procurando este endereço no mapa...
        </Text>
      ) : null}

      {pinState.gpsStatus === 'denied' ? (
        <Text variant="labelLg" color={colors.neutral[500]}>
          Sem acesso à localização. Sem problema: marque o ponto no mapa ou use a sugestão
          pelo endereço.
        </Text>
      ) : null}

      {pinState.gpsStatus === 'error' ? (
        <Text variant="labelLg" color={colors.neutral[500]}>
          Não foi possível ler o GPS agora. Marque o ponto no mapa.
        </Text>
      ) : null}

      {isMapOpen ? (
        <View style={styles.mapResult}>
          <PinLocationPicker
            value={pin ?? mapCenter}
            onChange={handlePinChange}
            confirmed={!!pin && !!origin}
          />

          {pinState.isSuggestionApproximate ? (
            <Text variant="labelSm" color={colors.error}>
              Achamos a rua ({pinState.lookupDisplayName}), mas não o ponto exato.
              Toque ou arraste o pin até o local do atendimento.
            </Text>
          ) : !pin || !origin ? (
            <Text variant="labelSm" color={colors.neutral[500]}>
              Toque ou arraste até o ponto exato para confirmar.
            </Text>
          ) : null}

          {origin === 'lookup' && pinState.lookupDisplayName ? (
            <Text variant="labelSm" color={colors.neutral[500]}>
              Encontramos {pinState.lookupDisplayName}. Ajuste o pin se o atendimento
              for em outra entrada.
            </Text>
          ) : null}

          {origin === 'gps' ? (
            <Text variant="labelSm" color={colors.neutral[500]}>
              Ponto capturado pelo GPS. Ajuste se você não estiver no local exato.
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyMap}>
          <MapPin color={colors.neutral[400]} size={22} />
          <Text variant="labelLg" color={colors.neutral[500]}>
            Use o GPS ou abra o mapa e toque no ponto do atendimento.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3], paddingTop: spacing[2] },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  flex1: { flex: 1 },
  actions: { gap: spacing[2] },
  secondaryActions: { flexDirection: 'row', gap: spacing[3] },
  mapResult: { gap: spacing[2] },
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
});
