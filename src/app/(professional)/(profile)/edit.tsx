import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Input, Text } from '@/components/ui';
import { AvatarEditor } from '@/components/forms/AvatarEditor';
import { FormField } from '@/components/forms/FormField';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useUpdateProfessionalProfile } from '@/lib/hooks/useProfessionalManagement';
import { useUpdateProfile } from '@/lib/hooks/useUsers';
import { useGoBack } from '@/lib/navigation/back-history';
import { maskPhone, phoneToInput, unmask } from '@/lib/utils/masks';
import { toast } from '@/lib/utils/toast';
import { colors, spacing } from '@/theme';

export default function EditProfessionalProfileScreen() {
  const goBack = useGoBack();
  const { user } = useAuth();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const updateUserProfile = useUpdateProfile();
  const updateProfile = useUpdateProfessionalProfile(profile?.id ?? '');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [baseHourlyRate, setBaseHourlyRate] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPhone(phoneToInput(user?.phone));
  }, [user?.email, user?.name, user?.phone]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '');
      setYearsOfExperience(profile.yearsOfExperience?.toString() ?? '');
      setBaseHourlyRate(profile.baseHourlyRate?.toString() ?? '');
    }
  }, [profile]);

  if (profileQuery.isLoading) return <LoadingScreen />;
  if (profileQuery.isError) return <ErrorState message="Erro ao carregar perfil." onRetry={() => profileQuery.refetch()} />;

  async function handleSave() {
    const phoneDigits = unmask(phone);
    if (phoneDigits && phoneDigits.length < 10) {
      toast.error('Informe um telefone válido com DDD.');
      return;
    }

    try {
      await updateUserProfile.mutateAsync({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        // Só envia o telefone se mudou: os já salvos podem estar em outro formato (ex.: +55...).
        phone: phoneDigits && phoneDigits !== unmask(phoneToInput(user?.phone)) ? phoneDigits : undefined,
      });

      await updateProfile.mutateAsync({
        bio: bio.trim() || undefined,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
        baseHourlyRate: baseHourlyRate ? parseFloat(baseHourlyRate.replace(',', '.')) : undefined,
      });

      goBack();
    } catch {
      // O aviso de erro já é mostrado pelos hooks; a tela fica aberta para tentar de novo.
    }
  }

  const isSaving = updateUserProfile.isPending || updateProfile.isPending;

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Header title="Editar perfil" showBack />

      <AvatarEditor name={name} />

      <View style={styles.form}>
        <FormField label="Nome completo">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
          />
        </FormField>

        <FormField label="E-mail">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FormField>

        <FormField label="Telefone">
          <Input
            value={phone}
            onChangeText={(value) => setPhone(maskPhone(value))}
            maxLength={15}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField label="Bio">
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre você..."
            multiline
            numberOfLines={3}
          />
        </FormField>

        <FormField label="Anos de experiência">
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
        loading={isSaving}
      >
        Salvar alteracoes
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing[6] },
  form: { gap: spacing[4] },
});
