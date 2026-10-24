import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui';
import { AvatarEditor } from '@/components/forms/AvatarEditor';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';
import { useUpdateProfile } from '@/lib/hooks/useUsers';
import { useGoBack } from '@/lib/navigation/back-history';
import { maskPhone, phoneToInput, unmask } from '@/lib/utils/masks';
import { toast } from '@/lib/utils/toast';
import { useAuth } from '@/providers/AuthProvider';
import { spacing } from '@/theme';

export default function EditProfileScreen() {
  const goBack = useGoBack();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // O usuário pode chegar depois da primeira renderização; os campos acompanham.
  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPhone(phoneToInput(user?.phone));
  }, [user?.email, user?.name, user?.phone]);

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const phoneDigits = unmask(phone);

    if (!trimmedName) {
      toast.error('Informe seu nome.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      toast.error('Informe um e-mail válido.');
      return;
    }
    if (phoneDigits && phoneDigits.length < 10) {
      toast.error('Informe um telefone válido com DDD.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: trimmedName,
        email: trimmedEmail,
        // Só envia o telefone se mudou: os já salvos podem estar em outro formato (ex.: +55...).
        phone: phoneDigits && phoneDigits !== unmask(phoneToInput(user?.phone)) ? phoneDigits : undefined,
      });
      goBack();
    } catch {
      // O aviso de erro já é mostrado pelo hook.
    }
  }

  return (
    <Screen edges={['top']}>
      <Header title="Editar perfil" showBack />

      <AvatarEditor name={name} />

      {/* Form */}
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
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </FormField>

      </View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={handleSave} loading={updateProfile.isPending}>
          Salvar alterações
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  footer: { paddingTop: spacing[6] },
});
