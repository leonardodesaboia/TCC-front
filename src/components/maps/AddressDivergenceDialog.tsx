import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button, Text } from '@/components/ui';
import { fieldLabel, type AddressDivergence } from '@/lib/utils/address-fill';
import { colors, radius, spacing } from '@/theme';

interface AddressDivergenceDialogProps {
  visible: boolean;
  divergence: AddressDivergence | null;
  /** Endereço escrito, já formatado — é o que o profissional vai ler no pedido. */
  writtenAddress: string;
  saving?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação antes de salvar um endereço cujo texto não bate com o ponto do mapa.
 * Deixa claro o papel de cada um: o ponto decide quem é avisado; o texto é o que o
 * profissional lê para chegar lá. Salvar assim é permitido — às vezes o mapa está errado.
 */
export function AddressDivergenceDialog({
  visible,
  divergence,
  writtenAddress,
  saving = false,
  onConfirm,
  onCancel,
}: AddressDivergenceDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.titleRow}>
              <AlertTriangle color={colors.warning} size={22} />
              <Text variant="titleLg" style={styles.flex1}>
                Endereço e mapa não batem
              </Text>
            </View>

            <Text variant="bodySm" color={colors.neutral[600]}>
              O ponto que você marcou no mapa parece ficar em outro lugar do que o endereço escrito.
            </Text>

            {divergence ? (
              <View style={styles.diffBox}>
                {divergence.fields.map((field) => (
                  <View key={field} style={styles.diffRow}>
                    <Text variant="labelLg" color={colors.neutral[700]}>
                      {fieldLabel(field).charAt(0).toUpperCase() + fieldLabel(field).slice(1)}
                    </Text>
                    <Text variant="labelLg" color={colors.neutral[600]}>
                      Você escreveu: {divergence.typed[field] || '—'}
                    </Text>
                    <Text variant="labelLg" color={colors.neutral[600]}>
                      No mapa: {divergence.suggested[field] || '—'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.usage}>
              <Text variant="titleSm">Como o app vai usar este endereço</Text>
              <Text variant="labelLg" color={colors.neutral[600]}>
                • <Text variant="labelLg" color={colors.neutral[800]}>Ponto do mapa:</Text> é a localização
                usada para encontrar e avisar os profissionais a até 5 km.
              </Text>
              <Text variant="labelLg" color={colors.neutral[600]}>
                • <Text variant="labelLg" color={colors.neutral[800]}>Endereço escrito:</Text> é o que o
                profissional vê no pedido para chegar até você:
              </Text>
              <Text variant="labelLg" color={colors.neutral[800]} style={styles.written}>
                {writtenAddress}
              </Text>
            </View>

            <Text variant="labelLg" color={colors.neutral[600]}>
              Se os dois são o mesmo local, pode salvar. Se não, revise o pin ou corrija o endereço.
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <Button variant="primary" size="lg" onPress={onConfirm} loading={saving}>
              Salvar mesmo assim
            </Button>
            <Button variant="ghost" size="lg" onPress={onCancel} disabled={saving}>
              Revisar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing[4],
  },
  card: {
    maxHeight: '90%',
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing[4],
    gap: spacing[3],
  },
  content: { gap: spacing[3] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  flex1: { flex: 1 },
  diffBox: {
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  diffRow: { gap: 2 },
  usage: { gap: spacing[2] },
  written: {
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  actions: { gap: spacing[2] },
});
