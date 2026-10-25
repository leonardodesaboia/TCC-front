import { StyleSheet, View } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { FormField } from './FormField';
import { durationInMinutes, type DurationParts } from '@/lib/utils/duration-input';
import { formatDuration } from '@/lib/utils/formatters';
import { colors, spacing } from '@/theme';

export function DurationInput({ value, onChange }: { value: DurationParts; onChange: (value: DurationParts) => void }) {
  const total = durationInMinutes(value);
  return (
    <FormField label="Duração estimada">
      <View style={styles.row}>
        <View style={styles.part}><FormField label="Horas"><Input value={value.hours} onChangeText={(hours) => onChange({ ...value, hours })} keyboardType="number-pad" placeholder="Ex.: 3" /></FormField></View>
        <View style={styles.part}><FormField label="Minutos"><Input value={value.minutes} onChangeText={(minutes) => onChange({ ...value, minutes })} keyboardType="number-pad" placeholder="Ex.: 30" maxLength={2} /></FormField></View>
      </View>
      <Text variant="bodySm" color={colors.neutral[600]} accessibilityLiveRegion="polite" aria-live="polite">
        {Number(value.minutes) >= 60 ? 'Use de 0 a 59 no campo Minutos. Para 60 minutos, informe 1 hora.' : total > 0 ? `Duração total: ${formatDuration(total)}.` : 'Informe o tempo previsto em horas e minutos. Ex.: 3 horas e 30 minutos.'}
      </Text>
    </FormField>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }, part: { flex: 1, minWidth: 100 } });
