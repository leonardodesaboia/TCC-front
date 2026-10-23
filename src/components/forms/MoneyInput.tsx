import { StyleSheet, View } from 'react-native';
import { Input, Text } from '@/components/ui';
import { formatMoney } from '@/lib/utils/formatters';
import { maskMoney, parseMoney } from '@/lib/utils/masks';
import { colors, spacing } from '@/theme';

/** Abaixo deste valor o campo mostra um aviso para a pessoa conferir o que digitou. */
const LOW_VALUE_WARNING = 10;

interface MoneyInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: boolean;
}

/**
 * Campo de valor em reais. O texto digitado é lido como reais (não como centavos),
 * o prefixo "R$" fica sempre visível e valores muito baixos geram um aviso.
 */
export function MoneyInput({ value, onChangeText, placeholder = 'Ex: 120', editable, error }: MoneyInputProps) {
  const amount = parseMoney(value);

  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={(text) => onChangeText(maskMoney(text))}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        editable={editable}
        error={error}
        leftIcon={<Text variant="bodyLg" color={colors.neutral[600]}>R$</Text>}
      />
      {amount !== null && amount < LOW_VALUE_WARNING ? (
        <Text variant="labelLg" color={colors.warning}>
          Confira: o valor ficou {formatMoney(amount)}. Para centavos, use vírgula (ex: 120,50).
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
});
