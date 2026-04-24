import { StyleSheet, View } from 'react-native';
import { ProfessionalCard, type SearchProfessional } from './ProfessionalCard';
import { spacing } from '@/theme';

interface ProfessionalListProps {
  professionals: SearchProfessional[];
  onPressProfessional?: (professionalId: string) => void;
}

export function ProfessionalList({
  professionals,
  onPressProfessional,
}: ProfessionalListProps) {
  return (
    <View style={styles.list}>
      {professionals.map((professional) => (
        <ProfessionalCard
          key={professional.id}
          professional={professional}
          onPress={() => onPressProfessional?.(professional.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
  },
});
