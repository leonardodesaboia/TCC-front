import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useUpdateProfessionalProfile } from '@/lib/hooks/useProfessionalManagement';
import { colors, spacing } from '@/theme';

export default function EditProfessionalProfileScreen() {
  const { user } = useAuth();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const updateProfile = useUpdateProfessionalProfile(profile?.id ?? '');

  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [baseHourlyRate, setBaseHourlyRate] = useState('');

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '');
      setYearsOfExperience(profile.yearsOfExperience?.toString() ?? '');
      setBaseHourlyRate(profile.baseHourlyRate?.toString() ?? '');
    }
  }, [profile]);

  if (profileQuery.isLoading) return <LoadingScreen />;
  if (profileQuery.isError) return <ErrorState message="Erro ao carregar perfil." onRetry={() => profileQuery.refetch()} />;

  function handleSave() {
    updateProfile.mutate({
      bio: bio || undefined,
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
      baseHourlyRate: baseHourlyRate ? parseFloat(baseHourlyRate.replace(',', '.')) : undefined,
    });
  }

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Header title="Editar perfil" showBack />

      <View style={styles.form}>
        <View style={styles.field}>
          <Text variant="labelLg" color={colors.neutral[500]}>Nome</Text>
          <Text variant="bodySm">{user?.name ?? '-'}</Text>
        </View>

        <View style={styles.field}>
          <Text variant="labelLg" color={colors.neutral[500]}>E-mail</Text>
          <Text variant="bodySm">{user?.email ?? '-'}</Text>
        </View>

        <FormField label="Bio">
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre voce..."
            multiline
            numberOfLines={3}
          />
        </FormField>

        <FormField label="Anos de experiencia">
          <Input
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            placeholder="Ex: 5"
            keyboardType="numeric"
          />
        </FormField>

        <FormField label="Valor/hora base (R$)">
          <Input
            value={baseHourlyRate}
            onChangeText={setBaseHourlyRate}
            placeholder="Ex: 80"
            keyboardType="numeric"
          />
        </FormField>
      </View>

      <Button
        onPress={handleSave}
        loading={updateProfile.isPending}
      >
        Salvar alteracoes
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing[6] },
  form: { gap: spacing[4] },
  field: { gap: spacing[1] },
});
